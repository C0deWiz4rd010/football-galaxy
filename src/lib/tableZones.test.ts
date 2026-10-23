import { describe, expect, it } from 'vitest'

import { zoneOf, zonesIn } from './tableZones'

describe('table zones', () => {
  it('marks four Champions League places and three relegated clubs in the Premier League', () => {
    const zones = Array.from({ length: 20 }, (_, index) => zoneOf('premier-league', index + 1, 20))
    expect(zones.slice(0, 5)).toEqual(['ucl', 'ucl', 'ucl', 'ucl', undefined])
    expect(zones.slice(16)).toEqual([undefined, 'rel', 'rel', 'rel'])
  })

  it('knows the Bundesliga relegation play-off', () => {
    expect(zoneOf('bundesliga', 15, 18)).toBeUndefined()
    expect(zoneOf('bundesliga', 16, 18)).toBe('playoff')
    expect(zoneOf('bundesliga', 17, 18)).toBe('rel')
  })

  it('gives Ligue 1 three direct Champions League places plus a qualifier', () => {
    expect(zoneOf('ligue-1', 3, 18)).toBe('ucl')
    expect(zoneOf('ligue-1', 4, 18)).toBe('ucl-q')
    expect(zoneOf('ligue-1', 16, 18)).toBe('playoff')
    expect(zonesIn('ligue-1')).toEqual(['ucl', 'ucl-q', 'playoff', 'rel'])
    expect(zonesIn('serie-a')).toEqual(['ucl', 'rel'])
  })
})
