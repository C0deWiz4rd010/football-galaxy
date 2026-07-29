import { useCallback, useEffect, useState } from 'react'

import { readCache, writeCache } from '@/services/cache/persistentCache'
import {
  fetchAllLiveScores,
  fetchLeagueLiveScores,
  hasLiveMatch,
  type LiveMatch,
} from '@/services/espn/liveScores'
import type { LeagueId } from '@/services/types'

/** Poll cadence (ms) while at least one match is in progress. */
const LIVE_INTERVAL_MS = 30_000
/** Poll cadence (ms) when nothing is live (upcoming/finished only). */
const IDLE_INTERVAL_MS = 90_000
/** Re-check cadence (ms) while the tab is hidden — cheap, no upstream call. */
const HIDDEN_RECHECK_MS = 15_000
/** How long a cached scoreboard seeds the UI on cold start. */
const SEED_TTL_MS = 60_000

/**
 * Adaptive live-scores hook backed by the ESPN scoreboard provider.
 *
 * - Polls faster while a match is live and backs off when idle.
 * - Pauses network work while the tab is hidden to protect the free quota.
 * - Seeds instantly from the persistent cache so a reload never flashes empty.
 */
export function useLiveScores(leagueId?: LeagueId) {
  const [data, setData] = useState<LiveMatch[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const cacheKey = `live-scores:${leagueId ?? 'all'}`

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let seeded = false
    let everLoaded = false

    const load = async (): Promise<LiveMatch[] | null> => {
      // Seed from the persistent cache on the first pass for an instant paint.
      if (!seeded) {
        seeded = true
        const seed = readCache<LiveMatch[]>(cacheKey, SEED_TTL_MS)
        if (seed && !cancelled) {
          everLoaded = true
          setData(seed.value)
          setFetchedAt(seed.fetchedAt)
          setIsLoading(false)
        }
      }

      try {
        const result = leagueId
          ? await fetchLeagueLiveScores(leagueId)
          : await fetchAllLiveScores()
        if (!cancelled) {
          everLoaded = true
          setData(result)
          setFetchedAt(Date.now())
          setError(null)
          writeCache(cacheKey, result)
        }
        return result
      } catch (caught) {
        if (!cancelled && !everLoaded) {
          setError(
            caught instanceof Error ? caught.message : 'Could not load live scores.',
          )
        }
        return null
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    const tick = async () => {
      if (cancelled) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        timer = setTimeout(tick, HIDDEN_RECHECK_MS)
        return
      }
      const result = await load()
      if (cancelled) return
      const interval = hasLiveMatch(result ?? undefined)
        ? LIVE_INTERVAL_MS
        : IDLE_INTERVAL_MS
      timer = setTimeout(tick, interval)
    }

    void tick()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [cacheKey, leagueId, reloadKey])

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, isLoading, error, fetchedAt, refetch }
}
