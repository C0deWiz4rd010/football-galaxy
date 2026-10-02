/**
 * Small, hand-written fixtures for tests. The app itself never uses mock data.
 */
import { leagues } from '@/lib/leagues'
import type { LeagueId, LeagueSummary, Player, PlayerRef, Standing, Team } from '@/services/types'

export function makeTeam(index: number, leagueId: LeagueId = 'premier-league'): Team {
  return {
    id: `${100 + index}`,
    espnId: `${100 + index}`,
    leagueId,
    name: `Test Club ${index + 1}`,
    shortName: `TC${index + 1}`,
    crest: '',
    primaryColor: '#123456',
  }
}

export function makePlayer(overrides: Omit<Partial<Player>, 'stats'> & { stats?: Partial<Player['stats']> } = {}): Player {
  const { stats, ...rest } = overrides
  return {
    id: 'espn-1',
    teamId: '100',
    leagueId: 'premier-league',
    name: 'Test Player',
    number: 9,
    position: 'FW',
    nationality: 'Norway',
    flag: '',
    photo: '',
    ...rest,
    stats: {
      appearances: 10,
      goals: 5,
      assists: 2,
      yellowCards: 1,
      redCards: 0,
      minutes: 800,
      trend: [1, 0, 2, 1, 1],
      attributes: { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 50, physical: 70 },
      ...stats,
    },
  }
}

export function makePlayerRef(index: number, team: Team): PlayerRef {
  return {
    id: `espn-${1000 + index}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name: `Leader ${index + 1}`,
    photo: '',
    appearances: 6,
    goals: 8 - index,
    assists: 3 + index,
  }
}

export function makeLeagueSummary(leagueId: LeagueId = 'premier-league', teamCount = 20): LeagueSummary {
  const teams = Array.from({ length: teamCount }, (_, index) => makeTeam(index, leagueId))
  const standings: Standing[] = teams.map((team, index) => ({
    id: `${team.id}-standing`,
    leagueId,
    position: index + 1,
    team,
    played: 6,
    won: Math.max(0, 6 - index),
    drawn: index % 2,
    lost: Math.min(6, index),
    goalsFor: 14 - (index % 10),
    goalsAgainst: 4 + (index % 8),
    goalDifference: 10 - index,
    points: 3 * Math.max(0, 6 - index) + (index % 2),
    form: [],
  }))
  const leaders = teams.slice(0, 5).map((team, index) => ({ player: makePlayerRef(index, team), team }))
  return {
    league: leagues.find((league) => league.id === leagueId)!,
    season: { id: '2026-27', label: '2026/27', startDate: '2026-08-01T00:00:00Z', endDate: '2027-05-31T23:59:59Z', currentMatchday: 7 },
    standings,
    topScorers: leaders.map(({ player, team }) => ({ id: `${player.id}-scorer`, player, team, goals: player.goals, assists: player.assists })),
    topAssists: leaders.map(({ player, team }) => ({ id: `${player.id}-assist`, player, team, assists: player.assists, goals: player.goals })),
    playerPool: leaders,
    recentMatches: [],
    teams,
  }
}
