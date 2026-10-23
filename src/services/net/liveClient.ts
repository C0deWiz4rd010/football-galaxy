/**
 * Central live-data fetch client.
 *
 * Every live provider (football-data.org, TheSportsDB, ESPN, OpenLigaDB) routes
 * its requests through {@link fetchLiveJson} so the whole app shares one
 * reliability layer:
 *
 * - **Dedupe** — concurrent identical GET requests share a single in-flight
 *   promise, so rapid navigation never fires the same upstream call twice.
 * - **Concurrency limit** — at most `maxConcurrent` requests run at once; the
 *   rest queue. This keeps bursty navigation from hammering the free tiers.
 * - **Per-host rate limit** — a sliding window per host (football-data.org's
 *   free tier allows 10 requests per minute).
 * - **Retry with backoff** — 5xx and network errors are retried with
 *   exponential backoff. A 429 is retried only when the upstream says the
 *   limit resets within a few seconds (`Retry-After` / football-data's
 *   `X-RequestCounter-Reset`); otherwise it fails fast instead of burning
 *   retries that cannot succeed. Caller aborts are never retried.
 * - **Timeout** — every attempt is aborted after `timeoutMs` so a hung upstream
 *   cannot hold a concurrency slot forever.
 *
 * The proxy owns the API keys, the shared upstream budget and a server cache
 * (proxy/SPEC.md); this client is the browser-side complement that prevents us
 * from reaching the proxy more often than we have to. When the proxy answers
 * with a stored copy because the upstream failed, `wasServedStale` reports it.
 */

import { buildLiveRequestUrl } from '@/services/config/liveProxy'

export interface FetchLiveOptions {
  /** Extra request init forwarded to `fetch` (headers, signal, method…). */
  init?: RequestInit
  /** Skip in-flight dedupe (use for non-idempotent requests). Default false. */
  noDedupe?: boolean
  /** Max retry attempts on transient failure. Default 2. */
  maxRetries?: number
  /** Per-attempt timeout in ms. Default 12s. */
  timeoutMs?: number
  /** Injectable fetch implementation (tests). Defaults to global `fetch`. */
  fetchImpl?: typeof fetch
}

/** Upstream answered with a non-retryable HTTP status (e.g. 404). */
export class LiveHttpError extends Error {
  readonly status: number

  constructor(status: number, host: string) {
    super(`Live request failed (${status}) for ${host || 'upstream'}`)
    this.name = 'LiveHttpError'
    this.status = status
  }
}

const DEFAULT_MAX_CONCURRENT = 6
const DEFAULT_MAX_RETRIES = 2
const DEFAULT_TIMEOUT_MS = 12_000
const RETRY_BASE_MS = 500
const RETRY_MAX_MS = 8000

/**
 * Per-host request budget: at most `limit` request starts per `windowMs`.
 * Hosts not listed are unthrottled. Short bursts stay fast (the proxy cache
 * answers many of them); the 11th call within a minute waits for the window.
 */
const HOST_RATE_LIMIT: Record<string, { limit: number; windowMs: number }> = {
  'api.football-data.org': { limit: 10, windowMs: 60_000 },
}

const inFlight = new Map<string, Promise<unknown>>()
/** Targets whose last answer was the proxy's stored copy (`x-proxy-cache: stale`). */
const staleTargets = new Set<string>()
/** Reserved start times per rate-limited host, oldest first. */
const hostStarts = new Map<string, number[]>()

let active = 0
const waiters: Array<() => void> = []

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

/** Acquire a concurrency slot, resolving once one is free. */
function acquireSlot(): Promise<void> {
  if (active < DEFAULT_MAX_CONCURRENT) {
    active += 1
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => {
    waiters.push(() => {
      active += 1
      resolve()
    })
  })
}

function releaseSlot(): void {
  active -= 1
  const next = waiters.shift()
  if (next) next()
}

/**
 * Reserve a start time inside the host's sliding window and wait for it. The
 * slot is reserved synchronously so concurrent callers queue up behind each
 * other, and the wait happens *before* a concurrency slot is taken so a
 * rate-limited host never blocks requests to other hosts.
 */
async function respectHostThrottle(host: string): Promise<void> {
  const rule = HOST_RATE_LIMIT[host]
  if (!rule) return
  const now = Date.now()
  const starts = (hostStarts.get(host) ?? []).filter((start) => start > now - rule.windowMs)
  // With `limit` starts in the window, the next may begin one window after
  // the start `limit` places back.
  const blocking = starts.length >= rule.limit ? starts[starts.length - rule.limit] : undefined
  const nextStart = blocking === undefined ? now : Math.max(now, blocking + rule.windowMs)
  starts.push(nextStart)
  hostStarts.set(host, starts)
  if (nextStart > now) await delay(nextStart - now)
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/** Runs one fetch with a timeout, chaining the caller's abort signal. */
async function fetchWithTimeout(
  doFetch: typeof fetch,
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const callerSignal = init?.signal
  if (callerSignal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const onCallerAbort = () => controller.abort()
  callerSignal?.addEventListener('abort', onCallerAbort, { once: true })
  const timer = setTimeout(() => controller.abort(new DOMException('Timeout', 'TimeoutError')), timeoutMs)
  try {
    return await doFetch(url, { ...init, signal: controller.signal })
  } catch (error) {
    if (controller.signal.aborted && !callerSignal?.aborted) {
      throw new Error(`Live request timed out after ${timeoutMs} ms`)
    }
    throw error
  } finally {
    clearTimeout(timer)
    callerSignal?.removeEventListener('abort', onCallerAbort)
  }
}

function backoffMs(attempt: number): number {
  const exponential = RETRY_BASE_MS * 2 ** attempt
  const jitter = Math.random() * RETRY_BASE_MS
  return Math.min(exponential + jitter, RETRY_MAX_MS)
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status >= 500
}

/**
 * Wait before retrying a 429, or -1 to give up: only when the upstream names a
 * reset within RETRY_MAX_MS — an immediate retry would just be rejected again.
 */
function rateLimitWaitMs(headers: Headers): number {
  const value = headers.get('retry-after') ?? headers.get('x-requestcounter-reset')
  const seconds = value === null ? Number.NaN : Number(value)
  if (!Number.isFinite(seconds) || seconds < 0) return -1
  return seconds * 1000 <= RETRY_MAX_MS ? seconds * 1000 : -1
}

async function runOnce<T>(
  targetUrl: string,
  options: FetchLiveOptions,
): Promise<T> {
  const doFetch = options.fetchImpl ?? fetch
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const host = hostOf(targetUrl)
  const requestUrl = buildLiveRequestUrl(targetUrl)

  let lastError: unknown = new Error('Request never executed')

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    // -1 means "do not retry"; a value >= 0 is the backoff delay before retry.
    let waitMs = -1
    await respectHostThrottle(host)
    await acquireSlot()
    try {
      const response = await fetchWithTimeout(doFetch, requestUrl, options.init, timeoutMs)

      if (response.ok) {
        if (response.headers.get('x-proxy-cache') === 'stale') staleTargets.add(targetUrl)
        else staleTargets.delete(targetUrl)
        return (await response.json()) as T
      }

      lastError = new LiveHttpError(response.status, host)
      if (attempt < maxRetries) {
        if (response.status === 429) waitMs = rateLimitWaitMs(response.headers)
        else if (isRetryableStatus(response.status)) waitMs = backoffMs(attempt)
      }
    } catch (error) {
      lastError = error
      // A caller abort means nobody wants the result any more.
      if (isAbortError(error)) break
      if (attempt < maxRetries) {
        waitMs = backoffMs(attempt)
      }
    } finally {
      releaseSlot()
    }

    if (waitMs < 0) break
    await delay(waitMs)
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/**
 * Fetch and parse JSON from a live upstream URL through the shared reliability
 * layer. Concurrent identical requests are de-duplicated.
 */
export function fetchLiveJson<T>(
  targetUrl: string,
  options: FetchLiveOptions = {},
): Promise<T> {
  const method = (options.init?.method ?? 'GET').toUpperCase()
  // Requests with their own abort signal are not shared: one caller aborting
  // must not cancel the request for everyone else.
  const canDedupe = !options.noDedupe && method === 'GET' && !options.init?.signal
  const dedupeKey = `${targetUrl}|${JSON.stringify([...new Headers(options.init?.headers).entries()])}`

  if (canDedupe) {
    const existing = inFlight.get(dedupeKey) as Promise<T> | undefined
    if (existing) return existing
  }

  const promise = (async () => {
    try {
      return await runOnce<T>(targetUrl, options)
    } finally {
      if (canDedupe) inFlight.delete(dedupeKey)
    }
  })()

  if (canDedupe) inFlight.set(dedupeKey, promise)
  return promise
}

/** True when the last response for `targetUrl` was a stored copy because the upstream was unavailable. */
export function wasServedStale(targetUrl: string): boolean {
  return staleTargets.has(targetUrl)
}

/** Testing helper — clears dedupe + throttle state between test cases. */
export function __resetLiveClientState(): void {
  inFlight.clear()
  staleTargets.clear()
  hostStarts.clear()
  waiters.length = 0
  active = 0
}
