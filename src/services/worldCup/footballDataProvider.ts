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
 * formations, and possession-style statistics — is returned as empty arrays
 * with an explanatory `note`, so the UI degrades gracefully instead of inventing
 * data.
 */

import { buildLiveRequestUrl } from '@/services/config/liveProxy'

import { worldCupTournament } from './tournament'
import type {
  DataQualityMeta,
  WorldCupBracketMatch,
  WorldCupBracketRound,
  WorldCupDashboard,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupLineup,
  WorldCupMatchStatistic,
  WorldCupMatchStatus,
  WorldCupProvider,
  WorldCupSquad,
  WorldCupSquadPlayer,
  WorldCupTeam,
} from './types'

const apiBase = 'https://api.football-data.org/v4'
const competition = 'WC'

// ---------------------------------------------------------------------------
// Raw football-data.org response shapes (only the fields we read)
// ---------------------------------------------------------------------------

interface FdTeamRef {
  id?: number
  name?: string
  shortName?: string
  tla?: string
  crest?: string
}

interface FdScoreHalf {
  home?: number | null
  away?: number | null
}

interface FdScore {
  winner?: string | null
  duration?: string
  fullTime?: FdScoreHalf
  halfTime?: FdScoreHalf
  extraTime?: FdScoreHalf
  penalties?: FdScoreHalf
}

interface FdReferee {
  id?: number
  name?: string
  type?: string
  nationality?: string
}

interface FdMatch {
  id: number
  utcDate: string
  status: string
  stage: string
  group?: string | null
  matchday?: number | null
  venue?: string | null
  lastUpdated?: string
  homeTeam: FdTeamRef
  awayTeam: FdTeamRef
  score?: FdScore
  referees?: FdReferee[]
}

interface FdStandingRow {
  position: number
  team: FdTeamRef
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form?: string | null
}

interface FdStandingGroup {
  stage?: string
  type?: string
  group?: string | null
  table: FdStandingRow[]
}

interface FdSquadPlayer {
  id: number
  name?: string
  position?: string | null
  dateOfBirth?: string | null
  nationality?: string | null
  shirtNumber?: number | null
}

interface FdCoach {
  id?: number
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  nationality?: string | null
}

interface FdTeamDetail extends FdTeamRef {
  area?: { name?: string }
  coach?: FdCoach | null
  squad?: FdSquadPlayer[]
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(buildLiveRequestUrl(`${apiBase}${path}`))
  if (!response.ok) {
    throw new Error(`football-data.org World Cup request failed (${response.status})`)
  }
  return (await response.json()) as T
}

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
    confidence: 'official',
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

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: 'Group stage',
  LAST_32: 'Round of 32',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS: 'Semi-finals',
  THIRD_PLACE: 'Third-place play-off',
  FINAL: 'Final',
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

function half(score?: FdScoreHalf) {
  if (!score) return undefined
  const home = typeof score.home === 'number' ? score.home : undefined
  const away = typeof score.away === 'number' ? score.away : undefined
  if (home === undefined && away === undefined) return undefined
  return { home, away }
}

function mapFixture(raw: FdMatch): WorldCupFixture {
  const group = normalizeGroup(raw.group)
  const status = statusOf(raw.status)
  const fullTime = half(raw.score?.fullTime)
  const referee = raw.referees?.find((entry) => entry.type === 'REFEREE') ?? raw.referees?.[0]

  return {
    id: `fd-${raw.id}`,
    round: STAGE_LABEL[raw.stage] ?? (group ? `Group ${group}` : 'World Cup'),
    group,
    stage: stageOf(raw.stage),
    utcDate: raw.utcDate,
    status,
    referee: referee?.name?.trim() || undefined,
    venue: raw.venue?.trim() || undefined,
    homeTeam: mapTeamRef(raw.homeTeam, group),
    awayTeam: mapTeamRef(raw.awayTeam, group),
    homeScore: fullTime?.home,
    awayScore: fullTime?.away,
    scoreBreakdown: {
      halftime: half(raw.score?.halfTime),
      fulltime: fullTime,
      extratime: half(raw.score?.extraTime),
      penalty: half(raw.score?.penalties),
    },
    events: [],
    quality: quality({ isLive: status === 'LIVE', lastUpdated: raw.lastUpdated ?? new Date().toISOString() }),
  }
}

function mapStandingRow(raw: FdStandingRow, group: string): WorldCupGroupStanding {
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
    qualificationHint: raw.position <= 2 ? 'top-two' : raw.position === 3 ? 'best-third-watch' : 'pending',
    quality: quality(),
  }
}

function ageFromDob(dob?: string | null): number | undefined {
  if (!dob) return undefined
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return undefined
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
}

function mapSquadPlayer(raw: FdSquadPlayer): WorldCupSquadPlayer {
  return {
    id: `fd-${raw.id}`,
    name: raw.name?.trim() || 'Unknown',
    age: ageFromDob(raw.dateOfBirth),
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
  const data = await getJson<{ matches?: FdMatch[] }>(`/competitions/${competition}/matches`)
  return (data.matches ?? [])
    .map(mapFixture)
    .sort((left, right) => left.utcDate.localeCompare(right.utcDate))
}

async function loadGroups(): Promise<WorldCupGroupStanding[]> {
  const data = await getJson<{ standings?: FdStandingGroup[] }>(`/competitions/${competition}/standings`)
  const rows: WorldCupGroupStanding[] = []
  for (const block of data.standings ?? []) {
    const group = normalizeGroup(block.group) ?? '?'
    for (const row of block.table ?? []) {
      rows.push(mapStandingRow(row, group))
    }
  }
  return rows
}

async function loadTeams(groups?: WorldCupGroupStanding[]): Promise<WorldCupTeam[]> {
  const data = await getJson<{ teams?: FdTeamRef[] }>(`/competitions/${competition}/teams`)
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
      label: `${fixture.homeTeam.code} v ${fixture.awayTeam.code}`,
      utcDate: fixture.utcDate,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      placeholder: Boolean(fixture.homeTeam.placeholder || fixture.awayTeam.placeholder),
    }))

    rounds.push({ id: stageKey.toLowerCase(), label: STAGE_LABEL[stageKey] ?? stageKey, matches })
  }
  return rounds
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

async function getDashboard(): Promise<WorldCupDashboard> {
  const [rawMatchesData, groups] = await Promise.all([
    getJson<{ matches?: FdMatch[] }>(`/competitions/${competition}/matches`),
    loadGroups().catch(() => [] as WorldCupGroupStanding[]),
  ])

  const rawMatches = rawMatchesData.matches ?? []
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
  const data = await getJson<{ matches?: FdMatch[] }>(`/competitions/${competition}/matches`)
  const rawMatches = data.matches ?? []
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
    getJson<FdTeamDetail>(`/teams/${numericId}`),
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
    quality: quality({
      note: (detail.squad ?? []).length === 0 ? 'Squad not yet published by the official feed.' : undefined,
    }),
  }

  return { team, squad, fixtures: teamFixtures }
}

async function getFixture(matchId: string): Promise<WorldCupFixture> {
  const numericId = matchId.replace(/^fd-/, '')
  const raw = await getJson<FdMatch>(`/matches/${numericId}`)
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
