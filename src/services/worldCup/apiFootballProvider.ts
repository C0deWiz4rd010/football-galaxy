import { z } from 'zod'

import { buildLiveRequestUrl } from '@/services/config/liveProxy'

import { worldCupTournament } from './tournament'
import type {
  DataQualityMeta,
  WorldCupBracketRound,
  WorldCupDashboard,
  WorldCupFixture,
  WorldCupFixtureEvent,
  WorldCupGroupStanding,
  WorldCupLineup,
  WorldCupLineupPlayer,
  WorldCupMatchStatus,
  WorldCupMatchStatistic,
  WorldCupProvider,
  WorldCupSquad,
  WorldCupTeam,
} from './types'

const apiBase = 'https://v3.football.api-sports.io'
const worldCupLeagueId = 1
const worldCupSeason = 2026
let lastRateLimitNote: string | undefined

const envelopeSchema = z.object({
  response: z.array(z.unknown()).default([]),
})

type ApiRecord = Record<string, unknown>

function record(value: unknown): ApiRecord {
  return value && typeof value === 'object' ? (value as ApiRecord) : {}
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function numberValue(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function quality(overrides: Partial<DataQualityMeta> = {}): DataQualityMeta {
  const now = new Date().toISOString()
  return {
    provider: 'api-football',
    fetchedAt: now,
    lastUpdated: now,
    isLive: false,
    confidence: 'official',
    note: lastRateLimitNote,
    ...overrides,
  }
}

function stageFromRound(round: string): WorldCupFixture['stage'] {
  const lower = round.toLowerCase()
  if (lower.includes('group')) return 'group'
  if (lower.includes('32')) return 'round-of-32'
  if (lower.includes('16')) return 'round-of-16'
  if (lower.includes('quarter')) return 'quarter-final'
  if (lower.includes('semi')) return 'semi-final'
  if (lower.includes('third') || lower.includes('3rd')) return 'third-place'
  if (lower.includes('final')) return 'final'
  return 'unknown'
}

function groupFromRound(round: string): string | undefined {
  const match = /group\s+([a-l])/i.exec(round)
  return match ? match[1]!.toUpperCase() : undefined
}

function statusFromApi(shortStatus: string | undefined): WorldCupMatchStatus {
  if (!shortStatus) return 'SCHEDULED'
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(shortStatus)) return 'LIVE'
  if (['FT', 'AET', 'PEN'].includes(shortStatus)) return 'FINISHED'
  if (['PST', 'CANC', 'ABD'].includes(shortStatus)) return 'POSTPONED'
  return 'SCHEDULED'
}

function createTeamFromApi(rawTeam: ApiRecord, group?: string): WorldCupTeam {
  const id = numberValue(rawTeam.id)
  const name = stringValue(rawTeam.name) ?? 'TBD'

  return {
    id: id ? `af-${id}` : `wc-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    apiFootballId: id,
    name,
    code: stringValue(rawTeam.code) ?? name.slice(0, 3).toUpperCase(),
    country: stringValue(rawTeam.country) ?? name,
    flagUrl: stringValue(rawTeam.logo),
    group,
    placeholder: !id || name === 'TBD',
  }
}

function matchesTeamRoute(team: WorldCupTeam, routeValue: string) {
  const slug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return team.id === routeValue || String(team.apiFootballId) === routeValue || slug === routeValue
}

function groupFromStandingRow(raw: ApiRecord): string | undefined {
  return stringValue(raw.group)?.replace(/^Group\s+/i, '')
}

// Collect the real national teams that appear across fixtures. Used as a
// secondary source when the /teams endpoint is empty (e.g. early in the
// tournament) so the UI still renders confirmed teams — never mock data.
function teamsFromFixtures(fixtures: WorldCupFixture[]): WorldCupTeam[] {
  const teams = new Map<string, WorldCupTeam>()
  for (const fixture of fixtures) {
    for (const team of [fixture.homeTeam, fixture.awayTeam]) {
      if (team.placeholder) continue
      const existing = teams.get(team.id)
      teams.set(team.id, { ...team, group: team.group ?? existing?.group })
    }
  }
  return [...teams.values()].sort((left, right) => left.name.localeCompare(right.name))
}

export function mapApiFootballFixture(raw: unknown): WorldCupFixture {
  const root = record(raw)
  const fixture = record(root.fixture)
  const league = record(root.league)
  const teams = record(root.teams)
  const goals = record(root.goals)
  const score = record(root.score)
  const venue = record(fixture.venue)
  const status = record(fixture.status)
  const round = stringValue(league.round) ?? 'World Cup 2026'
  const group = groupFromRound(round)
  const shortStatus = stringValue(status.short)
  const mappedStatus = statusFromApi(shortStatus)

  return {
    id: `af-fixture-${numberValue(fixture.id) ?? stringValue(fixture.date) ?? 'unknown'}`,
    apiFootballId: numberValue(fixture.id),
    round,
    group,
    stage: stageFromRound(round),
    utcDate: stringValue(fixture.date) ?? new Date().toISOString(),
    status: mappedStatus,
    elapsed: numberValue(status.elapsed),
    referee: stringValue(fixture.referee),
    timezone: stringValue(fixture.timezone),
    venue: stringValue(venue.name),
    city: stringValue(venue.city),
    homeTeam: createTeamFromApi(record(teams.home), group),
    awayTeam: createTeamFromApi(record(teams.away), group),
    homeScore: numberValue(goals.home),
    awayScore: numberValue(goals.away),
    scoreBreakdown: {
      halftime: {
        home: numberValue(record(score.halftime).home),
        away: numberValue(record(score.halftime).away),
      },
      fulltime: {
        home: numberValue(record(score.fulltime).home),
        away: numberValue(record(score.fulltime).away),
      },
      extratime: {
        home: numberValue(record(score.extratime).home),
        away: numberValue(record(score.extratime).away),
      },
      penalty: {
        home: numberValue(record(score.penalty).home),
        away: numberValue(record(score.penalty).away),
      },
    },
    events: [],
    lineups: [],
    statistics: [],
    quality: quality({ isLive: mappedStatus === 'LIVE' }),
  }
}

function eventTypeFromApi(type: string | undefined, detail: string | undefined): WorldCupFixtureEvent['type'] {
  const value = `${type ?? ''} ${detail ?? ''}`.toLowerCase()
  if (value.includes('goal')) return 'goal'
  if (value.includes('yellow')) return 'yellow'
  if (value.includes('red')) return 'red'
  if (value.includes('subst')) return 'substitution'
  if (value.includes('var')) return 'var'
  return 'other'
}

function mapApiFootballEvent(raw: unknown, fixtureId: string, index: number): WorldCupFixtureEvent {
  const root = record(raw)
  const time = record(root.time)
  const team = record(root.team)
  const player = record(root.player)
  const assist = record(root.assist)
  const type = stringValue(root.type)
  const detail = stringValue(root.detail)
  const teamId = numberValue(team.id)

  return {
    id: `${fixtureId}-event-${index + 1}`,
    minute: numberValue(time.elapsed) ?? 0,
    extraMinute: numberValue(time.extra),
    type: eventTypeFromApi(type, detail),
    detail: detail ?? type ?? 'Event',
    teamId: teamId ? `af-${teamId}` : undefined,
    teamName: stringValue(team.name),
    playerName: stringValue(player.name),
    assistName: stringValue(assist.name),
  }
}

export function mapApiFootballStandings(raw: unknown): WorldCupGroupStanding[] {
  const root = record(raw)
  const league = record(root.league)
  const groups = arrayValue(league.standings)

  return groups.flatMap((groupRows) =>
    arrayValue(groupRows).map((rowValue) => {
      const row = record(rowValue)
      const rank = numberValue(row.rank) ?? 0
      const team = createTeamFromApi(record(row.team), groupFromStandingRow(row))
      const all = record(row.all)
      const goals = record(all.goals)
      const played = numberValue(all.played) ?? 0
      const win = numberValue(all.win) ?? 0
      const draw = numberValue(all.draw) ?? 0
      const lose = numberValue(all.lose) ?? 0
      const goalsFor = numberValue(goals.for) ?? 0
      const goalsAgainst = numberValue(goals.against) ?? 0

      return {
        id: `${team.id}-world-cup-standing`,
        group: team.group ?? 'TBD',
        rank,
        team,
        played,
        won: win,
        drawn: draw,
        lost: lose,
        goalsFor,
        goalsAgainst,
        goalDifference: numberValue(row.goalsDiff) ?? goalsFor - goalsAgainst,
        points: numberValue(row.points) ?? 0,
        form: (stringValue(row.form) ?? '')
          .split('')
          .filter((item): item is 'W' | 'D' | 'L' => item === 'W' || item === 'D' || item === 'L')
          .slice(-5),
        qualificationHint: rank <= 2 ? 'top-two' : rank === 3 ? 'best-third-watch' : 'pending',
        quality: quality(),
      }
    }),
  )
}

function mapApiFootballTeam(raw: unknown, standingByTeamId: Map<string, WorldCupGroupStanding>): WorldCupTeam {
  const team = createTeamFromApi(record(record(raw).team))
  const standing = standingByTeamId.get(team.id)
  return {
    ...team,
    group: standing?.group ?? team.group,
  }
}

function mapLineupPlayer(raw: unknown, teamId: string, substitute: boolean): WorldCupLineupPlayer {
  const root = record(raw)
  const player = record(root.player)
  const id = numberValue(player.id)
  const name = stringValue(player.name) ?? 'Player pending'

  return {
    id: id ? `af-player-${id}` : `${teamId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    number: numberValue(player.number),
    position: stringValue(player.pos),
    grid: stringValue(player.grid),
    captain: Boolean(player.captain),
    substitute,
  }
}

function mapApiFootballLineup(raw: unknown): WorldCupLineup {
  const root = record(raw)
  const team = record(root.team)
  const coach = record(root.coach)
  const teamIdNumber = numberValue(team.id)
  const teamId = teamIdNumber ? `af-${teamIdNumber}` : `af-team-${stringValue(team.name) ?? 'unknown'}`

  return {
    teamId,
    teamName: stringValue(team.name) ?? 'Team pending',
    formation: stringValue(root.formation),
    coach: stringValue(coach.name),
    starters: arrayValue(root.startXI).map((player) => mapLineupPlayer(player, teamId, false)),
    substitutes: arrayValue(root.substitutes).map((player) => mapLineupPlayer(player, teamId, true)),
  }
}

function mapApiFootballStatistic(raw: unknown): WorldCupMatchStatistic[] {
  const root = record(raw)
  const team = record(root.team)
  const teamIdNumber = numberValue(team.id)
  const teamId = teamIdNumber ? `af-${teamIdNumber}` : `af-team-${stringValue(team.name) ?? 'unknown'}`
  const teamName = stringValue(team.name) ?? 'Team pending'

  return arrayValue(root.statistics).map((item) => {
    const stat = record(item)
    return {
      teamId,
      teamName,
      type: stringValue(stat.type) ?? 'Statistic',
      value: stringValue(stat.value) ?? numberValue(stat.value) ?? '-',
    }
  })
}

// Build the knockout bracket purely from real knockout fixtures. Before any
// knockout fixtures exist the API returns none, so this returns an empty board
// and the UI explains that the bracket forms once the group stage ends.
function createBracket(fixtures: WorldCupFixture[]): WorldCupBracketRound[] {
  const knockoutFixtures = fixtures.filter((fixture) => fixture.stage !== 'group' && fixture.stage !== 'unknown')
  if (!knockoutFixtures.length) {
    return []
  }

  const order: Array<{ stage: WorldCupFixture['stage']; label: string }> = [
    { stage: 'round-of-32', label: 'Round of 32' },
    { stage: 'round-of-16', label: 'Round of 16' },
    { stage: 'quarter-final', label: 'Quarter-finals' },
    { stage: 'semi-final', label: 'Semi-finals' },
    { stage: 'third-place', label: 'Third place' },
    { stage: 'final', label: 'Final' },
  ]

  return order
    .map(({ stage, label }) => {
      const matches = knockoutFixtures.filter((fixture) => fixture.stage === stage)
      return {
        id: stage,
        label,
        matches: matches.map((fixture, index) => ({
          id: fixture.id,
          label: fixture.round || `Match ${index + 1}`,
          utcDate: fixture.utcDate,
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          homeScore: fixture.homeScore,
          awayScore: fixture.awayScore,
          placeholder: Boolean(fixture.homeTeam.placeholder || fixture.awayTeam.placeholder),
        })),
      }
    })
    .filter((round) => round.matches.length > 0)
}

async function apiGet(path: string): Promise<unknown[]> {
  const response = await fetch(buildLiveRequestUrl(`${apiBase}${path}`))
  const remaining = response.headers.get('x-ratelimit-requests-remaining')
  const limit = response.headers.get('x-ratelimit-requests-limit')
  lastRateLimitNote = remaining && limit ? `API-Football quota: ${remaining}/${limit} requests remaining.` : undefined
  if (!response.ok) {
    throw new Error(`API-Football request failed (${response.status}).`)
  }
  return envelopeSchema.parse(await response.json()).response
}

async function getFixturesFromApi(): Promise<WorldCupFixture[]> {
  const rows = await apiGet(`/fixtures?league=${worldCupLeagueId}&season=${worldCupSeason}`)
  return rows.map(mapApiFootballFixture).sort((left, right) => Date.parse(left.utcDate) - Date.parse(right.utcDate))
}

async function getGroupsFromApi(): Promise<WorldCupGroupStanding[]> {
  const rows = await apiGet(`/standings?league=${worldCupLeagueId}&season=${worldCupSeason}`)
  return rows.flatMap(mapApiFootballStandings)
}

async function getTeamsFromApi(groups: WorldCupGroupStanding[]): Promise<WorldCupTeam[]> {
  const rows = await apiGet(`/teams?league=${worldCupLeagueId}&season=${worldCupSeason}`)
  const standingByTeamId = new Map(groups.map((standing) => [standing.team.id, standing]))
  const teams = rows.map((row) => mapApiFootballTeam(row, standingByTeamId))
  return teams.length ? teams : groups.map((standing) => standing.team)
}

async function getEventsForFixture(fixture: WorldCupFixture): Promise<WorldCupFixture> {
  if (!fixture.apiFootballId) return fixture
  const [events, lineups, statistics] = await Promise.all([
    getEventsForFixtureId(fixture.apiFootballId).catch(() => []),
    getLineupsForFixtureId(fixture.apiFootballId).catch(() => []),
    getStatisticsForFixtureId(fixture.apiFootballId).catch(() => []),
  ])
  return {
    ...fixture,
    events,
    lineups,
    statistics,
  }
}

async function getEventsForFixtureId(fixtureId: number): Promise<WorldCupFixtureEvent[]> {
  const rows = await apiGet(`/fixtures/events?fixture=${fixtureId}`)
  return rows.map((row, index) => mapApiFootballEvent(row, `af-fixture-${fixtureId}`, index))
}

async function getLineupsForFixtureId(fixtureId: number): Promise<WorldCupLineup[]> {
  const rows = await apiGet(`/fixtures/lineups?fixture=${fixtureId}`)
  return rows.map(mapApiFootballLineup)
}

async function getStatisticsForFixtureId(fixtureId: number): Promise<WorldCupMatchStatistic[]> {
  const rows = await apiGet(`/fixtures/statistics?fixture=${fixtureId}`)
  return rows.flatMap(mapApiFootballStatistic)
}

async function getSquadFromApi(team: WorldCupTeam): Promise<WorldCupSquad> {
  if (!team.apiFootballId) {
    return { teamId: team.id, players: [], quality: quality() }
  }

  const rows = await apiGet(`/players/squads?team=${team.apiFootballId}`).catch(() => [])
  const squadRoot = record(rows[0])
  const players = arrayValue(squadRoot.players).map((rawPlayer, index) => {
    const player = record(rawPlayer)
    return {
      id: `af-player-${numberValue(player.id) ?? `${team.id}-${index + 1}`}`,
      name: stringValue(player.name) ?? `Player ${index + 1}`,
      age: numberValue(player.age),
      number: numberValue(player.number),
      position: stringValue(player.position),
      photoUrl: stringValue(player.photo),
    }
  })

  return {
    teamId: team.id,
    players,
    quality: quality(),
  }
}

function dashboardFromData(
  fixtures: WorldCupFixture[],
  groups: WorldCupGroupStanding[],
  teams: WorldCupTeam[],
): WorldCupDashboard {
  const now = Date.now()
  const liveMatches = fixtures.filter((fixture) => fixture.status === 'LIVE')
  const upcomingMatches = fixtures
    .filter((fixture) => fixture.status === 'SCHEDULED' && Date.parse(fixture.utcDate) >= now)
    .slice(0, 8)
  const recentMatches = fixtures.filter((fixture) => fixture.status === 'FINISHED').slice(-6).reverse()

  return {
    tournament: worldCupTournament,
    quality: quality({ isLive: liveMatches.length > 0 }),
    liveMatches,
    upcomingMatches,
    recentMatches,
    groups,
    teams,
    bracket: createBracket(fixtures),
  }
}

export const apiFootballWorldCupProvider: WorldCupProvider = {
  async getDashboard() {
    const fixtures = await getFixturesFromApi()
    const groups = await getGroupsFromApi().catch(() => [])
    const apiTeams = await getTeamsFromApi(groups).catch(() => [])
    const teams = apiTeams.length ? apiTeams : teamsFromFixtures(fixtures)
    return dashboardFromData(fixtures, groups, teams)
  },
  getFixtures: getFixturesFromApi,
  async getLiveFixtures() {
    const rows = await apiGet(`/fixtures?league=${worldCupLeagueId}&season=${worldCupSeason}&live=all`)
    return rows.map(mapApiFootballFixture)
  },
  getGroups: getGroupsFromApi,
  async getTeams() {
    const groups = await getGroupsFromApi().catch(() => [])
    const apiTeams = await getTeamsFromApi(groups).catch(() => [])
    if (apiTeams.length) return apiTeams
    return teamsFromFixtures(await getFixturesFromApi())
  },
  async getTeam(teamId) {
    const fixtures = await getFixturesFromApi()
    const groups = await getGroupsFromApi().catch(() => [])
    const apiTeams = await getTeamsFromApi(groups).catch(() => [])
    const teams = apiTeams.length ? apiTeams : teamsFromFixtures(fixtures)
    const standingByTeamId = new Map(groups.map((standing) => [standing.team.id, standing]))
    const found = teams.find((item) => matchesTeamRoute(item, teamId))
    if (!found) {
      throw new Error('World Cup team not found.')
    }
    const team = { ...found, group: standingByTeamId.get(found.id)?.group ?? found.group }
    const squad = await getSquadFromApi(team)
    return {
      team,
      squad,
      fixtures: fixtures.filter((fixture) => fixture.homeTeam.id === team.id || fixture.awayTeam.id === team.id),
    }
  },
  async getFixture(matchId) {
    const fixtures = await getFixturesFromApi()
    const fixture = fixtures.find((item) => item.id === matchId || String(item.apiFootballId) === matchId)
    if (!fixture) {
      throw new Error('World Cup match not found.')
    }
    return getEventsForFixture(fixture)
  },
  async getFixtureLineups(matchId) {
    const fixtureId = Number(matchId)
    if (!Number.isFinite(fixtureId)) return []
    return getLineupsForFixtureId(fixtureId)
  },
  async getFixtureStatistics(matchId) {
    const fixtureId = Number(matchId)
    if (!Number.isFinite(fixtureId)) return []
    return getStatisticsForFixtureId(fixtureId)
  },
  async getBracket() {
    return createBracket(await getFixturesFromApi())
  },
}
