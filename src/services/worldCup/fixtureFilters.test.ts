import { describe, expect, it } from 'vitest'

import { filterWorldCupFixtures } from '@/features/world-cup/utils'

import { mapFixture } from './footballDataProvider'

describe('World Cup fixture filters', () => {
  it('filters by status, group, team, and search query', () => {
    const liveMexico = {
      ...mapFixture({
        id: 1,
        utcDate: '2026-06-11T19:00:00Z',
        status: 'IN_PLAY',
        stage: 'GROUP_STAGE',
        group: 'GROUP_A',
        venue: 'Estadio Azteca',
        homeTeam: { id: 26, name: 'Mexico', tla: 'MEX' },
        awayTeam: { id: 27, name: 'Canada', tla: 'CAN' },
        score: { fullTime: { home: 1, away: 0 } },
      }),
      city: 'Mexico City',
    }

    const scheduledUsa = mapFixture({
      id: 2,
      utcDate: '2026-06-12T02:00:00Z',
      status: 'TIMED',
      stage: 'GROUP_STAGE',
      group: 'GROUP_B',
      homeTeam: { id: 28, name: 'United States', tla: 'USA' },
      awayTeam: { id: 29, name: 'Wales', tla: 'WAL' },
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
    expect(filtered[0]?.id).toBe('fd-1')
    expect(filtered[0]?.group).toBe('A')
  })
})
