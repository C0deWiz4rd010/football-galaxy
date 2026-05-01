import { getLeagueConfig, type LeagueId } from '../config/leagues'
import {
  leagueStandingsSchema,
  type LeagueStandings,
} from '../schemas/domain'
import type { TheSportsDbStandingsResponse } from '../schemas/the-sports-db'

function createShortName(teamName: string) {
  return teamName
    .replace(/\bFC\b|\bCF\b|\bAC\b|\bAS\b|\bSSC\b/gi, '')
    .trim()
}

function createTla(teamName: string) {
  const letters = teamName
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  if (letters.length >= 3) {
    return letters.slice(0, 3)
  }

  const compactName = createShortName(teamName).replace(/[^a-zA-Z]/g, '')

  return compactName.slice(0, 3).toUpperCase() || teamName.slice(0, 3).toUpperCase()
}

export function mapTheSportsDbStandings(
  leagueId: LeagueId,
  response: TheSportsDbStandingsResponse,
): LeagueStandings {
  const league = getLeagueConfig(leagueId)

  const standings = response.table.map((row) => ({
    position: row.intRank,
    team: {
      id: row.idTeam,
      name: row.strTeam,
      shortName: createShortName(row.strTeam),
      tla: createTla(row.strTeam),
      crestUrl: row.strBadge ?? null,
    },
    played: row.intPlayed,
    won: row.intWin,
    draw: row.intDraw,
    lost: row.intLoss,
    goalsFor: row.intGoalsFor,
    goalsAgainst: row.intGoalsAgainst,
    goalDifference: row.intGoalDifference,
    points: row.intPoints,
  }))

  const currentMatchday =
    standings.length > 0
      ? standings.reduce((max, row) => Math.max(max, row.played), 0)
      : null

  return leagueStandingsSchema.parse({
    leagueId,
    leagueLabel: league.label,
    season: {
      label: response.table[0]?.strSeason ?? 'Current season',
      currentMatchday: currentMatchday && currentMatchday > 0 ? currentMatchday : null,
    },
    source: 'the-sports-db',
    standings,
  })
}
