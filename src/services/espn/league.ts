/**
 * Primary league data provider, built on ESPN's keyless soccer API.
 *
 * Request budget per view (all through the shared fetch client + proxy cache):
 * - league dashboard: teams, standings, scoreboard, stat leaders → 4 calls
 *   (previously ~45: every roster plus image lookups);
 * - season results / form: the league scoreboard once per season month (12
 *   calls, previously two schedules for each of the 20 clubs = 40), loaded
 *   as a separate, non-blocking query;
 * - team page: club metadata (cached per league) and one roster; its matches
 *   come from the season query above;
 * - player page: one athlete lookup plus that club's (cached) roster.
 */
import { leagues } from '@/lib/leagues'
import { standingsIssues } from '@/lib/dataInvariants'
import { currentMatchdayFromTable, currentSeasonId, seasonInfo, seasonStartYear } from '@/lib/season'
import { createTeamCrest } from '@/lib/visualAssets'
import { LiveHttpError, fetchLiveJson, wasServedStale } from '@/services/net/liveClient'
import { createPromiseCache } from '@/services/net/promiseCache'
import { emptyTeamMetaIndex, findTeamMeta, getTeamMetaIndex } from '@/services/thesportsdb/teams'
import { withWikidataPortrait } from '@/services/wikidata'

import { NotFoundError } from '../errors'
import type { Assist, FormResult, LeagueId, LeaguePlayer, LeagueSummary, LeagueSummaryPart, Match, Player, Scorer, Squad, Standing, Team } from '../types'

import { espnAthleteId, mapLeader, mapRosterAthlete } from './players'
import {
  athleteResponseSchema,
  eventsResponseSchema,
  rosterResponseSchema,
  standingsResponseSchema,
  statisticsResponseSchema,
  teamsResponseSchema,
  type EspnEvent,
  type EspnStandingEntry,
  type EspnTeam,
} from './schemas'

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
const WEB = 'https://site.web.api.espn.com/apis/v2/sports/soccer'
const COMMON = 'https://site.web.api.espn.com/apis/common/v3/sports/soccer'

export const espnSlugByLeague: Record<LeagueId, string> = {
  'premier-league': 'eng.1',
  bundesliga: 'ger.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'ligue-1': 'fra.1',
}

interface LeagueCore {
  teams: Team[]
  standings: Standing[]
  /** Current scoreboard window (recent results, live and next fixtures). */
  fixtures: Match[]
  topScorers: Scorer[]
  topAssists: Assist[]
  playerPool: LeaguePlayer[]
  unavailable: LeagueSummaryPart[]
  servedStale: boolean
}

/** Marks an optional feed that failed, so the summary can say so instead of showing nothing. */
const FAILED = Symbol('failed')

const coreCache = createPromiseCache<LeagueId, LeagueCore>(2 * 60_000)
const seasonCache = createPromiseCache<LeagueId, Match[]>(10 * 60_000)
const rosterCache = createPromiseCache<string, Squad>(30 * 60_000)

function leagueConfig(leagueId: LeagueId) {
  return leagues.find((league) => league.id === leagueId)!
}

const hexColor = (color: string | undefined, fallback?: string) =>
  color ? (color.startsWith('#') ? color : `#${color}`) : fallback

function mapTeam(raw: EspnTeam, leagueId: LeagueId, index: number): Team | null {
  if (!raw.id) return null
  const name = raw.displayName ?? raw.name ?? raw.shortDisplayName
  if (!name) return null
  const league = leagueConfig(leagueId)
  const shortName = raw.abbreviation ?? raw.shortDisplayName ?? name.slice(0, 3).toUpperCase()
  const logo = raw.logos?.find((item) => item.href && !item.rel?.includes('dark'))?.href ?? raw.logo
  const crestSources = logo ? [logo] : []
  return {
    id: raw.id,
    espnId: raw.id,
    leagueId,
    name,
    shortName,
    crest: crestSources[0] ?? createTeamCrest(shortName, league.color, '#f4f4f5', index),
    crestSources,
    primaryColor: hexColor(raw.color, league.color),
    secondaryColor: hexColor(raw.alternateColor, '#0f172a'),
  }
}

function statOf(entry: EspnStandingEntry, ...names: string[]): number {
  for (const name of names) {
    const stat = entry.stats?.find((item) => item.name === name || item.type === name.toLowerCase())
    if (!stat) continue
    if (typeof stat.value === 'number' && Number.isFinite(stat.value)) return stat.value
    const parsed = Number(stat.displayValue)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

function mapStanding(entry: EspnStandingEntry, team: Team, leagueId: LeagueId, index: number): Standing {
  const rank = statOf(entry, 'rank')
  return {
    id: `${team.id}-standing`,
    leagueId,
    position: rank > 0 ? rank : index + 1,
    team,
    played: statOf(entry, 'gamesPlayed'),
    won: statOf(entry, 'wins'),
    drawn: statOf(entry, 'ties'),
    lost: statOf(entry, 'losses'),
    goalsFor: statOf(entry, 'pointsFor'),
    goalsAgainst: statOf(entry, 'pointsAgainst'),
    goalDifference: statOf(entry, 'pointDifferential'),
    points: statOf(entry, 'points'),
    form: [],
  }
}

function scoreOf(raw: unknown): number | undefined {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.trim() !== '') return Number.isFinite(Number(raw)) ? Number(raw) : undefined
  if (raw && typeof raw === 'object') {
    const { value, displayValue } = raw as { value?: number; displayValue?: string }
    if (typeof value === 'number') return value
    return scoreOf(displayValue)
  }
  return undefined
}

export function mapEvent(event: EspnEvent, leagueId: LeagueId, teamsById: Map<string, Team>): Match | null {
  const competition = event.competitions?.[0]
  const competitors = competition?.competitors ?? []
  const home = competitors.find((item) => item.homeAway === 'home')
  const away = competitors.find((item) => item.homeAway === 'away')
  const homeTeam = teamsById.get(home?.id ?? home?.team?.id ?? '')
  const awayTeam = teamsById.get(away?.id ?? away?.team?.id ?? '')
  if (!event.id || !event.date || !homeTeam || !awayTeam) return null

  const type = (competition?.status ?? event.status)?.type
  const status: Match['status'] =
    type?.state === 'in'
      ? 'LIVE'
      : type?.state === 'post'
        ? type.completed === false
          ? 'POSTPONED'
          : 'FINISHED'
        : 'SCHEDULED'
  const hasScore = status === 'LIVE' || status === 'FINISHED'

  return {
    id: event.id,
    leagueId,
    season: currentSeasonId(),
    // 0 = round unknown; ESPN's soccer feeds rarely carry the matchday.
    matchday: event.week?.number ?? 0,
    utcDate: event.date,
    status,
    homeTeam,
    awayTeam,
    homeScore: hasScore ? scoreOf(home?.score) : undefined,
    awayScore: hasScore ? scoreOf(away?.score) : undefined,
    venue: competition?.venue?.fullName ?? competition?.venue?.displayName ?? homeTeam.stadium,
    events: [],
  }
}

async function loadCore(leagueId: LeagueId): Promise<LeagueCore> {
  return coreCache.get(leagueId, async () => {
    const slug = espnSlugByLeague[leagueId]
    // Stadium and coach (TheSportsDB, football-data.org) are only shown on team
    // pages, so getTeam adds them there; the table never waits for them.
    const standingsUrl = `${WEB}/${slug}/standings`
    const [teamsRaw, standingsRaw, scoreboardRaw, statisticsRaw] = await Promise.all([
      fetchLiveJson<unknown>(`${SITE}/${slug}/teams`),
      fetchLiveJson<unknown>(standingsUrl),
      fetchLiveJson<unknown>(`${SITE}/${slug}/scoreboard`).catch(() => FAILED),
      fetchLiveJson<unknown>(`${SITE}/${slug}/statistics`).catch(() => FAILED),
    ])

    const teamRows = teamsResponseSchema.parse(teamsRaw).sports?.[0]?.leagues?.[0]?.teams ?? []
    const teams = teamRows
      .map((row, index) =>
        row.team ? mapTeam(row.team, leagueId, index) : null,
      )
      .filter((team): team is Team => Boolean(team))
    const teamsById = new Map(teams.map((team) => [team.id, team]))

    const entries = standingsResponseSchema.parse(standingsRaw).children?.[0]?.standings?.entries ?? []
    const standings = entries
      .map((entry, index) => {
        const team =
          teamsById.get(entry.team?.id ?? '') ??
          (entry.team ? mapTeam(entry.team, leagueId, index) : null)
        return team ? mapStanding(entry, team, leagueId, index) : null
      })
      .filter((standing): standing is Standing => Boolean(standing))
      .sort((a, b) => a.position - b.position)
    if (!standings.length) throw new Error(`ESPN returned no standings for ${leagueId}.`)
    for (const standing of standings) {
      if (!teamsById.has(standing.team.id)) teamsById.set(standing.team.id, standing.team)
    }

    const fixtures = (eventsResponseSchema.safeParse(scoreboardRaw).data?.events ?? [])
      .map((event) => mapEvent(event, leagueId, teamsById))
      .filter((match): match is Match => Boolean(match))

    const leaderGroups = statisticsResponseSchema.safeParse(statisticsRaw).data?.stats ?? []
    const leadersOf = (name: string) =>
      (leaderGroups.find((group) => group.name === name)?.leaders ?? [])
        .map((leader) => {
          const team = teamsById.get(leader.athlete?.team?.id ?? '')
          const player = team ? mapLeader(leader, team) : null
          return player && team ? { player, team } : null
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    const goalLeaders = leadersOf('goalsLeaders')
    const assistLeaders = leadersOf('assistsLeaders')
    const playerPool = new Map<string, LeaguePlayer>()
    for (const entry of [...goalLeaders, ...assistLeaders]) {
      if (!playerPool.has(entry.player.id)) playerPool.set(entry.player.id, entry)
    }

    return {
      teams: [...teamsById.values()],
      standings,
      fixtures,
      servedStale: wasServedStale(standingsUrl),
      unavailable: [
        ...(scoreboardRaw === FAILED ? (['fixtures'] as const) : []),
        ...(statisticsRaw === FAILED ? (['leaders'] as const) : []),
      ],
      playerPool: [...playerPool.values()],
      topScorers: goalLeaders.slice(0, 15).map(({ player, team }) => ({
        id: `${player.id}-scorer`,
        player,
        team,
        goals: player.goals,
        assists: player.assists,
      })),
      topAssists: assistLeaders.slice(0, 15).map(({ player, team }) => ({
        id: `${player.id}-assist`,
        player,
        team,
        assists: player.assists,
        goals: player.goals,
      })),
    }
  })
}

/**
 * `YYYYMM` for every month of the season (July–June). ESPN's scoreboard takes a
 * month or a calendar year but no date range, and a calendar year would drag
 * in half of the previous season.
 */
export function seasonMonths(startYear: number): string[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = ((6 + index) % 12) + 1
    const year = month >= 7 ? startYear : startYear + 1
    return `${year}${String(month).padStart(2, '0')}`
  })
}

/**
 * Every league match of the current season, results and fixtures. Any month
 * failing fails the whole load: an incomplete season would silently skew form
 * and rounds.
 */
async function loadSeasonMatches(leagueId: LeagueId, teamsById: Map<string, Team>): Promise<Match[]> {
  return seasonCache.get(leagueId, async () => {
    const slug = espnSlugByLeague[leagueId]
    const startYear = seasonStartYear()
    const months = await Promise.all(
      seasonMonths(startYear).map((month) => fetchLiveJson<unknown>(`${SITE}/${slug}/scoreboard?dates=${month}&limit=500`)),
    )
    const byId = new Map<string, Match>()
    for (const raw of months) {
      for (const event of eventsResponseSchema.safeParse(raw).data?.events ?? []) {
        const match = mapEvent(event, leagueId, teamsById)
        if (match) byId.set(match.id, match)
      }
    }
    return [...byId.values()].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  })
}

function teamsMap(core: LeagueCore) {
  return new Map(core.teams.map((team) => [team.id, team]))
}

function findTeam(core: LeagueCore, leagueId: LeagueId, teamId: string | undefined): Team {
  const team = core.teams.find((item) => item.id === teamId)
  if (!team) throw new NotFoundError(`Team "${teamId ?? ''}" not found in ${leagueId}.`)
  return team
}

/** Last five results of `teamId`, oldest first, from a list of matches. */
export function formFromMatches(matches: Match[], teamId: string): FormResult[] {
  return matches
    .filter(
      (match) =>
        match.status === 'FINISHED' &&
        typeof match.homeScore === 'number' &&
        typeof match.awayScore === 'number' &&
        (match.homeTeam.id === teamId || match.awayTeam.id === teamId),
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(-5)
    .map((match) => {
      const home = match.homeTeam.id === teamId
      const scored = home ? match.homeScore! : match.awayScore!
      const conceded = home ? match.awayScore! : match.homeScore!
      return {
        result: scored > conceded ? 'W' : scored === conceded ? 'D' : 'L',
        opponent: (home ? match.awayTeam : match.homeTeam).shortName,
        score: `${scored}-${conceded}`,
        date: match.utcDate,
      }
    })
}

/** ESPN tables carry no form: fill the last five results in from the season's matches. */
export function withRecentForm(standings: Standing[], matches: Match[] | undefined): Standing[] {
  if (!matches) return standings
  return standings.map((standing) =>
    standing.form.length ? standing : { ...standing, form: formFromMatches(matches, standing.team.id) },
  )
}

// ---------------------------------------------------------------------------
// Public API (consumed by the source cascade in `footballData.ts`)
// ---------------------------------------------------------------------------

export async function getLeagueSummary(leagueId: LeagueId): Promise<LeagueSummary> {
  const core = await loadCore(leagueId)
  if (import.meta.env.DEV) {
    const issues = standingsIssues(leagueId, core.standings)
    if (issues.length) console.warn(`[data] ${leagueId} table looks inconsistent:`, issues)
  }
  return {
    league: leagueConfig(leagueId),
    season: {
      ...seasonInfo(currentSeasonId()),
      currentMatchday: currentMatchdayFromTable(core.standings, core.fixtures),
    },
    standings: core.standings,
    topScorers: core.topScorers,
    topAssists: core.topAssists,
    playerPool: core.playerPool,
    recentMatches: core.fixtures,
    teams: core.teams,
    lastUpdated: new Date().toISOString(),
    unavailable: core.unavailable.length ? core.unavailable : undefined,
    servedStale: core.servedStale || undefined,
  }
}

export async function getStandings(leagueId: LeagueId): Promise<Standing[]> {
  return (await loadCore(leagueId)).standings
}

export async function getTeam(leagueId: LeagueId, teamId: string | undefined): Promise<Team> {
  const team = findTeam(await loadCore(leagueId), leagueId, teamId)
  // Club metadata is loaded for team pages only (one cached index per league).
  const meta = findTeamMeta(await getTeamMetaIndex(leagueConfig(leagueId)).catch(emptyTeamMetaIndex), team.espnId ?? team.id, [team.name, team.shortName])
  if (!meta) return team
  return {
    ...team,
    theSportsDbId: team.theSportsDbId ?? meta.theSportsDbId,
    manager: team.manager ?? meta.manager,
    stadium: team.stadium ?? meta.stadium,
    capacity: team.capacity ?? meta.capacity,
    crestSources: meta.badge && !team.crestSources?.includes(meta.badge) ? [...(team.crestSources ?? []), meta.badge] : team.crestSources,
  }
}

/**
 * Every league match this season (results and fixtures), with the current
 * scoreboard window on top so live scores are as fresh as the dashboard's.
 */
export async function getMatches(leagueId: LeagueId): Promise<Match[]> {
  const core = await loadCore(leagueId)
  const byId = new Map((await loadSeasonMatches(leagueId, teamsMap(core))).map((match) => [match.id, match]))
  for (const match of core.fixtures) byId.set(match.id, match)
  return [...byId.values()].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
}

async function loadRoster(team: Team): Promise<Squad> {
  return rosterCache.get(`${team.leagueId}:${team.id}`, async () => {
    const raw = await fetchLiveJson<unknown>(`${SITE}/${espnSlugByLeague[team.leagueId]}/teams/${team.id}/roster`)
    const athletes = rosterResponseSchema.parse(raw).athletes ?? []
    return {
      teamId: team.id,
      players: athletes.map((athlete) => mapRosterAthlete(athlete, team)).filter((player): player is Player => Boolean(player)),
    }
  })
}

export async function getSquad(leagueId: LeagueId, teamId: string | undefined): Promise<Squad> {
  const team = findTeam(await loadCore(leagueId), leagueId, teamId)
  return loadRoster(team)
}

export async function getPlayer(leagueId: LeagueId, playerId: string | undefined): Promise<Player> {
  if (!playerId?.startsWith('espn-')) throw new NotFoundError(`Unknown player id "${playerId ?? ''}".`)
  const core = await loadCore(leagueId)
  let athlete
  try {
    athlete = athleteResponseSchema.parse(
      await fetchLiveJson<unknown>(`${COMMON}/${espnSlugByLeague[leagueId]}/athletes/${espnAthleteId(playerId)}`),
    ).athlete
  } catch (error) {
    if (error instanceof LiveHttpError && error.status === 404) {
      throw new NotFoundError(`Player "${playerId}" not found.`)
    }
    throw error
  }
  const team = core.teams.find((item) => item.id === athlete?.team?.id)
  if (!team) throw new NotFoundError(`Player "${playerId}" does not play in ${leagueId}.`)
  const player = (await loadRoster(team)).players.find((item) => item.id === playerId)
  if (!player) throw new NotFoundError(`Player "${playerId}" is not in the ${team.name} squad.`)
  return withWikidataPortrait(player)
}
