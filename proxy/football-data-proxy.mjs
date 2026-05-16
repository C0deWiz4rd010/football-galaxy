import { createServer } from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY?.trim() ?? ''

// Hosts the proxy is allowed to fetch from. Add new domains here as the data
// pipeline grows. Keep the list small: every entry widens the SSRF surface.
const ALLOWED_HOSTS = new Set([
  'www.thesportsdb.com',
  'site.api.espn.com',
  'api.football-data.org',
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'www.wikidata.org',
  'crests.football-data.org',
])

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function copyHeaderIfPresent(response, upstream, headerName) {
  const value = upstream.headers.get(headerName)

  if (value) {
    response.setHeader(headerName, value)
  }
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    writeJson(response, 400, { error: 'Missing request URL.' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'content-type',
    })
    response.end()
    return
  }

  if (request.method !== 'GET') {
    writeJson(response, 405, { error: 'Only GET is supported.' })
    return
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)

  if (url.pathname === '/health') {
    writeJson(response, 200, {
      status: 'ok',
      allowedHosts: [...ALLOWED_HOSTS],
    })
    return
  }

  if (url.pathname !== '/api/live') {
    writeJson(response, 404, { error: 'Unknown endpoint.' })
    return
  }

  const target = url.searchParams.get('target')

  if (!target) {
    writeJson(response, 400, { error: 'Missing target query parameter.' })
    return
  }

  let upstreamUrl

  try {
    upstreamUrl = new URL(target)
  } catch {
    writeJson(response, 400, { error: 'Target must be an absolute URL.' })
    return
  }

  if (upstreamUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(upstreamUrl.host)) {
    writeJson(response, 403, { error: 'Target host is not allowed.' })
    return
  }

  try {
    const upstreamHeaders = {
      'user-agent': 'FootballGalaxyProxy/1.0 (+https://github.com/C0deWiz4rd010/football-galaxy)',
      accept: 'application/json,image/*,text/plain;q=0.9,*/*;q=0.8',
    }

    // Inject the football-data.org API key when targeting that host. The key
    // never leaves the proxy, so the browser bundle stays free of secrets.
    if (upstreamUrl.host === 'api.football-data.org' && FOOTBALL_DATA_API_KEY) {
      upstreamHeaders['x-auth-token'] = FOOTBALL_DATA_API_KEY
    }

    const upstream = await fetch(upstreamUrl, { headers: upstreamHeaders })

    // football-data.org publishes its rate-limit state in response headers
    // (`X-Requests-Available-Minute`, `X-RequestCounter-Reset`). Log when we
    // approach the limit so we can spot throttling early instead of hitting
    // 429s in the browser.
    if (upstreamUrl.host === 'api.football-data.org') {
      const remaining = upstream.headers.get('x-requests-available-minute')
      const resetSeconds = upstream.headers.get('x-requestcounter-reset')
      if (remaining !== null) {
        const remainingNum = Number(remaining)
        if (Number.isFinite(remainingNum) && remainingNum <= 2) {
          console.warn(
            `[fd] rate-limit low: ${remainingNum} req(s) remaining, resets in ${resetSeconds ?? '?'}s`,
          )
        }
      }
      // Forward both headers to the browser so client-side logic can react.
      copyHeaderIfPresent(response, upstream, 'x-requests-available-minute')
      copyHeaderIfPresent(response, upstream, 'x-requestcounter-reset')
    }

    const body = Buffer.from(await upstream.arrayBuffer())

    response.statusCode = upstream.status
    response.setHeader('access-control-allow-origin', '*')
    response.setHeader('access-control-allow-methods', 'GET,OPTIONS')
    response.setHeader('access-control-allow-headers', 'content-type')
    copyHeaderIfPresent(response, upstream, 'content-type')
    copyHeaderIfPresent(response, upstream, 'cache-control')
    copyHeaderIfPresent(response, upstream, 'etag')
    response.end(body)
  } catch (error) {
    writeJson(response, 502, {
      error: 'Failed to reach upstream provider.',
      detail: error instanceof Error ? error.message : 'Unknown proxy error.',
    })
  }
})

server.listen(PORT, () => {
  console.log(`Football Galaxy proxy listening on http://localhost:${PORT}`)
  console.log('Proxy endpoint: /api/live?target=<encoded-https-url>')
  if (FOOTBALL_DATA_API_KEY) {
    console.log('football-data.org API key detected — requests to api.football-data.org will be authenticated.')
  } else {
    console.log('No FOOTBALL_DATA_API_KEY set — football-data.org requests will be unauthenticated (low rate limits, fewer fields).')
  }
})
