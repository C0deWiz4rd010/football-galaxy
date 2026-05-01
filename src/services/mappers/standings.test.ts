import { describe, expect, it } from 'vitest'

import { mapTheSportsDbStandings } from './standings'

describe('mapTheSportsDbStandings', () => {
  it('maps a TheSportsDB standings response into the domain model', () => {
    const standings = mapTheSportsDbStandings('premier-league', {
      table: [
        {
          idStanding: '9387479',
          intRank: 1,
          idTeam: 133602,
          strTeam: 'Liverpool FC',
          strBadge:
            'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png/tiny',
          idLeague: '4328',
          strLeague: 'English Premier League',
          strSeason: '2025-2026',
          strForm: 'WWLDL',
          strDescription: 'Promotion - Champions League (League phase)',
          intPlayed: 33,
          intWin: 16,
          intLoss: 10,
          intDraw: 7,
          intGoalsFor: 54,
          intGoalsAgainst: 43,
          intGoalDifference: 11,
          intPoints: 55,
          dateUpdated: '2026-04-21 23:00:29',
        },
      ],
    })

    expect(standings.leagueId).toBe('premier-league')
    expect(standings.leagueLabel).toBe('Premier League')
    expect(standings.season.label).toBe('2025-2026')
    expect(standings.season.currentMatchday).toBe(33)
    expect(standings.standings).toHaveLength(1)
    expect(standings.standings[0]).toMatchObject({
      position: 1,
      played: 33,
      won: 16,
      draw: 7,
      lost: 10,
      goalsFor: 54,
      goalsAgainst: 43,
      goalDifference: 11,
      points: 55,
      team: {
        id: 133602,
        name: 'Liverpool FC',
        shortName: 'Liverpool',
        tla: 'LIV',
        crestUrl:
          'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png/tiny',
      },
    })
  })
})
