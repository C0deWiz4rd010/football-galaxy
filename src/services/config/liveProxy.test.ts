import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildLiveRequestUrl, getLiveProxyConfig } from './liveProxy'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('liveProxy config', () => {
  it('returns direct urls when no proxy is configured', () => {
    vi.stubEnv('VITE_LIVE_DATA_PROXY_URL', '')
    const target = 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/scoreboard'

    expect(getLiveProxyConfig()).toEqual({
      baseUrl: undefined,
      isEnabled: false,
    })
    expect(buildLiveRequestUrl(target)).toBe(target)
  })

  it('wraps upstream requests when a proxy is configured', () => {
    vi.stubEnv('VITE_LIVE_DATA_PROXY_URL', 'http://localhost:8787/api/live/')

    expect(getLiveProxyConfig()).toEqual({
      baseUrl: 'http://localhost:8787/api/live',
      isEnabled: true,
    })
    expect(buildLiveRequestUrl('https://www.thesportsdb.com/api/v1/json/123/search_all_teams.php?l=Premier%20League')).toBe(
      'http://localhost:8787/api/live?target=https%3A%2F%2Fwww.thesportsdb.com%2Fapi%2Fv1%2Fjson%2F123%2Fsearch_all_teams.php%3Fl%3DPremier%2520League',
    )
  })
})
