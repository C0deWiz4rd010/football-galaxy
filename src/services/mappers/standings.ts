import { getLeagueConfig, type LeagueId } from '../config/leagues'
import {
  leagueStandingsSchema,
  type LeagueStandings,
} from '../schemas/domain'
import type { FootballDataStandingsResponse } from '../schemas/football-data'

export function mapFootballDataStandings(
  leagueId: LeagueId,
  response: FootballDataStandingsResponse,
): LeagueStandings {
  const league = getLeagueConfig(leagueId)
  const totalStandings =
    response.standings.find((standing) => standing.type === 'TOTAL') ??
    response.standings[0]

  const standings = totalStandings?.table.map((row) => ({
    position: row.position,
    team: {
      id: row.team.id,
      name: row.team.name,
      shortName: row.team.shortName,
      tla: row.team.tla,
      crestUrl: row.team.crest ?? null,
    },
    played: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
  })) ?? []

  return leagueStandingsSchema.parse({
    leagueId,
    leagueLabel: league.label,
    season: {
      startDate: response.season.startDate,
      endDate: response.season.endDate,
      currentMatchday: response.season.currentMatchday ?? null,
    },
    source: 'football-data.org',
    standings,
  })
}
