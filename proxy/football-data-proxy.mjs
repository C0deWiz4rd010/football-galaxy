/**
 * Football Galaxy live-data proxy for local development.
 *
 * Implements proxy/SPEC.md with the shared rules in proxy/rules.json — the
 * same contract as the production PHP proxy (deploy/hostinger/api/live.php),
 * so the app behaves identically in development and on Hostinger. State
 * (cache, rate limits) lives in memory.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const rules = JSON.parse(readFileSync(new URL('./rules.json', import.meta.url), 'utf8'))

// PROXY_PORT (not the generic PORT) so dev tooling that exports PORT for Vite
// cannot make both servers fight over the same port.
const PORT = Number(process.env.PROXY_PORT ?? 8787)
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY?.trim() ?? ''
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)
const HOSTS = new Set(rules.hosts)
const MAX_CACHE_ENTRIES = 500

/** target URL → { body: Buffer, contentType, storedAt (ms) } */
const cache = new Map()
/** window key → start timestamps (ms) */
const windows = new Map()

function ttlSeconds(host, pathAndQuery) {
  const rule = rules.ttl.find((entry) => entry.host === host && new RegExp(entry.path).test(pathAndQuery))
  return rule ? rule.seconds : rules.defaultTtlSeconds
}

/** Sliding window: 0 when a slot was taken, otherwise seconds until one frees up. */
function takeSlot(key, limit, windowSeconds) {
  const now = Date.now()
  const stamps = (windows.get(key) ?? []).filter((stamp) => stamp > now - windowSeconds * 1000)
  if (stamps.length >= limit) {
    windows.set(key, stamps)
    return Math.max(1, Math.ceil((stamps[stamps.length - limit] + windowSeconds * 1000 - now) / 1000))
  }
  stamps.push(now)
  windows.set(key, stamps)
  return 0
}

function cacheWrite(key, entry) {
  cache.delete(key)
  cache.set(key, entry)
  while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
}

function send(response, status, body, headers) {
  response.writeHead(status, { 'x-content-type-options': 'nosniff', ...headers })
  response.end(body)
}

function sendError(response, status, message, headers = {}) {
  send(response, status, JSON.stringify({ error: message }), {
    ...headers,
    'content-type': 'application/json',
    'cache-control': 'no-store',
  })
}

function sendStale(response, entry, cors) {
  send(response, 200, entry.body, { ...cors, 'content-type': entry.contentType, 'cache-control': 'no-store', 'x-proxy-cache': 'stale' })
}

async function fetchUpstream(target, host) {
  const headers = { accept: 'application/json', 'user-agent': 'FootballGalaxyProxy/2.0' }
  if (host === 'api.football-data.org' && FOOTBALL_DATA_API_KEY) headers['x-auth-token'] = FOOTBALL_DATA_API_KEY
  try {
    const upstream = await fetch(target, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(rules.timeoutSeconds * 1000),
    })
    const length = Number(upstream.headers.get('content-length') ?? 0)
    if (length > rules.maxBodyBytes) return { status: 0, error: 'Upstream response is too large.' }
    const body = Buffer.from(await upstream.arrayBuffer())
    if (body.length > rules.maxBodyBytes) return { status: 0, error: 'Upstream response is too large.' }
    const retryAfter = upstream.headers.get('retry-after') ?? upstream.headers.get('x-requestcounter-reset') ?? ''
    return {
      status: upstream.status,
      body,
      contentType: upstream.headers.get('content-type') ?? 'application/json',
      retryAfter: /^\d+$/.test(retryAfter) ? retryAfter : '',
    }
  } catch {
    return { status: 0 }
  }
}

async function handle(request, response) {
  const origin = request.headers.origin ?? ''
  const cors = { vary: 'Origin' }
  if (origin) {
    if (!ALLOWED_ORIGINS.has(origin)) return sendError(response, 403, 'Origin is not allowed.', cors)
    Object.assign(cors, {
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-expose-headers': rules.exposedHeaders.join(', '),
    })
  }

  if (request.method === 'OPTIONS') return send(response, 204, '', cors)
  if (request.method !== 'GET') return sendError(response, 405, 'Only GET is supported.', cors)

  const url = new URL(request.url ?? '/', 'http://localhost')
  if (url.pathname !== '/api/live') return sendError(response, 404, 'Unknown endpoint.', cors)
  if (url.searchParams.has('health')) {
    return send(response, 200, '{"status":"ok"}', { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' })
  }

  const client = rules.clientRateLimit
  const clientWait = takeSlot(`rl-${request.socket.remoteAddress ?? 'unknown'}`, client.limit, client.windowSeconds)
  if (clientWait > 0) return sendError(response, 429, 'Too many requests.', { ...cors, 'retry-after': String(clientWait) })

  const target = url.searchParams.get('target') ?? ''
  if (!target) return sendError(response, 400, 'Missing target query parameter.', cors)
  let parsed
  try {
    parsed = new URL(target)
  } catch {
    return sendError(response, 400, 'Target must be an absolute URL.', cors)
  }
  if (parsed.protocol !== 'https:' || !HOSTS.has(parsed.hostname) || parsed.username || parsed.password || parsed.port) {
    return sendError(response, 403, 'Target host is not allowed.', cors)
  }

  const host = parsed.hostname
  const ttl = ttlSeconds(host, parsed.pathname + parsed.search)
  const key = createHash('sha256').update(target).digest('hex')
  const cached = cache.get(key)
  const age = cached ? (Date.now() - cached.storedAt) / 1000 : Infinity
  if (cached && age < ttl) {
    return send(response, 200, cached.body, {
      ...cors,
      'content-type': cached.contentType,
      'cache-control': `public, max-age=${Math.max(0, Math.floor(ttl - age))}`,
      'x-proxy-cache': 'hit',
    })
  }
  const stale = cached && age < rules.maxStaleSeconds ? cached : undefined

  const budget = rules.upstreamBudget[host]
  if (budget) {
    const budgetWait = takeSlot(`budget-${host}`, budget.limit, budget.windowSeconds)
    if (budgetWait > 0) {
      if (stale) return sendStale(response, stale, cors)
      console.warn(`[proxy] ${host} budget exhausted, retry in ${budgetWait}s`)
      return sendError(response, 429, 'Upstream rate limit reached.', { ...cors, 'retry-after': String(budgetWait) })
    }
  }

  const upstream = await fetchUpstream(target, host)
  if (upstream.status === 200) {
    cacheWrite(key, { body: upstream.body, contentType: upstream.contentType, storedAt: Date.now() })
    return send(response, 200, upstream.body, {
      ...cors,
      'content-type': upstream.contentType,
      'cache-control': `public, max-age=${ttl}`,
      'x-proxy-cache': 'miss',
    })
  }
  const failed = upstream.status === 0 || upstream.status === 429 || upstream.status >= 500
  if (failed && stale) {
    console.warn(`[proxy] ${host} answered ${upstream.status || 'nothing'} — serving stale copy`)
    return sendStale(response, stale, cors)
  }
  if (upstream.status === 0) return sendError(response, 502, upstream.error ?? 'Failed to reach the upstream provider.', cors)
  return sendError(response, upstream.status, `Upstream returned ${upstream.status}.`, {
    ...cors,
    ...(upstream.retryAfter ? { 'retry-after': upstream.retryAfter } : {}),
  })
}

createServer((request, response) => {
  handle(request, response).catch(() => {
    if (!response.headersSent) sendError(response, 500, 'Proxy error.')
  })
}).listen(PORT, () => {
  console.log(`Football Galaxy proxy listening on http://localhost:${PORT}/api/live`)
  console.log(
    FOOTBALL_DATA_API_KEY
      ? 'football-data.org key detected — requests to api.football-data.org are authenticated.'
      : 'No FOOTBALL_DATA_API_KEY — football-data.org requests will be rejected upstream.',
  )
})
