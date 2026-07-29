/**
 * ESPN live-scores provider.
 *
 * ESPN's public "hidden" site API exposes a soccer scoreboard per competition
 * with live scores, match status (including the minute), and — for in-progress
 * and finished games — scoring/discipline plays. It is free, keyless, and
 * already covers the top-5 European leagues, which makes it the ideal backbone
 * for a live-match ticker without adding a paid tier.
 *
 * The host (`site.api.espn.com`) is already on the proxy allowlist. Responses
 * are Zod-validated leniently (every field optional) so an upstream shape change
 * degrades to an empty ticker instead of a crash.
 */

import { z } from 'zod'

import type { LeagueId } from '@/services/types'
import { fetchLiveJson } from '@/services/net/liveClient'

const ESPN_SCOREBOARD_BASE =
  'https://site.api.espn.com/apis/site/v2/sports/soccer'

const ESPN_SLUG_BY_LEAGUE: Record<LeagueId, string> = {
  'premier-league': 'eng.1',
  bundesliga: 'ger.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'ligue-1': 'fra.1',
}

const LEAGUE_LABEL: Record<LeagueId, string> = {
  'premier-league': 'Premier League',
  bundesliga: 'Bundesliga',
  'la-liga': 'La Liga',
  'serie-a': 'Serie A',
  'ligue-1': 'Ligue 1',
}

export const LIVE_SCORE_LEAGUES: LeagueId[] = [
  'premier-league',
  'la-liga',
  'bundesliga',
  'serie-a',
  'ligue-1',
]

export type LiveMatchState = 'pre' | 'live' | 'ft'
export type LiveEventType = 'goal' | 'yellow' | 'red' | 'substitution' | 'other'

export interface LiveMatchTeam {
  id: string
  name: string
  shortName: string
  abbreviation: string
  crest?: string
  color?: string
  score: number | null
}

export interface LiveMatchEvent {
  id: string
  minute: string
  type: LiveEventType
  side: 'home' | 'away'
  playerName: string
  detail: string
}

export interface LiveMatch {
  id: string
  leagueId: LeagueId
  leagueLabel: string
  state: LiveMatchState
  /** Short human status, e.g. "67'", "HT", "FT", "18:30". */
  statusLabel: string
  kickoff: string | null
  venue?: string
  home: LiveMatchTeam
  away: LiveMatchTeam
  events: LiveMatchEvent[]
}

// ---------------------------------------------------------------------------
// ESPN response schema (lenient — unknown fields are stripped, known ones optional)
// ---------------------------------------------------------------------------

const espnTeamSchema = z.object({
  id: z.string().optional(),
  displayName: z.string().optional(),
  shortDisplayName: z.string().optional(),
  abbreviation: z.string().optional(),
  logo: z.string().optional(),
  color: z.string().optional(),
})

const espnCompetitorSchema = z.object({
  homeAway: z.string().optional(),
  score: z.string().optional(),
  team: espnTeamSchema.optional(),
})

const espnStatusTypeSchema = z.object({
  state: z.string().optional(),
  completed: z.boolean().optional(),
  detail: z.string().optional(),
  shortDetail: z.string().optional(),
  description: z.string().optional(),
})

const espnStatusSchema = z.object({
  displayClock: z.string().optional(),
  period: z.number().optional(),
  type: espnStatusTypeSchema.optional(),
})

const espnDetailSchema = z.object({
  type: z
    .object({ id: z.string().optional(), text: z.string().optional() })
    .optional(),
  clock: z.object({ displayValue: z.string().optional() }).optional(),
  team: z.object({ id: z.string().optional() }).optional(),
  scoringPlay: z.boolean().optional(),
  redCard: z.boolean().optional(),
  yellowCard: z.boolean().optional(),
  athletesInvolved: z
    .array(z.object({ displayName: z.string().optional() }))
    .optional(),
})

const espnCompetitionSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  venue: z.object({ fullName: z.string().optional() }).optional(),
  status: espnStatusSchema.optional(),
  competitors: z.array(espnCompetitorSchema).optional(),
  details: z.array(espnDetailSchema).optional(),
})

const espnEventSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  status: espnStatusSchema.optional(),
  competitions: z.array(espnCompetitionSchema).optional(),
})

const espnScoreboardSchema = z.object({
  events: z
    .array(espnEventSchema)
    .nullish()
    .transform((events) => events ?? []),
})

type EspnCompetitor = z.infer<typeof espnCompetitorSchema>
type EspnStatus = z.infer<typeof espnStatusSchema>
type EspnDetail = z.infer<typeof espnDetailSchema>

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function parseScore(value: string | undefined): number | null {
  if (value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapState(status: EspnStatus | undefined): LiveMatchState {
  const state = status?.type?.state
  if (state === 'in') return 'live'
  if (state === 'post') return 'ft'
  return 'pre'
}

function mapStatusLabel(
  status: EspnStatus | undefined,
  state: LiveMatchState,
  kickoff: string | null,
): string {
  if (state === 'live') {
    const clock = status?.displayClock?.trim()
    if (clock && clock !== '0\'') return clock
    return status?.type?.shortDetail ?? 'Live'
  }
  if (state === 'ft') return 'FT'
  if (kickoff) {
    const date = new Date(kickoff)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }
  return status?.type?.shortDetail ?? 'Scheduled'
}

function mapTeam(competitor: EspnCompetitor | undefined): LiveMatchTeam {
  const team = competitor?.team
  const name = team?.displayName ?? 'TBD'
  return {
    id: team?.id ?? name,
    name,
    shortName: team?.shortDisplayName ?? name,
    abbreviation: team?.abbreviation ?? name.slice(0, 3).toUpperCase(),
    crest: team?.logo,
    color: team?.color ? `#${team.color.replace(/^#/, '')}` : undefined,
    score: parseScore(competitor?.score),
  }
}

function mapEventType(detail: EspnDetail): LiveEventType {
  if (detail.scoringPlay || detail.type?.text?.toLowerCase().includes('goal')) {
    return 'goal'
  }
  if (detail.redCard) return 'red'
  if (detail.yellowCard) return 'yellow'
  const text = detail.type?.text?.toLowerCase() ?? ''
  if (text.includes('substitution')) return 'substitution'
  return 'other'
}

function mapMatch(
  leagueId: LeagueId,
  eventId: string,
  competition: z.infer<typeof espnCompetitionSchema>,
): LiveMatch {
  const competitors = competition.competitors ?? []
  const homeRaw = competitors.find((c) => c.homeAway === 'home') ?? competitors[0]
  const awayRaw = competitors.find((c) => c.homeAway === 'away') ?? competitors[1]
  const home = mapTeam(homeRaw)
  const away = mapTeam(awayRaw)
  const kickoff = competition.date ?? null
  const state = mapState(competition.status)

  const events: LiveMatchEvent[] = (competition.details ?? []).map(
    (detail, index) => {
      const teamId = detail.team?.id
      const side: 'home' | 'away' = teamId && teamId === away.id ? 'away' : 'home'
      return {
        id: `${eventId}-${index}`,
        minute: detail.clock?.displayValue ?? '',
        type: mapEventType(detail),
        side,
        playerName: detail.athletesInvolved?.[0]?.displayName ?? '',
        detail: detail.type?.text ?? '',
      }
    },
  )

  return {
    id: competition.id ?? eventId,
    leagueId,
    leagueLabel: LEAGUE_LABEL[leagueId],
    state,
    statusLabel: mapStatusLabel(competition.status, state, kickoff),
    kickoff,
    venue: competition.venue?.fullName,
    home,
    away,
    events,
  }
}

const STATE_ORDER: Record<LiveMatchState, number> = { live: 0, pre: 1, ft: 2 }

function sortMatches(matches: LiveMatch[]): LiveMatch[] {
  return [...matches].sort((a, b) => {
    if (STATE_ORDER[a.state] !== STATE_ORDER[b.state]) {
      return STATE_ORDER[a.state] - STATE_ORDER[b.state]
    }
    const aTime = a.kickoff ? Date.parse(a.kickoff) : 0
    const bTime = b.kickoff ? Date.parse(b.kickoff) : 0
    return aTime - bTime
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch and normalise the current scoreboard for a single league. */
export async function fetchLeagueLiveScores(
  leagueId: LeagueId,
): Promise<LiveMatch[]> {
  const slug = ESPN_SLUG_BY_LEAGUE[leagueId]
  const url = `${ESPN_SCOREBOARD_BASE}/${slug}/scoreboard`
  const raw = await fetchLiveJson<unknown>(url)
  const parsed = espnScoreboardSchema.parse(raw)

  const matches: LiveMatch[] = []
  for (const event of parsed.events) {
    const competition = event.competitions?.[0]
    if (!competition) continue
    matches.push(mapMatch(leagueId, event.id ?? competition.id ?? '', competition))
  }
  return sortMatches(matches)
}

/**
 * Fetch scoreboards for every supported league in parallel and merge them.
 * A single failing league never blocks the rest.
 */
export async function fetchAllLiveScores(): Promise<LiveMatch[]> {
  const results = await Promise.allSettled(
    LIVE_SCORE_LEAGUES.map((leagueId) => fetchLeagueLiveScores(leagueId)),
  )
  const matches = results.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  )
  return sortMatches(matches)
}

/** True when any match in the list is currently in progress. */
export function hasLiveMatch(matches: LiveMatch[] | undefined): boolean {
  return Boolean(matches?.some((match) => match.state === 'live'))
}
