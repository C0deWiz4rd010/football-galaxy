/**
 * Contract tests for both proxy implementations (proxy/SPEC.md). Run through
 * `npm run test:proxy` (Node) or `npm run test:proxy -- --php` (PHP), which
 * start the proxy and set PROXY_URL. PROXY_TEST_NETWORK=1 adds a real
 * upstream round trip (cache miss, then hit).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const BASE = process.env.PROXY_URL ?? 'http://localhost:8787/api/live'
const ORIGIN = 'http://localhost:5173'
const rules = JSON.parse(readFileSync(new URL('../rules.json', import.meta.url), 'utf8'))

const call = (query, init = {}) => fetch(`${BASE}${query}`, init)
const target = (url) => `?target=${encodeURIComponent(url)}`

describe('live-data proxy contract', () => {
  it('answers the health check', async () => {
    const response = await call('?health=1')
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  })

  it('only allows GET', async () => {
    const response = await call('?health=1', { method: 'POST' })
    assert.equal(response.status, 405)
  })

  it('rejects foreign origins and echoes allowed ones', async () => {
    const foreign = await call('?health=1', { headers: { origin: 'https://evil.example' } })
    assert.equal(foreign.status, 403)

    const allowed = await call('?health=1', { headers: { origin: ORIGIN } })
    assert.equal(allowed.status, 200)
    assert.equal(allowed.headers.get('access-control-allow-origin'), ORIGIN)
    assert.match(allowed.headers.get('access-control-expose-headers') ?? '', /x-proxy-cache/)
  })

  it('validates the target', async () => {
    assert.equal((await call('?target=')).status, 400)
    assert.equal((await call(target('not a url'))).status, 400)
    assert.equal((await call(target('http://site.api.espn.com/x'))).status, 403)
    assert.equal((await call(target('https://example.com/x'))).status, 403)
    assert.equal((await call(target('https://site.api.espn.com:8443/x'))).status, 403)
    assert.equal((await call(target('https://user:pw@site.api.espn.com/x'))).status, 403)
  })

  it('returns errors as short JSON without upstream details', async () => {
    const response = await call(target('https://example.com/x'))
    const body = await response.json()
    assert.deepEqual(Object.keys(body), ['error'])
  })

  it('caches upstream responses', { skip: process.env.PROXY_TEST_NETWORK !== '1' }, async () => {
    const url = target('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams')
    const first = await call(url)
    assert.equal(first.status, 200)
    assert.ok(['miss', 'hit'].includes(first.headers.get('x-proxy-cache') ?? ''))
    await first.arrayBuffer()
    const second = await call(url)
    assert.equal(second.status, 200)
    assert.equal(second.headers.get('x-proxy-cache'), 'hit')
    assert.match(second.headers.get('cache-control') ?? '', /max-age=\d+/)
    assert.match(second.headers.get('content-encoding') ?? '', /^(br|gzip)$/)
  })

  // Last: it uses up this client's budget for the rest of the minute.
  it('rate-limits a client', async () => {
    let limited
    for (let index = 0; index <= rules.clientRateLimit.limit + 1 && !limited; index += 1) {
      const response = await call('?target=')
      if (response.status === 429) limited = response
    }
    assert.ok(limited, 'expected a 429')
    assert.match(limited.headers.get('retry-after') ?? '', /^\d+$/)
  })
})
