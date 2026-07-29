/**
 * football-data.org v4 adapter.
 *
 * Routes through the local proxy (`buildLiveRequestUrl`), which injects the
 * `X-Auth-Token` header from the proxy-only `FOOTBALL_DATA_API_KEY` env var.
 * The browser bundle therefore never sees the API key.
 *
 * Free tier covers the top-5 European leagues for standings, scorers, and
 * matches at 10 requests/minute. Endpoints that this tier does not cover
 * (squads, individual player details) are intentionally not implemented here
 * — the cascade in `footballData.ts` falls through to TheSportsDB and then
 * to local mock data.
 */

import { leagues } from '@/lib/leagues'
import { createFlag, createPlayerAvatar, createTeamCrest, initialsFromName, normalizeImageSrc } from '@/lib/visualAssets'
import { fetchLiveJson } from '@/services/net/liveClient'

import type {
  Assist,
  FootballQueryParams,
  LeagueId,
  Match,
  Player,
  Scorer,
  Standing,
  Team,
} from './types'

const apiBase = 'https://api.football-data.org/v4'

function leagueOrDefault(leagueId?: LeagueId): LeagueId {
  return leagueId ?? 'premier-league'
}

function leagueConfig(leagueId: LeagueId) {
  const league = leagues.find((entry) => entry.id === leagueId)
  if (!league) {
    throw new Error(`Unknown leagueId: ${leagueId}`)
  }
  return league
}

/**
 * football-data.org accepts the season as the starting year (e.g. 2025 for the
 * 2025-26 season). We accept either `YYYY` or `YYYY-YY` and normalize.
 */
function normalizeSeason(season: string | undefined): string | undefined {
  if (!season) return undefined
  const match = /^(\d{4})/.exec(season.trim())
  return match ? match[1] : undefined
}

async function getJson<T>(url: string): Promise<T> {
  return fetchLiveJson<T>(url)
}

// ---------------------------------------------------------------------------
// Raw response shapes (only the fields we read)
// ---------------------------------------------------------------------------

interface FdArea {
  name?: string
  flag?: string
}

interface FdTeam {
  id: number
  name?: string
  shortName?: string
  tla?: string
  crest?: string
  venue?: string
  coach?: { name?: string } | null
  area?: FdArea
}

interface FdStandingRow {
  position: number
  team: FdTeam
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

interface FdStandingsResponse {
  competition?: { currentSeason?: { currentMatchday?: number | null } }
  season?: { currentMatchday?: number | null }
  standings: Array<{ type?: string; stage?: string; table: FdStandingRow[] }>
}

interface FdPlayer {
  id: number
  name?: string
  firstName?: string
  lastName?: string
  position?: string
  dateOfBirth?: string
  nationality?: string
}

interface FdScorerRow {
  player: FdPlayer
  team: FdTeam
  playedMatches?: number
  goals?: number
  assists?: number | null
  penalties?: number | null
}

interface FdScorersResponse {
  scorers: FdScorerRow[]
}

interface FdMatch {
  id: number
  utcDate: string
  status: string
  matchday: number
  homeTeam: FdTeam
  awayTeam: FdTeam
  score?: {
    fullTime?: { home?: number | null; away?: number | null }
    winner?: string | null
  }
  venue?: string
}

interface FdMatchesResponse {
  matches: FdMatch[]
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapTeam(raw: FdTeam, leagueId: LeagueId, index: number): Team {
  const league = leagueConfig(leagueId)
  const name = raw.name?.trim() || raw.shortName?.trim() || 'Unknown Team'
  const shortName = raw.tla?.trim() || raw.shortName?.trim() || name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
  const primaryCrest = normalizeImageSrc(raw.crest)
  // football-data.org serves crests as .svg via crests.football-data.org.
  // Some clubs only have .png; offer the .png variant as a secondary URL so
  // the image cascade can recover automatically.
  const pngVariant = primaryCrest?.endsWith('.svg')
    ? `${primaryCrest.slice(0, -4)}.png`
    : undefined
  const syntheticCrest = createTeamCrest(shortName, league.color, '#f4f4f5', index)
  const crestSources = [primaryCrest, pngVariant].filter((value): value is string => Boolean(value))

  return {
    id: `fd-${raw.id}`,
    leagueId,
    name,
    shortName,
    crest: primaryCrest ?? syntheticCrest,
    crestSources: crestSources.length ? crestSources : undefined,
    manager: raw.coach?.name ?? undefined,
    stadium: raw.venue ?? undefined,
    primaryColor: league.color,
    secondaryColor: '#f4f4f5',
  }
}

function ageFromDob(dob: string | undefined): number {
  if (!dob) return 25
  const birth = Date.parse(dob)
  if (!Number.isFinite(birth)) return 25
  const years = (Date.now() - birth) / (365.25 * 24 * 3_600_000)
  return Math.max(16, Math.round(years))
}

function mapPlayer(raw: FdPlayer, team: Team, stats: { goals: number; assists: number; appearances: number }): Player {
  const name = raw.name?.trim() || [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() || 'Unknown Player'
  const position = (() => {
    const value = (raw.position ?? '').toLowerCase()
    if (value.includes('goal')) return 'GK' as const
    if (value.includes('back') || value.includes('defen')) return 'DF' as const
    if (value.includes('mid')) return 'MF' as const
    return 'FW' as const
  })()
  const nationality = raw.nationality ?? 'International'

  return {
    id: `fd-${raw.id}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    number: 0,
    position,
    nationality,
    flag: createFlag('england'),
    age: ageFromDob(raw.dateOfBirth),
    heightCm: 180,
    weightKg: 75,
    photo: createPlayerAvatar(initialsFromName(name), team.primaryColor ?? '#0f766e'),
    marketValueEurCents: 0,
    contractUntil: '',
    stats: {
      appearances: stats.appearances,
      goals: stats.goals,
      assists: stats.assists,
      yellowCards: 0,
      redCards: 0,
      minutes: stats.appearances * 90,
      trend: [stats.goals, stats.goals + stats.assists, stats.assists, stats.goals, stats.assists].slice(0, 5),
      attributes: {
        pace: 70,
        shooting: position === 'FW' ? 78 : 60,
        passing: position === 'MF' ? 78 : 65,
        dribbling: 70,
        defending: position === 'DF' ? 78 : 50,
        physical: 70,
      },
    },
  }
}

function mapStandingForm(form: string | null | undefined) {
  if (!form) return []
  return form
    .split(',')
    .map((entry) => entry.trim().toUpperCase())
    .filter((entry): entry is 'W' | 'D' | 'L' => entry === 'W' || entry === 'D' || entry === 'L')
    .slice(-5)
    .map((result, index) => ({
      result,
      opponent: '',
      score: '',
      date: `R-${index}`,
    }))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagueConfig(leagueId)
  const season = normalizeSeason(params.season)
  const url = `${apiBase}/competitions/${league.apiCode}/standings${season ? `?season=${season}` : ''}`
  const data = await getJson<FdStandingsResponse>(url)
  const totalTable = data.standings.find((entry) => entry.type === 'TOTAL' || !entry.type) ?? data.standings[0]
  if (!totalTable?.table?.length) {
    throw new Error('football-data.org returned no standings')
  }

  return totalTable.table.map((row, index): Standing => {
    const team = mapTeam(row.team, leagueId, index)
    return {
      id: `${team.id}-standing`,
      leagueId,
      position: row.position,
      team,
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
      form: mapStandingForm(row.form),
      avgPossession: 50,
    }
  })
}

export async function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagueConfig(leagueId)
  const season = normalizeSeason(params.season)
  const url = `${apiBase}/competitions/${league.apiCode}/scorers?limit=20${season ? `&season=${season}` : ''}`
  const data = await getJson<FdScorersResponse>(url)
  if (!data.scorers?.length) {
    throw new Error('football-data.org returned no scorers')
  }

  return data.scorers.map((row, index): Scorer => {
    const team = mapTeam(row.team, leagueId, index)
    const goals = row.goals ?? 0
    const assists = row.assists ?? 0
    const player = mapPlayer(row.player, team, { goals, assists, appearances: row.playedMatches ?? 0 })
    return {
      id: `${player.id}-scorer`,
      player,
      team,
      goals,
      assists,
    }
  })
}

export async function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  const scorers = await getTopScorers(params)
  return scorers
    .filter((entry) => entry.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 20)
    .map(
      (entry): Assist => ({
        id: `${entry.player.id}-assist`,
        player: entry.player,
        team: entry.team,
        assists: entry.assists,
        goals: entry.goals,
      }),
    )
}

export async function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagueConfig(leagueId)
  const season = normalizeSeason(params.season)
  const queryParts: string[] = []
  if (season) queryParts.push(`season=${season}`)
  if (params.matchday) queryParts.push(`matchday=${params.matchday}`)
  const url = `${apiBase}/competitions/${league.apiCode}/matches${queryParts.length ? `?${queryParts.join('&')}` : ''}`
  const data = await getJson<FdMatchesResponse>(url)
  if (!data.matches?.length) {
    throw new Error('football-data.org returned no matches')
  }

  return data.matches.map((raw, index): Match => {
    const homeTeam = mapTeam(raw.homeTeam, leagueId, index)
    const awayTeam = mapTeam(raw.awayTeam, leagueId, index + 1)
    const status = (() => {
      const value = raw.status?.toUpperCase()
      if (value === 'IN_PLAY' || value === 'PAUSED' || value === 'LIVE') return 'LIVE' as const
      if (value === 'FINISHED') return 'FINISHED' as const
      return 'SCHEDULED' as const
    })()

    return {
      id: `fd-${raw.id}`,
      leagueId,
      season: season ?? '',
      matchday: raw.matchday,
      utcDate: raw.utcDate,
      status,
      homeTeam,
      awayTeam,
      homeScore: raw.score?.fullTime?.home ?? undefined,
      awayScore: raw.score?.fullTime?.away ?? undefined,
      venue: raw.venue,
      events: [],
    }
  })
}
