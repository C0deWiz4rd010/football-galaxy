import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { searchFootball } from '@/services/espn/search'

export const MIN_SEARCH_LENGTH = 2

/** Live team/player search; previous results stay visible while typing. */
export function useFootballSearch(query: string) {
  const normalized = query.trim().toLowerCase()
  return useQuery({
    queryKey: ['search', normalized],
    queryFn: ({ signal }) => searchFootball(normalized, signal),
    enabled: normalized.length >= MIN_SEARCH_LENGTH,
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    // Search results are throwaway: never persist them, and the palette shows
    // its own inline error instead of a toast.
    meta: { persist: false, silent: true },
    retry: false,
  })
}
