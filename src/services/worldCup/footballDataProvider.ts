/**
 * football-data.org World Cup 2026 provider.
 *
 * Returns REAL FIFA World Cup 2026 data (groups, fixtures, results, squads,
 * coaches, referees and official national-team crests) through the local proxy,
 * which injects the free-tier `FOOTBALL_DATA_API_KEY`. The free tier covers the
 * competition `WC` (id 2000) end to end: 104 matches, 12 groups, 48 teams and
 * top scorers at 10 requests/minute.
 *
 * What the free tier does NOT expose — in-match event timelines, lineups with
 * formations, possession-style statistics and venues — is returned as empty,
 * so the UI says so instead of inventing data. Every response is validated
 * with Zod (`./schemas`).
 */

import type { z } from 'zod'

import { LiveHttpError, fetchLiveJson } from '@/services/net/liveClient'

import { NotFoundError } from '../errors'

import { rankGroup, type GroupResult } from './groupRanking'
import {
  type FdMatch,
  type FdScore,
  type FdScoreHalf,
  type FdSquadPlayer,
  type FdStandingRow,
  type FdTeamRef,
  fdMatchSchema,
  fdMatchesResponseSchema,
  fdStandingsResponseSchema,
  fdTeamDetailSchema,
  fdTeamsResponseSchema,
} from './schemas'
import { worldCupTournament } from './tournament'
import type {
  DataQualityMeta,
  WorldCupBracketMatch,
  WorldCupBracketRound,
  WorldCupDecidedBy,
  WorldCupDashboard,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupLineup,
  WorldCupMatchStatistic,
  WorldCupMatchStatus,
  WorldCupMatchWinner,
  WorldCupProvider,
  WorldCupScore,
  WorldCupSquad,
  WorldCupSquadPlayer,
  WorldCupTeam,
} from './types'

const apiBase = 'https://api.football-data.org/v4'
const competition = 'WC'
/** Without an explicit season, finished tournaments 404 on /standings. */
const competitionPath = (resource: string) => `/competitions/${competition}/${resource}?season=${worldCupTournament.season}`

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

// Shares the app-wide fetch client: dedupe, the football-data.org throttle
// (the WC area and the leagues use the same 10 req/min key), timeouts, retries.
async function getJson<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  let raw: unknown
  try {
    raw = await fetchLiveJson<unknown>(`${apiBase}${path}`)
  } catch (error) {
    if (error instanceof LiveHttpError && error.status === 404) {
      throw new NotFoundError(`World Cup resource ${path} not found.`)
    }
    throw error
  }
  return schema.parse(raw)
}

const getMatches = async () => (await getJson(competitionPath('matches'), fdMatchesResponseSchema)).matches ?? []

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function quality(overrides: Partial<DataQualityMeta> = {}): DataQualityMeta {
  const now = new Date().toISOString()
  return {
    provider: 'football-data-org',
    fetchedAt: now,
    lastUpdated: now,
    isLive: false,
    ...overrides,
  }
}

function teamSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeGroup(group?: string | null): string | undefined {
  if (!group) return undefined
  const match = /([a-l])\s*$/i.exec(group.replace(/group/i, '').trim())
  return match ? match[1]!.toUpperCase() : undefined
}

const STAGE_MAP: Record<string, WorldCupFixture['stage']> = {
  GROUP_STAGE: 'group',
  LAST_32: 'round-of-32',
  LAST_16: 'round-of-16',
  QUARTER_FINALS: 'quarter-final',
  SEMI_FINALS: 'semi-final',
  THIRD_PLACE: 'third-place',
  FINAL: 'final',
}

const KNOCKOUT_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'THIRD_PLACE', 'FINAL']

function stageOf(stage: string): WorldCupFixture['stage'] {
  return STAGE_MAP[stage] ?? 'unknown'
}

function statusOf(status: string): WorldCupMatchStatus {
  switch (status) {
    case 'IN_PLAY':
    case 'PAUSED':
      return 'LIVE'
    case 'FINISHED':
    case 'AWARDED':
      return 'FINISHED'
    case 'POSTPONED':
    case 'SUSPENDED':
    case 'CANCELLED':
      return 'POSTPONED'
    default:
      return 'SCHEDULED'
  }
}

function mapTeamRef(raw: FdTeamRef | undefined, group?: string): WorldCupTeam {
  const name = raw?.name?.trim() || 'TBD'
  const id = raw?.id
  return {
    id: id ? `fd-${id}` : `wc-${teamSlug(name)}`,
    name,
    code: raw?.tla?.trim() || name.slice(0, 3).toUpperCase(),
    country: name,
    flagUrl: raw?.crest?.trim() || undefined,
    group,
    placeholder: !id || name === 'TBD',
  }
}

function half(score?: FdScoreHalf | null) {
  if (!score) return undefined
  const home = typeof score.home === 'number' ? score.home : undefined
  const away = typeof score.away === 'number' ? score.away : undefined
  if (home === undefined && away === undefined) return undefined
  return { home, away }
}

function winnerOf(value?: string | null): WorldCupMatchWinner | undefined {
  if (value === 'HOME_TEAM') return 'home'
  if (value === 'AWAY_TEAM') return 'away'
  if (value === 'DRAW') return 'draw'
  return undefined
}

function decidedByOf(value?: string | null): WorldCupDecidedBy | undefined {
  if (value === 'PENALTY_SHOOTOUT') return 'penalties'
  if (value === 'EXTRA_TIME') return 'extra-time'
  if (value === 'REGULAR') return 'regular'
  return undefined
}

/**
 * football-data.org v4 adds the shoot-out to `fullTime` (Germany–Paraguay 1:1
 * a.e.t., 3:4 on penalties arrives as fullTime 4:5). The match score is
 * therefore fullTime minus penalties.
 */
function matchScore(score?: FdScore | null): WorldCupScore | undefined {
  const fullTime = half(score?.fullTime)
  const penalties = half(score?.penalties)
  if (!fullTime || !penalties) return fullTime
  const minus = (total?: number, shootout?: number) =>
    total === undefined ? undefined : total - (shootout ?? 0)
  return { home: minus(fullTime.home, penalties.home), away: minus(fullTime.away, penalties.away) }
}

export function mapFixture(raw: FdMatch): WorldCupFixture {
  const group = normalizeGroup(raw.group)
  const status = statusOf(raw.status)
  const score = matchScore(raw.score)
  const decidedBy = decidedByOf(raw.score?.duration)
  const penalties = half(raw.score?.penalties)
  const referee = raw.referees?.find((entry) => entry.type === 'REFEREE') ?? raw.referees?.[0]

  return {
    id: `fd-${raw.id}`,
    group,
    stage: stageOf(raw.stage),
    utcDate: raw.utcDate,
    status,
    referee: referee?.name?.trim() || undefined,
    venue: raw.venue?.trim() || undefined,
    homeTeam: mapTeamRef(raw.homeTeam, group),
    awayTeam: mapTeamRef(raw.awayTeam, group),
    homeScore: score?.home,
    awayScore: score?.away,
    winner: status === 'FINISHED' ? winnerOf(raw.score?.winner) : undefined,
    decidedBy: status === 'FINISHED' ? decidedBy : undefined,
    penalties,
    scoreBreakdown: {
      halftime: half(raw.score?.halfTime),
      regular: half(raw.score?.regularTime) ?? (decidedBy === 'regular' ? score : undefined),
      extratime: half(raw.score?.extraTime),
      penalty: penalties,
    },
    events: [],
    quality: quality({ isLive: status === 'LIVE', lastUpdated: raw.lastUpdated ?? new Date().toISOString() }),
  }
}

function mapStandingRow(
  raw: FdStandingRow,
  group: string,
  hint: WorldCupGroupStanding['qualificationHint'],
): WorldCupGroupStanding {
  const form = (raw.form ?? '')
    .split(/[,\s]+/)
    .map((token) => token.trim().toUpperCase())
    .filter((token): token is 'W' | 'D' | 'L' => token === 'W' || token === 'D' || token === 'L')

  return {
    id: `fd-${group}-${raw.team.id ?? raw.position}`,
    group,
    rank: raw.position,
    team: mapTeamRef(raw.team, group),
    played: raw.playedGames,
    won: raw.won,
    drawn: raw.draw,
    lost: raw.lost,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    goalDifference: raw.goalDifference,
    points: raw.points,
    form,
    qualificationHint: hint,
    quality: quality(),
  }
}

/** Age on the tournament's opening day — the archive must not age players. */
export function ageAtTournamentStart(dob?: string | null): number | undefined {
  if (!dob) return undefined
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return undefined
  const start = new Date(worldCupTournament.startsAt)
  const hadBirthday =
    start.getUTCMonth() > birth.getUTCMonth() ||
    (start.getUTCMonth() === birth.getUTCMonth() && start.getUTCDate() >= birth.getUTCDate())
  return start.getUTCFullYear() - birth.getUTCFullYear() - (hadBirthday ? 0 : 1)
}

function mapSquadPlayer(raw: FdSquadPlayer): WorldCupSquadPlayer {
  return {
    id: `fd-${raw.id}`,
    name: raw.name?.trim() || 'Unknown',
    age: ageAtTournamentStart(raw.dateOfBirth),
    number: typeof raw.shirtNumber === 'number' ? raw.shirtNumber : undefined,
    position: raw.position?.trim() || undefined,
  }
}

function teamMatchesRoute(team: WorldCupTeam, route: string): boolean {
  return (
    team.id === route ||
    team.id === `fd-${route}` ||
    route === String(team.id).replace(/^fd-/, '') ||
    teamSlug(team.name) === route
  )
}

// ---------------------------------------------------------------------------
// Composite loaders
// ---------------------------------------------------------------------------

async function loadFixtures(): Promise<WorldCupFixture[]> {
  return (await getMatches())
    .map(mapFixture)
    .sort((left, right) => left.utcDate.localeCompare(right.utcDate))
}

/** Group letter per team id, read from the group-stage fixtures. */
function groupsFromMatches(matches: FdMatch[]): Map<number, string> {
  const groupByTeam = new Map<number, string>()
  for (const match of matches) {
    const group = match.stage === 'GROUP_STAGE' ? normalizeGroup(match.group) : undefined
    if (!group) continue
    for (const team of [match.homeTeam, match.awayTeam]) if (typeof team.id === 'number') groupByTeam.set(team.id, group)
  }
  return groupByTeam
}

function groupResults(matches: FdMatch[]): GroupResult[] {
  return matches.flatMap((match) => {
    const homeId = match.homeTeam.id
    const awayId = match.awayTeam.id
    const score = matchScore(match.score)
    if (match.stage !== 'GROUP_STAGE' || statusOf(match.status) !== 'FINISHED') return []
    if (typeof homeId !== 'number' || typeof awayId !== 'number') return []
    if (score?.home === undefined || score.away === undefined) return []
    return [{ homeId, awayId, homeGoals: score.home, awayGoals: score.away }]
  })
}

/**
 * Teams in the round of 32 once every group match is finished. Group winners
 * and runners-up enter the bracket as their group ends, but the best thirds
 * are only assigned after all twelve groups — trusting a partial bracket would
 * call every third place "eliminated" too early.
 */
function roundOf32Teams(matches: FdMatch[]): Set<number> | undefined {
  const groupMatches = matches.filter((match) => match.stage === 'GROUP_STAGE')
  if (!groupMatches.length || groupMatches.some((match) => statusOf(match.status) !== 'FINISHED')) return undefined
  const ids = matches
    .filter((match) => match.stage === 'LAST_32')
    .flatMap((match) => [match.homeTeam.id, match.awayTeam.id])
    .filter((id): id is number => typeof id === 'number')
  return ids.length ? new Set(ids) : undefined
}

function hintFor(rank: number, teamId: number | null | undefined, qualified?: Set<number>): WorldCupGroupStanding['qualificationHint'] {
  if (rank <= 2) return 'top-two'
  if (!qualified) return rank === 3 ? 'best-third-watch' : 'pending'
  return rank === 3 && typeof teamId === 'number' && qualified.has(teamId) ? 'best-third' : 'eliminated'
}

async function loadGroups(rawMatches?: FdMatch[]): Promise<WorldCupGroupStanding[]> {
  const data = await getJson(competitionPath('standings'), fdStandingsResponseSchema)
  const totals = (data.standings ?? []).filter((block) => !block.type || block.type === 'TOTAL')
  // Archived tournaments also carry tables for later stages; group ranks and
  // stats come from the group stage only.
  const groupStage = totals.filter((block) => block.stage === 'GROUP_STAGE')
  const blocks = groupStage.length ? groupStage : totals
  const matches = rawMatches ?? (await getMatches())
  const qualified = roundOf32Teams(matches)
  const rows: WorldCupGroupStanding[] = []

  if (blocks.some((block) => normalizeGroup(block.group))) {
    for (const block of blocks) {
      const group = normalizeGroup(block.group) ?? '?'
      for (const row of block.table ?? []) rows.push(mapStandingRow(row, group, hintFor(row.position, row.team.id, qualified)))
    }
    return rows
  }

  // Archived tournaments come back as one overall table without groups (and
  // possibly one TOTAL block per stage): take each team once, split by the
  // group-stage fixtures and rank with the FIFA tiebreakers.
  const groupByTeam = groupsFromMatches(matches)
  const byGroup = new Map<string, Array<FdStandingRow & { teamId: number; providerOrder: number }>>()
  const seen = new Set<number>()
  for (const row of blocks.flatMap((block) => block.table ?? []).sort((a, b) => a.position - b.position)) {
    const teamId = row.team.id
    const group = typeof teamId === 'number' ? groupByTeam.get(teamId) : undefined
    if (typeof teamId !== 'number' || !group || seen.has(teamId)) continue
    seen.add(teamId)
    byGroup.set(group, [...(byGroup.get(group) ?? []), { ...row, teamId, providerOrder: row.position }])
  }

  const results = groupResults(matches)
  for (const [group, teams] of byGroup) {
    rankGroup(teams, results).forEach((row, index) => {
      const rank = index + 1
      rows.push(mapStandingRow({ ...row, position: rank }, group, hintFor(rank, row.teamId, qualified)))
    })
  }
  return rows.sort((a, b) => a.group.localeCompare(b.group) || a.rank - b.rank)
}

async function loadTeams(groups?: WorldCupGroupStanding[]): Promise<WorldCupTeam[]> {
  const data = await getJson(competitionPath('teams'), fdTeamsResponseSchema)
  const groupByTeamId = new Map<string, string>()
  for (const row of groups ?? []) {
    groupByTeamId.set(row.team.id, row.group)
  }
  return (data.teams ?? [])
    .map((team) => {
      const mapped = mapTeamRef(team)
      return { ...mapped, group: groupByTeamId.get(mapped.id) ?? mapped.group }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

function buildBracket(fixtures: WorldCupFixture[], rawStageByFixtureId: Map<string, string>): WorldCupBracketRound[] {
  const rounds: WorldCupBracketRound[] = []
  for (const stageKey of KNOCKOUT_ORDER) {
    const stageFixtures = fixtures
      .filter((fixture) => rawStageByFixtureId.get(fixture.id) === stageKey)
      .sort((left, right) => left.utcDate.localeCompare(right.utcDate))
    if (stageFixtures.length === 0) continue

    const matches: WorldCupBracketMatch[] = stageFixtures.map((fixture) => ({
      id: fixture.id,
      utcDate: fixture.utcDate,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      winner: fixture.winner,
      decidedBy: fixture.decidedBy,
      penalties: fixture.penalties,
      placeholder: Boolean(fixture.homeTeam.placeholder || fixture.awayTeam.placeholder),
    }))

    rounds.push({ id: stageKey.toLowerCase(), stage: stageOf(stageKey), matches })
  }
  return rounds
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

async function getDashboard(): Promise<WorldCupDashboard> {
  const rawMatches = await getMatches()
  const groups = await loadGroups(rawMatches).catch(() => [] as WorldCupGroupStanding[])

  const rawStageByFixtureId = new Map<string, string>()
  for (const match of rawMatches) {
    rawStageByFixtureId.set(`fd-${match.id}`, match.stage)
  }

  const fixtures = rawMatches
    .map(mapFixture)
    .sort((left, right) => left.utcDate.localeCompare(right.utcDate))

  const teams = await loadTeams(groups).catch(() => [] as WorldCupTeam[])

  const live = fixtures.filter((fixture) => fixture.status === 'LIVE')
  const upcoming = fixtures
    .filter((fixture) => fixture.status === 'SCHEDULED')
    .slice(0, 8)
  const recent = fixtures
    .filter((fixture) => fixture.status === 'FINISHED')
    .sort((left, right) => right.utcDate.localeCompare(left.utcDate))
    .slice(0, 8)

  const lastUpdated = rawMatches.reduce<string>((latest, match) => {
    const value = match.lastUpdated ?? ''
    return value > latest ? value : latest
  }, '') || new Date().toISOString()

  return {
    tournament: { ...worldCupTournament },
    quality: quality({ isLive: live.length > 0, lastUpdated }),
    liveMatches: live,
    upcomingMatches: upcoming,
    recentMatches: recent,
    groups,
    teams,
    bracket: buildBracket(fixtures, rawStageByFixtureId),
  }
}

async function getBracket(): Promise<WorldCupBracketRound[]> {
  const rawMatches = await getMatches()
  const rawStageByFixtureId = new Map<string, string>()
  for (const match of rawMatches) {
    rawStageByFixtureId.set(`fd-${match.id}`, match.stage)
  }
  const fixtures = rawMatches.map(mapFixture)
  return buildBracket(fixtures, rawStageByFixtureId)
}

async function getTeam(teamId: string): Promise<{ team: WorldCupTeam; squad: WorldCupSquad; fixtures: WorldCupFixture[] }> {
  const numericId = teamId.replace(/^fd-/, '')
  const [detail, fixtures] = await Promise.all([
    getJson(`/teams/${numericId}`, fdTeamDetailSchema),
    loadFixtures().catch(() => [] as WorldCupFixture[]),
  ])

  const teamFixtures = fixtures.filter(
    (fixture) => teamMatchesRoute(fixture.homeTeam, numericId) || teamMatchesRoute(fixture.awayTeam, numericId),
  )
  const group = teamFixtures.map((fixture) => fixture.group).find(Boolean)

  const team: WorldCupTeam = {
    ...mapTeamRef(detail, group),
    coach: detail.coach?.name?.trim() || undefined,
  }

  const squad: WorldCupSquad = {
    teamId: team.id,
    players: (detail.squad ?? []).map(mapSquadPlayer),
    quality: quality(),
  }

  return { team, squad, fixtures: teamFixtures }
}

async function getFixture(matchId: string): Promise<WorldCupFixture> {
  const numericId = matchId.replace(/^fd-/, '')
  const raw = await getJson(`/matches/${numericId}`, fdMatchSchema)
  return mapFixture(raw)
}

async function getFixtureLineups(): Promise<WorldCupLineup[]> {
  // The football-data.org free tier does not expose starting lineups.
  return []
}

async function getFixtureStatistics(): Promise<WorldCupMatchStatistic[]> {
  // The football-data.org free tier does not expose in-match statistics.
  return []
}

async function getLiveFixtures(): Promise<WorldCupFixture[]> {
  const fixtures = await loadFixtures()
  return fixtures.filter((fixture) => fixture.status === 'LIVE')
}

export const footballDataWorldCupProvider: WorldCupProvider = {
  getDashboard,
  getFixtures: loadFixtures,
  getGroups: loadGroups,
  getTeams: () => loadGroups().catch(() => []).then((groups) => loadTeams(groups)),
  getTeam,
  getFixture,
  getFixtureLineups,
  getFixtureStatistics,
  getLiveFixtures,
  getBracket,
}
