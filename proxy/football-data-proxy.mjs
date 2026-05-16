import { createServer } from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)
const ALLOWED_HOSTS = new Set([
  'www.thesportsdb.com',
  'site.api.espn.com',
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
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'user-agent': 'FootballGalaxyProxy/1.0 (+https://github.com/C0deWiz4rd010/football-galaxy)',
        accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      },
    })

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
})
