import { queryOptions, useQueries, useQuery } from '@tanstack/react-query'

import { useDataSource } from '@/contexts/DataSourceContext'
import * as football from '@/services/footballData'
import { queryKeys } from '@/services/queryKeys'
import type { LeagueId, LeagueSummary, Match, Player, Squad, Standing, Team } from '@/services/types'

/** Query option builders: shared by hooks and route prefetching. */
export const footballQueries = {
  summary: (leagueId: LeagueId | undefined, season: string) =>
    queryOptions<LeagueSummary>({
      queryKey: queryKeys.football.summary(leagueId, season),
      queryFn: () => football.getLeagueSummary({ leagueId, season }),
      enabled: Boolean(leagueId),
    }),
  standings: (leagueId: LeagueId | undefined, season: string) =>
    queryOptions<Standing[]>({
      queryKey: queryKeys.football.standings(leagueId, season),
      queryFn: () => football.getStandings({ leagueId, season }),
      enabled: Boolean(leagueId),
    }),
  matches: (leagueId: LeagueId | undefined, season: string) =>
    queryOptions<Match[]>({
      queryKey: queryKeys.football.matches(leagueId, season),
      queryFn: () => football.getMatches({ leagueId, season }),
      enabled: Boolean(leagueId),
    }),
  team: (leagueId: LeagueId | undefined, season: string, teamId: string | undefined) =>
    queryOptions<Team>({
      queryKey: queryKeys.football.team(leagueId, season, teamId),
      queryFn: () => football.getTeam({ leagueId, season, teamId }),
      enabled: Boolean(leagueId && teamId),
    }),
  squad: (leagueId: LeagueId | undefined, season: string, teamId: string | undefined) =>
    queryOptions<Squad>({
      queryKey: queryKeys.football.squad(leagueId, season, teamId),
      queryFn: () => football.getSquad({ leagueId, season, teamId }),
      enabled: Boolean(leagueId && teamId),
      // Rosters change rarely.
      staleTime: 30 * 60_000,
    }),
  player: (leagueId: LeagueId | undefined, season: string, playerId: string | undefined) =>
    queryOptions<Player>({
      queryKey: queryKeys.football.player(leagueId, season, playerId),
      queryFn: () => football.getPlayer({ leagueId, season, playerId }),
      enabled: Boolean(leagueId && playerId),
    }),
}


export function useLeagueSummary(leagueId: LeagueId | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.summary(leagueId, season))
}

export function useStandings(leagueId: LeagueId | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.standings(leagueId, season))
}

export function useMatches(leagueId: LeagueId | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.matches(leagueId, season))
}

export function useTeam(leagueId: LeagueId | undefined, teamId: string | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.team(leagueId, season, teamId))
}

export function useSquad(leagueId: LeagueId | undefined, teamId: string | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.squad(leagueId, season, teamId))
}

export function usePlayer(leagueId: LeagueId | undefined, playerId: string | undefined) {
  const { season } = useDataSource()
  return useQuery(footballQueries.player(leagueId, season, playerId))
}

/** Club fixtures and results for one team (its own ESPN schedule). */
export function useTeamMatches(leagueId: LeagueId | undefined, teamId: string | undefined) {
  const { season } = useDataSource()
  return useQuery({
    queryKey: [...queryKeys.football.team(leagueId, season, teamId), 'matches'],
    queryFn: () => football.getTeamMatches({ leagueId, season, teamId }),
    enabled: Boolean(leagueId && teamId),
    staleTime: 10 * 60_000,
  })
}

/**
 * Summaries for several leagues at once (explorers, compare). Each league is
 * its own cached query, so switching filters never refetches loaded leagues.
 */
export function useLeagueSummaries(leagueIds: LeagueId[]) {
  const { season } = useDataSource()
  return useQueries({
    queries: leagueIds.map((leagueId) => footballQueries.summary(leagueId, season)),
    combine: (results) => ({
      summaries: results.flatMap((result) => (result.data ? [result.data] : [])),
      isPending: results.some((result) => result.isPending),
      isError: results.length > 0 && results.every((result) => result.isError),
      failedCount: results.filter((result) => result.isError).length,
      refetch: () => results.forEach((result) => void result.refetch()),
    }),
  })
}
