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
 * - **Per-host throttle** — an optional minimum interval between requests to the
 *   same host (football-data.org is 10 req/min).
 * - **Retry with backoff** — transient failures (429, 5xx, network errors) are
 *   retried with exponential backoff, honouring the upstream `Retry-After`
 *   header when present.
 *
 * The proxy still owns the API keys and its own 60s stale-serving cache; this
 * client is the browser-side complement that prevents us from ever reaching the
 * proxy more often than we have to.
 */

import { buildLiveRequestUrl } from '@/services/config/liveProxy'

export interface FetchLiveOptions {
  /** Extra request init forwarded to `fetch` (headers, signal, method…). */
  init?: RequestInit
  /** Skip in-flight dedupe (use for non-idempotent requests). Default false. */
  noDedupe?: boolean
  /** Max retry attempts on transient failure. Default 2. */
  maxRetries?: number
  /** Injectable fetch implementation (tests). Defaults to global `fetch`. */
  fetchImpl?: typeof fetch
}

const DEFAULT_MAX_CONCURRENT = 6
const DEFAULT_MAX_RETRIES = 2
const RETRY_BASE_MS = 500
const RETRY_MAX_MS = 8000

/**
 * Per-host minimum interval (ms) between request *starts*. Hosts not listed
 * here are unthrottled. football-data.org's free tier is 10 req/min, so we
 * space its calls out defensively; the proxy cache absorbs the rest.
 */
const HOST_MIN_INTERVAL_MS: Record<string, number> = {
  'api.football-data.org': 600,
}

const inFlight = new Map<string, Promise<unknown>>()
const lastHostStart = new Map<string, number>()

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

/** Wait out the per-host throttle window before starting a request. */
async function respectHostThrottle(host: string): Promise<void> {
  const minInterval = HOST_MIN_INTERVAL_MS[host]
  if (!minInterval) return
  const last = lastHostStart.get(host) ?? 0
  const wait = last + minInterval - Date.now()
  if (wait > 0) await delay(wait)
  lastHostStart.set(host, Date.now())
}

function backoffMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, RETRY_MAX_MS)
    }
  }
  const exponential = RETRY_BASE_MS * 2 ** attempt
  const jitter = Math.random() * RETRY_BASE_MS
  return Math.min(exponential + jitter, RETRY_MAX_MS)
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500
}

async function runOnce<T>(
  targetUrl: string,
  options: FetchLiveOptions,
): Promise<T> {
  const doFetch = options.fetchImpl ?? fetch
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const host = hostOf(targetUrl)
  const requestUrl = buildLiveRequestUrl(targetUrl)

  let lastError: unknown = new Error('Request never executed')

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    // -1 means "do not retry"; a value >= 0 is the backoff delay before retry.
    let waitMs = -1
    try {
      await acquireSlot()
      await respectHostThrottle(host)
      const response = await doFetch(requestUrl, options.init)

      if (response.ok) {
        return (await response.json()) as T
      }

      lastError = new Error(
        `Live request failed (${response.status}) for ${host || 'upstream'}`,
      )
      if (isRetryableStatus(response.status) && attempt < maxRetries) {
        waitMs = backoffMs(attempt, response.headers.get('retry-after'))
      }
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        waitMs = backoffMs(attempt, null)
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
  const canDedupe = !options.noDedupe && method === 'GET'

  if (canDedupe) {
    const existing = inFlight.get(targetUrl) as Promise<T> | undefined
    if (existing) return existing
  }

  const promise = (async () => {
    try {
      return await runOnce<T>(targetUrl, options)
    } finally {
      if (canDedupe) inFlight.delete(targetUrl)
    }
  })()

  if (canDedupe) inFlight.set(targetUrl, promise)
  return promise
}

/** Testing helper — clears dedupe + throttle state between test cases. */
export function __resetLiveClientState(): void {
  inFlight.clear()
  lastHostStart.clear()
  waiters.length = 0
  active = 0
}
