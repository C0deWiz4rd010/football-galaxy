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

import { z } from 'zod'

import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, createTeamCrest, initialsFromName, normalizeImageSrc } from '@/lib/visualAssets'
import { fetchLiveJson } from '@/services/net/liveClient'

import type {
  Assist,
  FootballQueryParams,
  LeagueId,
  Match,
  PlayerRef,
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

async function getJson<S extends z.ZodType>(url: string, schema: S): Promise<z.infer<S>> {
  return schema.parse(await fetchLiveJson<unknown>(url))
}

// ---------------------------------------------------------------------------
// Raw response schemas (only the fields we read; unknown fields are stripped)
// ---------------------------------------------------------------------------

const nullishString = z.string().nullish()

const fdTeamSchema = z.object({
  id: z.number(),
  name: nullishString,
  shortName: nullishString,
  tla: nullishString,
  crest: nullishString,
  venue: nullishString,
  coach: z.object({ name: nullishString }).nullish(),
})
type FdTeam = z.infer<typeof fdTeamSchema>

const fdStandingsSchema = z.object({
  standings: z.array(
    z.object({
      type: nullishString,
      table: z.array(
        z.object({
          position: z.number(),
          team: fdTeamSchema,
          playedGames: z.number(),
          won: z.number(),
          draw: z.number(),
          lost: z.number(),
          points: z.number(),
          goalsFor: z.number(),
          goalsAgainst: z.number(),
          goalDifference: z.number(),
          form: nullishString,
        }),
      ),
    }),
  ),
})

const fdPlayerSchema = z.object({
  id: z.number(),
  name: nullishString,
  firstName: nullishString,
  lastName: nullishString,
  nationality: nullishString,
})
type FdPlayer = z.infer<typeof fdPlayerSchema>

const fdScorersSchema = z.object({
  scorers: z.array(
    z.object({
      player: fdPlayerSchema,
      team: fdTeamSchema,
      playedMatches: z.number().nullish(),
      goals: z.number().nullish(),
      assists: z.number().nullish(),
    }),
  ),
})

const fdMatchesSchema = z.object({
  matches: z.array(
    z.object({
      id: z.number(),
      utcDate: z.string(),
      status: nullishString,
      matchday: z.number().nullish(),
      homeTeam: fdTeamSchema,
      awayTeam: fdTeamSchema,
      score: z.object({ fullTime: z.object({ home: z.number().nullish(), away: z.number().nullish() }).nullish() }).nullish(),
      venue: nullishString,
    }),
  ),
})

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
  const primaryCrest = normalizeImageSrc(raw.crest ?? undefined)
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

function mapPlayerRef(raw: FdPlayer, team: Team, stats: { goals: number; assists: number; appearances: number }): PlayerRef {
  const name = raw.name?.trim() || [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim() || 'Unknown Player'
  return {
    id: `fd-${raw.id}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    nationality: raw.nationality ?? undefined,
    photo: createPlayerAvatar(initialsFromName(name), team.primaryColor ?? '#0f766e'),
    ...stats,
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
  const data = await getJson(url, fdStandingsSchema)
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
    }
  })
}

export async function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagueConfig(leagueId)
  const season = normalizeSeason(params.season)
  const url = `${apiBase}/competitions/${league.apiCode}/scorers?limit=20${season ? `&season=${season}` : ''}`
  const data = await getJson(url, fdScorersSchema)
  if (!data.scorers?.length) {
    throw new Error('football-data.org returned no scorers')
  }

  return data.scorers.map((row, index): Scorer => {
    const team = mapTeam(row.team, leagueId, index)
    const goals = row.goals ?? 0
    const assists = row.assists ?? 0
    const player = mapPlayerRef(row.player, team, { goals, assists, appearances: row.playedMatches ?? 0 })
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
  const data = await getJson(url, fdMatchesSchema)
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
      matchday: raw.matchday ?? 0,
      utcDate: raw.utcDate,
      status,
      homeTeam,
      awayTeam,
      homeScore: raw.score?.fullTime?.home ?? undefined,
      awayScore: raw.score?.fullTime?.away ?? undefined,
      venue: raw.venue ?? undefined,
      events: [],
    }
  })
}
