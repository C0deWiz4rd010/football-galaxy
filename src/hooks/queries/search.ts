import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'

import { searchFootball, type SearchHit } from '@/services/espn/search'
import { queryKeys, staleTimes } from '@/services/queryKeys'
import type { LeagueSummary } from '@/services/types'

export const MIN_SEARCH_LENGTH = 2

const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Teams and players from league data already in the cache. ESPN's search
 * files players under their latest competition, which is often a national
 * team (e.g. Haaland → Nations League); the league leader pools fill that gap.
 */
export function cachedSearchHits(summaries: LeagueSummary[], query: string): { teams: SearchHit[]; players: SearchHit[] } {
  const needle = fold(query.trim())
  const teams = new Map<string, SearchHit>()
  const players = new Map<string, SearchHit>()
  for (const summary of summaries) {
    for (const team of summary.teams) {
      if (fold(`${team.name} ${team.shortName}`).includes(needle)) {
        teams.set(team.id, { kind: 'team', id: team.id, name: team.name, leagueId: team.leagueId, image: team.crest })
      }
    }
    for (const { player, team } of summary.playerPool) {
      if (fold(player.name).includes(needle)) {
        players.set(player.id, { kind: 'player', id: player.id, name: player.name, leagueId: player.leagueId, subtitle: team.name, image: player.photo })
      }
    }
  }
  return { teams: [...teams.values()], players: [...players.values()] }
}

function merge(primary: SearchHit[], extra: SearchHit[]) {
  const seen = new Set(primary.map((hit) => hit.id))
  return [...primary, ...extra.filter((hit) => !seen.has(hit.id))]
}

/** Live team/player search plus cached league data; previous results stay visible while typing. */
export function useFootballSearch(query: string) {
  const queryClient = useQueryClient()
  const normalized = query.trim().toLowerCase()
  return useQuery({
    queryKey: queryKeys.search(normalized),
    queryFn: async ({ signal }) => {
      const summaries = queryClient
        .getQueriesData<LeagueSummary>({ queryKey: ['football'] })
        .map(([, data]) => data)
        .filter((data): data is LeagueSummary => Boolean(data && 'playerPool' in data))
      const cached = cachedSearchHits(summaries, normalized)
      try {
        const live = await searchFootball(normalized, signal)
        return { teams: merge(live.teams, cached.teams), players: merge(live.players, cached.players) }
      } catch (error) {
        // Offline or ESPN down: cached hits still answer the search.
        if (cached.teams.length || cached.players.length) return cached
        throw error
      }
    },
    enabled: normalized.length >= MIN_SEARCH_LENGTH,
    staleTime: staleTimes.search,
    placeholderData: keepPreviousData,
    // Search results are throwaway: never persist them, and the palette shows
    // its own inline error instead of a toast.
    meta: { persist: false, silent: true },
    retry: false,
  })
}
