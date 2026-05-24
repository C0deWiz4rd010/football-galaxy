import { getLeagueConfig, type LeagueId } from '../config/leagues'
import {
  leagueStandingsSchema,
  type LeagueStandings,
  type StandingTeam,
} from '../schemas/domain'
import type {
  TheSportsDbEvent,
  TheSportsDbSeasonEventsResponse,
} from '../schemas/the-sports-db'

type MapStandingsOptions = {
  matchday?: number | null
}

type MutableStanding = {
  team: StandingTeam
  played: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

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

function createTeam(teamId: number, teamName: string, crestUrl: string | null): StandingTeam {
  return {
    id: teamId,
    name: teamName,
    shortName: createShortName(teamName),
    tla: createTla(teamName),
    crestUrl,
  }
}

function isCompletedEvent(event: TheSportsDbEvent) {
  return (
    typeof event.intHomeScore === 'number' &&
    typeof event.intAwayScore === 'number' &&
    event.intRound !== null &&
    event.strPostponed !== 'yes'
  )
}

function ensureTeam(
  teams: Map<number, MutableStanding>,
  teamId: number,
  teamName: string,
  crestUrl: string | null,
) {
  const existing = teams.get(teamId)

  if (existing) {
    if (!existing.team.crestUrl && crestUrl) {
      existing.team.crestUrl = crestUrl
    }
    return existing
  }

  const created: MutableStanding = {
    team: createTeam(teamId, teamName, crestUrl),
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }

  teams.set(teamId, created)
  return created
}

function updateStandingsForEvent(
  teams: Map<number, MutableStanding>,
  event: TheSportsDbEvent,
) {
  const home = ensureTeam(
    teams,
    event.idHomeTeam,
    event.strHomeTeam,
    event.strHomeTeamBadge ?? null,
  )
  const away = ensureTeam(
    teams,
    event.idAwayTeam,
    event.strAwayTeam,
    event.strAwayTeamBadge ?? null,
  )

  const homeGoals = event.intHomeScore ?? 0
  const awayGoals = event.intAwayScore ?? 0

  home.played += 1
  away.played += 1
  home.goalsFor += homeGoals
  home.goalsAgainst += awayGoals
  away.goalsFor += awayGoals
  away.goalsAgainst += homeGoals

  if (homeGoals > awayGoals) {
    home.won += 1
    away.lost += 1
    home.points += 3
    return
  }

  if (homeGoals < awayGoals) {
    away.won += 1
    home.lost += 1
    away.points += 3
    return
  }

  home.draw += 1
  away.draw += 1
  home.points += 1
  away.points += 1
}

function finalizeStandings(teams: Map<number, MutableStanding>) {
  return Array.from(teams.values())
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
    }))
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points
      }
      if (right.goalDifference !== left.goalDifference) {
        return right.goalDifference - left.goalDifference
      }
      if (right.goalsFor !== left.goalsFor) {
        return right.goalsFor - left.goalsFor
      }
      return left.team.name.localeCompare(right.team.name)
    })
    .map((row, index) => ({
      position: index + 1,
      team: row.team,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    }))
}

export function mapTheSportsDbStandings(
  leagueId: LeagueId,
  response: TheSportsDbSeasonEventsResponse,
  options: MapStandingsOptions = {},
): LeagueStandings {
  const league = getLeagueConfig(leagueId)
  const completedEvents = response.events.filter(isCompletedEvent)
  const currentMatchday =
    completedEvents.length > 0
      ? completedEvents.reduce(
          (max, event) => Math.max(max, event.intRound ?? 0),
          0,
        )
      : null

  const selectedMatchday =
    typeof options.matchday === 'number' && options.matchday > 0
      ? currentMatchday === null
        ? options.matchday
        : Math.min(options.matchday, currentMatchday)
      : currentMatchday

  const relevantEvents =
    selectedMatchday === null
      ? completedEvents
      : completedEvents.filter((event) => (event.intRound ?? 0) <= selectedMatchday)

  const teams = new Map<number, MutableStanding>()

  response.events.forEach((event) => {
    ensureTeam(
      teams,
      event.idHomeTeam,
      event.strHomeTeam,
      event.strHomeTeamBadge ?? null,
    )
    ensureTeam(
      teams,
      event.idAwayTeam,
      event.strAwayTeam,
      event.strAwayTeamBadge ?? null,
    )
  })

  relevantEvents.forEach((event) => {
    updateStandingsForEvent(teams, event)
  })

  return leagueStandingsSchema.parse({
    leagueId,
    leagueLabel: league.label,
    season: {
      label: response.events[0]?.strSeason ?? 'Current season',
      currentMatchday,
      selectedMatchday,
    },
    source: 'the-sports-db',
    standings: finalizeStandings(teams),
  })
}
