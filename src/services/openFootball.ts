import { leagues } from '@/lib/leagues'
import { mockData } from '@/data/mock'
import type { Assist, FootballQueryParams, LeagueId, LeagueSummary, Match, Player, Scorer, Squad, Standing, Team } from './types'

interface HistoricalFile {
  season: string
  leagueId: LeagueId
  table: Array<{
    team: string
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
  }>
}

function leagueOrDefault(leagueId?: LeagueId) {
  return leagueId ?? 'premier-league'
}

function dataFor(leagueId?: LeagueId) {
  return mockData[leagueOrDefault(leagueId)]
}

async function loadHistoricalFile(leagueId: LeagueId, season: string): Promise<HistoricalFile | null> {
  try {
    if (leagueId === 'premier-league' && season === '2021-22') {
      return (await import('@/data/historical/2021-22/en.1.json')).default as HistoricalFile
    }
    if (leagueId === 'bundesliga' && season === '2021-22') {
      return (await import('@/data/historical/2021-22/de.1.json')).default as HistoricalFile
    }
    if (leagueId === 'premier-league' && season === '2022-23') {
      return (await import('@/data/historical/2022-23/en.1.json')).default as HistoricalFile
    }
    if (leagueId === 'bundesliga' && season === '2022-23') {
      return (await import('@/data/historical/2022-23/de.1.json')).default as HistoricalFile
    }
    return null
  } catch {
    return null
  }
}

export async function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const season = params.season ?? '2022-23'
  const file = await loadHistoricalFile(leagueId, season)
  if (!file) {
    return dataFor(leagueId).standings.map((standing) => ({ ...standing, id: `${standing.id}-${season}` }))
  }

  const teams = dataFor(leagueId).teams
  return file.table.map((row, index) => {
    const fallback = teams.find((team) => team.name === row.team) ?? teams[index]!
    const goalsAgainst = row.goalsAgainst
    const goalsFor = row.goalsFor
    return {
      id: `${fallback.id}-${season}-standing`,
      leagueId,
      position: index + 1,
      team: fallback,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points: row.points,
      avgPossession: 55 - index,
      form: dataFor(leagueId).standings[index]?.form ?? [],
    }
  })
}

export async function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  return dataFor(params.leagueId).topScorers
}

export async function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  return dataFor(params.leagueId).topAssists
}

export async function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  return dataFor(params.leagueId).recentMatches.map((match) => ({ ...match, season: params.season ?? match.season }))
}

export async function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  const teams = Object.values(mockData).flatMap((league) => league.teams)
  return teams.find((team) => team.id === params.teamId) ?? dataFor(params.leagueId).teams[0]!
}

export async function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  const team = await getTeam(params)
  return { teamId: team.id, players: team.squad ?? [] }
}

export async function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  const players = Object.values(mockData).flatMap((league) => league.teams).flatMap((team) => team.squad ?? [])
  return players.find((player) => player.id === params.playerId) ?? dataFor(params.leagueId).teams[0]!.squad![0]!
}

export async function getLeagueSummary(params: FootballQueryParams = {}): Promise<LeagueSummary> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagues.find((item) => item.id === leagueId)!
  return {
    league,
    season: {
      id: params.season ?? '2022-23',
      label: (params.season ?? '2022-23').replace('-', '/'),
      startDate: '2022-08-01T00:00:00Z',
      endDate: '2023-05-31T23:59:59Z',
      currentMatchday: 38,
    },
    standings: await getStandings(params),
    topScorers: await getTopScorers(params),
    topAssists: await getTopAssists(params),
    recentMatches: await getMatches(params),
    teams: dataFor(leagueId).teams,
  }
}
