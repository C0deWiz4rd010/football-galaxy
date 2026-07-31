/**
 * ESPN keyless standings/league provider.
 *
 * ESPN's public "hidden" site API exposes a full soccer standings table per
 * competition without any API key. It already covers the top-5 European leagues
 * and its host (`site.api.espn.com`) is on the proxy allowlist, which makes it a
 * perfect free safety net in the standings cascade: even when TheSportsDB is
 * rate-limited and no football-data.org key is configured, the league table
 * still renders.
 *
 * Responses are Zod-validated leniently (every field optional) so an upstream
 * shape change degrades to a thrown error the cascade can fall past, never a
 * crash.
 */

import { z } from 'zod'

import { fetchLiveJson } from '@/services/net/liveClient'
import { leagues } from '@/lib/leagues'
import type {
  FootballQueryParams,
  LeagueId,
  LeagueSummary,
  Standing,
  Team,
} from '@/services/types'

const ESPN_STANDINGS_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer'

const ESPN_SLUG_BY_LEAGUE: Record<LeagueId, string> = {
  'premier-league': 'eng.1',
  bundesliga: 'ger.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'ligue-1': 'fra.1',
}

// ---------------------------------------------------------------------------
// ESPN response schema (lenient — unknown fields stripped, known ones optional)
// ---------------------------------------------------------------------------

const espnStatSchema = z.object({
  type: z.string().optional(),
  name: z.string().optional(),
  value: z.number().optional(),
  displayValue: z.string().optional(),
})

const espnTeamSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().optional(),
  shortDisplayName: z.string().optional(),
  abbreviation: z.string().optional(),
  logos: z.array(z.object({ href: z.string().optional() })).optional(),
})

const espnEntrySchema = z.object({
  team: espnTeamSchema.optional(),
  stats: z.array(espnStatSchema).optional(),
})

const espnChildSchema = z.object({
  standings: z
    .object({ entries: z.array(espnEntrySchema).optional() })
    .optional(),
})

const espnSeasonSchema = z.object({
  year: z.number().optional(),
  displayName: z.string().optional(),
})

const espnStandingsSchema = z.object({
  children: z.array(espnChildSchema).optional(),
  season: espnSeasonSchema.optional(),
})

type EspnEntry = z.infer<typeof espnEntrySchema>

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function statValue(entry: EspnEntry, type: string): number {
  const stat = entry.stats?.find((item) => item.type === type)
  if (!stat) return 0
  if (typeof stat.value === 'number' && Number.isFinite(stat.value)) {
    return stat.value
  }
  const parsed = Number(stat.displayValue)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapEntry(entry: EspnEntry, leagueId: LeagueId, index: number): Standing {
  const team = entry.team
  const name = team?.displayName ?? 'Unknown'
  const crest = team?.logos?.find((logo) => logo.href)?.href ?? ''
  const teamId = `espn-${team?.id ?? name}`

  const mappedTeam: Team = {
    id: teamId,
    espnId: team?.id,
    leagueId,
    name,
    shortName: team?.shortDisplayName ?? team?.abbreviation ?? name,
    crest,
    crestSources: crest ? [crest] : undefined,
  }

  const rank = statValue(entry, 'rank')

  return {
    id: teamId,
    leagueId,
    position: rank > 0 ? rank : index + 1,
    team: mappedTeam,
    played: statValue(entry, 'gamesplayed'),
    won: statValue(entry, 'wins'),
    drawn: statValue(entry, 'ties'),
    lost: statValue(entry, 'losses'),
    goalsFor: statValue(entry, 'pointsfor'),
    goalsAgainst: statValue(entry, 'pointsagainst'),
    goalDifference: statValue(entry, 'pointdifferential'),
    points: statValue(entry, 'points'),
    form: [],
    avgPossession: 0,
  }
}

function leagueOrDefault(leagueId?: LeagueId): LeagueId {
  return leagueId ?? 'premier-league'
}

async function fetchStandings(leagueId: LeagueId): Promise<Standing[]> {
  const slug = ESPN_SLUG_BY_LEAGUE[leagueId]
  const raw = await fetchLiveJson<unknown>(`${ESPN_STANDINGS_BASE}/${slug}/standings`)
  const parsed = espnStandingsSchema.parse(raw)
  const entries = parsed.children?.[0]?.standings?.entries ?? []

  if (entries.length === 0) {
    throw new Error(`ESPN returned no standings for ${leagueId}`)
  }

  return entries
    .map((entry, index) => mapEntry(entry, leagueId, index))
    .sort((a, b) => a.position - b.position)
}

export async function getStandings(
  params: FootballQueryParams = {},
): Promise<Standing[]> {
  return fetchStandings(leagueOrDefault(params.leagueId))
}

/**
 * Best-effort league summary from ESPN. Provides the standings table (the hero
 * of the dashboard) and derived team list; scorers/assists/matches are left
 * empty because ESPN's keyless endpoint does not expose them in this shape, so
 * the UI shows honest empty states for those sections while the table renders.
 */
export async function getLeagueSummary(
  params: FootballQueryParams = {},
): Promise<LeagueSummary> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagues.find((item) => item.id === leagueId)
  if (!league) {
    throw new Error(`Unknown leagueId: ${leagueId}`)
  }

  const slug = ESPN_SLUG_BY_LEAGUE[leagueId]
  const raw = await fetchLiveJson<unknown>(`${ESPN_STANDINGS_BASE}/${slug}/standings`)
  const parsed = espnStandingsSchema.parse(raw)
  const entries = parsed.children?.[0]?.standings?.entries ?? []

  if (entries.length === 0) {
    throw new Error(`ESPN returned no standings for ${leagueId}`)
  }

  const standings = entries
    .map((entry, index) => mapEntry(entry, leagueId, index))
    .sort((a, b) => a.position - b.position)

  const year = parsed.season?.year
  const seasonId = year
    ? `${year}-${String(year + 1).slice(-2)}`
    : params.season ?? ''

  return {
    league,
    season: {
      id: seasonId,
      label: parsed.season?.displayName ?? seasonId.replace('-', '/'),
      startDate: year ? `${year}-08-01T00:00:00Z` : '',
      endDate: year ? `${year + 1}-05-31T23:59:59Z` : '',
    },
    standings,
    topScorers: [],
    topAssists: [],
    recentMatches: [],
    teams: standings.map((standing) => standing.team),
    lastUpdated: new Date().toISOString(),
  }
}
