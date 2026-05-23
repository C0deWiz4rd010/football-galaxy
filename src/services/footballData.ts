import {
  getLeagueCatalog,
  getPlayerExplorerEntries,
  getTeamExplorerEntries,
  searchEntities,
} from '@/lib/explorer-data'
import { leagues } from '@/lib/leagues'

import * as fdOrgService from './footballDataOrg'
import * as fallbackService from './openFootball'
import * as liveService from './theSportsDb'

/**
 * Runtime preference for the data cascade. The DataSourceProvider sets this
 * from the user's toggle (Live Proxy / Local Fallback). When set to
 * `'fallback'`, the cascade skips all network-bound loaders so the UI never
 * waits on a missing proxy or a flaky upstream.
 */
type SourcePreference = 'live' | 'fallback'
let sourcePreference: SourcePreference = 'live'

export function setSourcePreference(next: SourcePreference) {
  sourcePreference = next
}

function networkLoaders<T>(live: Array<() => Promise<T>>): Array<() => Promise<T>> {
  return sourcePreference === 'fallback' ? [] : live
}
import type {
  Assist,
  FootballQueryParams,
  LeagueId,
  LeagueSummary,
  Match,
  Player,
  Scorer,
  Squad,
  Standing,
  Team,
} from './types'

/**
 * Run loaders in order, returning the first successful result. Each loader is
 * given a chance even if the previous one threw, so a broken upstream never
 * blocks the page — the cascade ends at the local mock data which always
 * resolves.
 */
async function cascade<T>(loaders: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown = new Error('No loaders provided')
  for (const loader of loaders) {
    try {
      return await loader()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function leagueOrDefault(leagueId?: LeagueId): LeagueId {
  return leagueId ?? 'premier-league'
}

function estimateCurrentSeasonLabel() {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const startYear = month >= 7 ? year : year - 1
  return `${startYear}-${String(startYear + 1).slice(-2)}`
}

function currentMatchdayFrom(matches: Match[]) {
  const scheduled = matches
    .filter((match) => match.status === 'SCHEDULED' && match.matchday > 0)
    .map((match) => match.matchday)
    .sort((a, b) => a - b)

  if (scheduled[0]) {
    return scheduled[0]
  }

  const known = matches
    .map((match) => match.matchday)
    .filter((matchday) => matchday > 0)

  return known.length ? Math.max(...known) : 38
}

async function getFootballDataOrgLeagueSummary(
  params: FootballQueryParams = {},
): Promise<LeagueSummary> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagues.find((item) => item.id === leagueId)
  if (!league) {
    throw new Error(`Unknown leagueId: ${leagueId}`)
  }

  const [standings, topScorers, topAssists, recentMatches] = await Promise.all([
    fdOrgService.getStandings(params),
    fdOrgService.getTopScorers(params),
    fdOrgService.getTopAssists(params),
    fdOrgService.getMatches(params),
  ])
  const seasonId = params.season ?? estimateCurrentSeasonLabel()

  return {
    league,
    season: {
      id: seasonId,
      label: seasonId.replace('-', '/'),
      startDate: `${seasonId.slice(0, 4)}-08-01T00:00:00Z`,
      endDate: `${Number(seasonId.slice(0, 4)) + 1}-05-31T23:59:59Z`,
      currentMatchday: currentMatchdayFrom(recentMatches),
    },
    standings,
    topScorers,
    topAssists,
    recentMatches,
    teams: standings.map((standing) => standing.team),
    lastUpdated: new Date().toISOString(),
  }
}

export function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  return cascade<Standing[]>([
    ...networkLoaders<Standing[]>([
      () => liveService.getStandings(params),
      () => fdOrgService.getStandings(params),
    ]),
    () => fallbackService.getStandings(params),
  ])
}

export function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  return cascade<Scorer[]>([
    ...networkLoaders<Scorer[]>([
      () => liveService.getTopScorers(params),
      () => fdOrgService.getTopScorers(params),
    ]),
    () => fallbackService.getTopScorers(params),
  ])
}

export function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  return cascade<Assist[]>([
    ...networkLoaders<Assist[]>([
      () => liveService.getTopAssists(params),
      () => fdOrgService.getTopAssists(params),
    ]),
    () => fallbackService.getTopAssists(params),
  ])
}

export function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  return cascade<Match[]>([
    ...networkLoaders<Match[]>([
      () => liveService.getMatches(params),
      () => fdOrgService.getMatches(params),
    ]),
    () => fallbackService.getMatches(params),
  ])
}

// Team/Squad/Player details still go through TheSportsDB first because
// football-data.org's free tier does not include squad rosters or player
// profile pages.
export function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  return cascade<Team>([
    ...networkLoaders<Team>([() => liveService.getTeam(params)]),
    () => fallbackService.getTeam(params),
  ])
}

export function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  return cascade<Squad>([
    ...networkLoaders<Squad>([() => liveService.getSquad(params)]),
    () => fallbackService.getSquad(params),
  ])
}

export function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  return cascade<Player>([
    ...networkLoaders<Player>([() => liveService.getPlayer(params)]),
    () => fallbackService.getPlayer(params),
  ])
}

export function getLeagueSummary(
  params: FootballQueryParams = {},
): Promise<LeagueSummary> {
  return cascade<LeagueSummary>([
    ...networkLoaders<LeagueSummary>([
      () => liveService.getLeagueSummary(params),
      () => getFootballDataOrgLeagueSummary(params),
    ]),
    () => fallbackService.getLeagueSummary(params),
  ])
}

export const searchIndex = {
  leagues: () => getLeagueCatalog().map(({ league }) => league),
  teams: (leagueId?: LeagueId) => getTeamExplorerEntries(leagueId),
  players: (leagueId?: LeagueId) => getPlayerExplorerEntries(leagueId),
  search: (query: string) => searchEntities(query),
}
