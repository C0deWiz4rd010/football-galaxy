import { useQuery } from '@tanstack/react-query'

import type { StandingsProvider } from '../api/provider'
import { theSportsDbStandingsProvider } from '../api/the-sports-db-provider'
import type { LeagueId } from '../config/leagues'
import { standingsQueryKeys } from './query-keys'

type UseLeagueStandingsOptions = {
  provider?: StandingsProvider
  enabled?: boolean
  matchday?: number | null
}

export function useLeagueStandings(
  leagueId: LeagueId,
  options: UseLeagueStandingsOptions = {},
) {
  const provider = options.provider ?? theSportsDbStandingsProvider

  return useQuery({
    queryKey: standingsQueryKeys.byLeague(leagueId, options.matchday ?? null),
    queryFn: () =>
      provider.getStandings(leagueId, {
        matchday: options.matchday ?? null,
      }),
    enabled: options.enabled ?? true,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  })
}
