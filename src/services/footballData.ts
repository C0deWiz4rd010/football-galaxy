import {
  getLeagueCatalog,
  getPlayerExplorerEntries,
  getTeamExplorerEntries,
  searchEntities,
} from '@/lib/explorer-data'

import * as fallbackService from './openFootball'
import * as liveService from './theSportsDb'
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

async function withFallback<T>(
  loadLive: () => Promise<T>,
  loadFallback: () => Promise<T>,
): Promise<T> {
  try {
    return await loadLive()
  } catch {
    return loadFallback()
  }
}

export function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  return withFallback(
    () => liveService.getStandings(params),
    () => fallbackService.getStandings(params),
  )
}

export function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  return withFallback(
    () => liveService.getTopScorers(params),
    () => fallbackService.getTopScorers(params),
  )
}

export function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  return withFallback(
    () => liveService.getTopAssists(params),
    () => fallbackService.getTopAssists(params),
  )
}

export function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  return withFallback(
    () => liveService.getMatches(params),
    () => fallbackService.getMatches(params),
  )
}

export function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  return withFallback(
    () => liveService.getTeam(params),
    () => fallbackService.getTeam(params),
  )
}

export function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  return withFallback(
    () => liveService.getSquad(params),
    () => fallbackService.getSquad(params),
  )
}

export function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  return withFallback(
    () => liveService.getPlayer(params),
    () => fallbackService.getPlayer(params),
  )
}

export function getLeagueSummary(
  params: FootballQueryParams = {},
): Promise<LeagueSummary> {
  return withFallback(
    () => liveService.getLeagueSummary(params),
    () => fallbackService.getLeagueSummary(params),
  )
}

export const searchIndex = {
  leagues: () => getLeagueCatalog().map(({ league }) => league),
  teams: (leagueId?: LeagueId) => getTeamExplorerEntries(leagueId),
  players: (leagueId?: LeagueId) => getPlayerExplorerEntries(leagueId),
  search: (query: string) => searchEntities(query),
}
