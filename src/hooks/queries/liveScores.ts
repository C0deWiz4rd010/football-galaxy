import { useQuery } from '@tanstack/react-query'

import { fetchAllLiveScores, fetchLeagueLiveScores, hasLiveMatch, type LiveMatch } from '@/services/espn/liveScores'
import { queryKeys } from '@/services/queryKeys'
import type { LeagueId } from '@/services/types'

/** Poll cadence while at least one match is in progress. */
const LIVE_INTERVAL_MS = 30_000
/** Poll cadence when nothing is live (upcoming/finished only). */
const IDLE_INTERVAL_MS = 90_000

/**
 * Adaptive ESPN scoreboard: polls faster while a match is live, backs off when
 * idle, and pauses while the tab is hidden (TanStack Query's default for
 * `refetchInterval`) to protect the free quota.
 */
export function useLiveScores(leagueId?: LeagueId) {
  return useQuery<LiveMatch[]>({
    queryKey: queryKeys.liveScores(leagueId ?? 'all'),
    queryFn: () => (leagueId ? fetchLeagueLiveScores(leagueId) : fetchAllLiveScores()),
    staleTime: 20_000,
    refetchInterval: (query) => (hasLiveMatch(query.state.data) ? LIVE_INTERVAL_MS : IDLE_INTERVAL_MS),
  })
}
