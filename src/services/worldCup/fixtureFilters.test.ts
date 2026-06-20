import { describe, expect, it } from 'vitest'

import { filterWorldCupFixtures } from '@/features/world-cup/utils'

import { mapApiFootballFixture } from './apiFootballProvider'

describe('World Cup fixture filters', () => {
  it('filters by status, group, city, team, and search query', () => {
    const liveMexico = mapApiFootballFixture({
      fixture: {
        id: 1,
        date: '2026-06-11T19:00:00+00:00',
        status: { short: '1H', elapsed: 42 },
        venue: { name: 'Estadio Azteca', city: 'Mexico City' },
      },
      league: { round: 'Group A - 1' },
      teams: {
        home: { id: 26, name: 'Mexico', code: 'MEX', country: 'Mexico' },
        away: { id: 27, name: 'Canada', code: 'CAN', country: 'Canada' },
      },
      goals: { home: 1, away: 0 },
    })

    const scheduledUsa = mapApiFootballFixture({
      fixture: {
        id: 2,
        date: '2026-06-12T02:00:00+00:00',
        status: { short: 'NS' },
        venue: { name: 'SoFi Stadium', city: 'Los Angeles' },
      },
      league: { round: 'Group B - 1' },
      teams: {
        home: { id: 28, name: 'United States', code: 'USA', country: 'United States' },
        away: { id: 29, name: 'Wales', code: 'WAL', country: 'Wales' },
      },
    })

    const filtered = filterWorldCupFixtures([liveMexico, scheduledUsa], {
      search: 'mexico',
      status: 'live',
      group: 'A',
      round: 'all',
      hostCity: 'Mexico City',
      teamId: liveMexico.homeTeam.id,
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('af-fixture-1')
    expect(filtered[0]?.group).toBe('A')
  })
})
