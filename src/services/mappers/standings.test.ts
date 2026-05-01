import { describe, expect, it } from 'vitest'

import { mapFootballDataStandings } from './standings'

describe('mapFootballDataStandings', () => {
  it('maps a football-data standings response into the domain model', () => {
    const standings = mapFootballDataStandings('premier-league', {
      competition: {
        code: 'PL',
        name: 'Premier League',
      },
      season: {
        startDate: '2025-08-15',
        endDate: '2026-05-24',
        currentMatchday: 12,
      },
      standings: [
        {
          type: 'TOTAL',
          table: [
            {
              position: 1,
              team: {
                id: 64,
                name: 'Liverpool FC',
                shortName: 'Liverpool',
                tla: 'LIV',
                crest: 'https://crests.football-data.org/64.svg',
              },
              playedGames: 12,
              won: 9,
              draw: 2,
              lost: 1,
              goalsFor: 28,
              goalsAgainst: 10,
              goalDifference: 18,
              points: 29,
            },
          ],
        },
      ],
    })

    expect(standings.leagueId).toBe('premier-league')
    expect(standings.leagueLabel).toBe('Premier League')
    expect(standings.season.currentMatchday).toBe(12)
    expect(standings.standings).toHaveLength(1)
    expect(standings.standings[0]).toMatchObject({
      position: 1,
      played: 12,
      won: 9,
      draw: 2,
      lost: 1,
      goalsFor: 28,
      goalsAgainst: 10,
      goalDifference: 18,
      points: 29,
      team: {
        id: 64,
        name: 'Liverpool FC',
        shortName: 'Liverpool',
        tla: 'LIV',
        crestUrl: 'https://crests.football-data.org/64.svg',
      },
    })
  })
})
