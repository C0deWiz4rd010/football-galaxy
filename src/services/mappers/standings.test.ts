import { describe, expect, it } from 'vitest'

import { mapTheSportsDbStandings } from './standings'

describe('mapTheSportsDbStandings', () => {
  it('builds a full table from season events and respects the selected matchday', () => {
    const standings = mapTheSportsDbStandings(
      'premier-league',
      {
        events: [
          {
            idEvent: '1',
            idLeague: '4328',
            strLeague: 'English Premier League',
            strSeason: '2025-2026',
            strHomeTeam: 'Liverpool FC',
            strAwayTeam: 'Arsenal',
            idHomeTeam: 133602,
            idAwayTeam: 133604,
            strHomeTeamBadge:
              'https://r2.thesportsdb.com/images/media/team/badge/liverpool.png',
            strAwayTeamBadge:
              'https://r2.thesportsdb.com/images/media/team/badge/arsenal.png',
            intHomeScore: 2,
            intAwayScore: 1,
            intRound: 1,
            dateEvent: '2025-08-16',
            strStatus: 'Match Finished',
            strPostponed: 'no',
          },
          {
            idEvent: '2',
            idLeague: '4328',
            strLeague: 'English Premier League',
            strSeason: '2025-2026',
            strHomeTeam: 'Arsenal',
            strAwayTeam: 'Liverpool FC',
            idHomeTeam: 133604,
            idAwayTeam: 133602,
            strHomeTeamBadge:
              'https://r2.thesportsdb.com/images/media/team/badge/arsenal.png',
            strAwayTeamBadge:
              'https://r2.thesportsdb.com/images/media/team/badge/liverpool.png',
            intHomeScore: 0,
            intAwayScore: 0,
            intRound: 2,
            dateEvent: '2025-08-23',
            strStatus: 'Match Finished',
            strPostponed: 'no',
          },
        ],
      },
      {
        matchday: 1,
      },
    )

    expect(standings.leagueId).toBe('premier-league')
    expect(standings.leagueLabel).toBe('Premier League')
    expect(standings.season.label).toBe('2025-2026')
    expect(standings.season.currentMatchday).toBe(2)
    expect(standings.season.selectedMatchday).toBe(1)
    expect(standings.standings).toHaveLength(2)
    expect(standings.standings[0]).toMatchObject({
      position: 1,
      played: 1,
      won: 1,
      draw: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 1,
      goalDifference: 1,
      points: 3,
      team: {
        id: 133602,
        name: 'Liverpool FC',
        shortName: 'Liverpool',
        tla: 'LIV',
      },
    })
    expect(standings.standings[1]).toMatchObject({
      position: 2,
      played: 1,
      won: 0,
      draw: 0,
      lost: 1,
      points: 0,
      team: {
        id: 133604,
        name: 'Arsenal',
      },
    })
  })
})
