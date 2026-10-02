import { queryOptions, useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/services/queryKeys'
import * as worldCup from '@/services/worldCup/worldCup'
import type {
  WorldCupBracketRound,
  WorldCupDashboard,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupLineup,
  WorldCupMatchStatistic,
  WorldCupSquad,
  WorldCupTeam,
} from '@/services/worldCup/types'

/**
 * The tournament ended on 2026-07-19: results no longer change, so every
 * World Cup query is loaded once, persisted, and never polled.
 */
const ARCHIVE = {
  staleTime: 24 * 60 * 60_000,
} as const

export const worldCupQueries = {
  dashboard: () =>
    queryOptions<WorldCupDashboard>({
      queryKey: queryKeys.worldCup('getDashboard'),
      queryFn: worldCup.getWorldCupDashboard,
      ...ARCHIVE,
    }),
  fixtures: () =>
    queryOptions<WorldCupFixture[]>({
      queryKey: queryKeys.worldCup('getFixtures'),
      queryFn: worldCup.getWorldCupFixtures,
      ...ARCHIVE,
    }),
  groups: () =>
    queryOptions<WorldCupGroupStanding[]>({
      queryKey: queryKeys.worldCup('getGroups'),
      queryFn: worldCup.getWorldCupGroups,
      ...ARCHIVE,
    }),
  bracket: () =>
    queryOptions<WorldCupBracketRound[]>({
      queryKey: queryKeys.worldCup('getBracket'),
      queryFn: worldCup.getWorldCupBracket,
      ...ARCHIVE,
    }),
  teams: () =>
    queryOptions<WorldCupTeam[]>({
      queryKey: queryKeys.worldCup('getTeams'),
      queryFn: worldCup.getWorldCupTeams,
      ...ARCHIVE,
    }),
  team: (teamId: string | undefined) =>
    queryOptions<{ team: WorldCupTeam; squad: WorldCupSquad; fixtures: WorldCupFixture[] }>({
      queryKey: queryKeys.worldCup('getTeam', { teamId }),
      queryFn: () => worldCup.getWorldCupTeam({ teamId }),
      enabled: Boolean(teamId),
      ...ARCHIVE,
    }),
  fixture: (matchId: string | undefined) =>
    queryOptions<WorldCupFixture>({
      queryKey: queryKeys.worldCup('getFixture', { matchId }),
      queryFn: () => worldCup.getWorldCupFixture({ matchId }),
      enabled: Boolean(matchId),
      ...ARCHIVE,
    }),
  lineups: (matchId: string | undefined) =>
    queryOptions<WorldCupLineup[]>({
      queryKey: queryKeys.worldCup('getFixtureLineups', { matchId }),
      queryFn: () => worldCup.getWorldCupFixtureLineups({ matchId }),
      enabled: Boolean(matchId),
      ...ARCHIVE,
    }),
  statistics: (matchId: string | undefined) =>
    queryOptions<WorldCupMatchStatistic[]>({
      queryKey: queryKeys.worldCup('getFixtureStatistics', { matchId }),
      queryFn: () => worldCup.getWorldCupFixtureStatistics({ matchId }),
      enabled: Boolean(matchId),
      ...ARCHIVE,
    }),
}


export const useWorldCupDashboard = () => useQuery(worldCupQueries.dashboard())
export const useWorldCupFixtures = () => useQuery(worldCupQueries.fixtures())
export const useWorldCupGroups = () => useQuery(worldCupQueries.groups())
export const useWorldCupBracket = () => useQuery(worldCupQueries.bracket())
export const useWorldCupTeams = () => useQuery(worldCupQueries.teams())
export const useWorldCupTeam = (teamId: string | undefined) => useQuery(worldCupQueries.team(teamId))
export const useWorldCupFixture = (matchId: string | undefined) => useQuery(worldCupQueries.fixture(matchId))
export const useWorldCupLineups = (matchId: string | undefined) => useQuery(worldCupQueries.lineups(matchId))
export const useWorldCupStatistics = (matchId: string | undefined) =>
  useQuery(worldCupQueries.statistics(matchId))
