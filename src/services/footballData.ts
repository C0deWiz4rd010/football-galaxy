/**
 * Football data facade used by the query layer.
 *
 * ESPN (keyless) is the primary source for everything. Where an independent
 * source exists it is tried next, so one broken upstream never blanks a page:
 * football-data.org (key held by the proxy) for tables, scorers and matches,
 * and OpenLigaDB for the Bundesliga table. The app is live-only: when every
 * source fails the promise rejects and the UI shows an honest error state.
 */
import { leagues } from '@/lib/leagues'
import { currentMatchdayFromTable, currentSeasonId, seasonInfo } from '@/lib/season'

import { isNotFoundError } from './errors'
import * as espn from './espn/league'
import * as fdOrg from './footballDataOrg'
import * as openLigaDb from './openLigaDb/openLigaDb'
import type { FootballQueryParams, LeagueId, LeagueSummary, Match, Player, Squad, Standing, Team } from './types'

/**
 * Runs loaders in order and returns the first success. A not-found answer is
 * final: other sources use different ids, so asking them cannot help.
 */
export async function cascade<T>(loaders: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown = new Error('No loaders provided')
  for (const loader of loaders) {
    try {
      return await loader()
    } catch (error) {
      if (isNotFoundError(error)) throw error
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function requireLeague(leagueId: LeagueId | undefined): LeagueId {
  if (!leagueId) throw new Error('A league id is required.')
  return leagueId
}

async function getFootballDataOrgLeagueSummary(params: FootballQueryParams): Promise<LeagueSummary> {
  const leagueId = requireLeague(params.leagueId)
  const [standings, topScorers, topAssists, recentMatches] = await Promise.all([
    fdOrg.getStandings(params),
    fdOrg.getTopScorers(params),
    fdOrg.getTopAssists(params),
    fdOrg.getMatches(params),
  ])
  return {
    league: leagues.find((item) => item.id === leagueId)!,
    season: {
      ...seasonInfo(params.season ?? currentSeasonId()),
      currentMatchday: currentMatchdayFromTable(standings, recentMatches),
    },
    standings,
    topScorers,
    topAssists,
    playerPool: topScorers.map(({ player, team }) => ({ player, team })),
    recentMatches,
    teams: standings.map((standing) => standing.team),
    lastUpdated: new Date().toISOString(),
  }
}

export function getLeagueSummary(params: FootballQueryParams = {}): Promise<LeagueSummary> {
  const leagueId = requireLeague(params.leagueId)
  return cascade([() => espn.getLeagueSummary(leagueId), () => getFootballDataOrgLeagueSummary(params)])
}

export function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  const leagueId = requireLeague(params.leagueId)
  const loaders: Array<() => Promise<Standing[]>> = [() => espn.getStandings(leagueId), () => fdOrg.getStandings(params)]
  if (leagueId === 'bundesliga') loaders.push(() => openLigaDb.getStandings(params))
  return cascade(loaders)
}

/** All league matches this season (results from every club schedule + live window). */
export function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  const leagueId = requireLeague(params.leagueId)
  return cascade([() => espn.getMatches(leagueId), () => fdOrg.getMatches(params)])
}

// Team, squad and player pages are keyed by ESPN ids, so they have no
// alternative source.
export function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  return espn.getTeam(requireLeague(params.leagueId), params.teamId)
}

export function getTeamMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  return espn.getTeamMatches(requireLeague(params.leagueId), params.teamId)
}

export function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  return espn.getSquad(requireLeague(params.leagueId), params.teamId)
}

export function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  return espn.getPlayer(requireLeague(params.leagueId), params.playerId)
}

export { formFromMatches } from './espn/league'
