import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from '@/components/ui/toast'
import { useDataSource } from '@/contexts/DataSourceContext'
import { readCache, writeCache } from '@/services/cache/persistentCache'
import { isNotFoundError } from '@/services/errors'
import * as liveService from '@/services/footballData'
import type { FootballQueryName, FootballQueryParams } from '@/services/types'

/**
 * How long a cached response is considered fresh. Older values are still shown
 * instantly (stale-while-revalidate) but trigger a silent background refresh.
 */
const TTL_MS = 1000 * 60 * 15

interface CacheEntry<T> {
  value: T
  fetchedAt: number
}

// Module-level cache: keyed by `queryFn:source:paramsJSON`. Fastest tier; the
// persistent cache below survives reloads and seeds this map on cold start.
const dataCache = new Map<string, CacheEntry<unknown>>()

export function useFootballData<T>(
  queryFn: FootballQueryName,
  params: FootballQueryParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) {
  const { source, season } = useDataSource()
  const [data, setData] = useState<T | null>(null)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [tick, setTick] = useState(0)
  const mounted = useRef(true)
  const requestId = useRef(0)

  const paramsKey = useMemo(
    () => JSON.stringify({ ...params, season }),
    [params, season],
  )

  const stableParams = useMemo(
    () => JSON.parse(paramsKey) as FootballQueryParams,
    [paramsKey],
  )

  const cacheKey = `${queryFn}:${source}:${paramsKey}`

  const refetch = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    const service = liveService
    const currentRequestId = ++requestId.current

    // Disabled queries stay in their initial loading state until enabled.
    if (!enabled) return

    const isCurrent = () => mounted.current && requestId.current === currentRequestId

    const load = async () => {
      // Seed from the fastest available cache tier so navigation and reloads
      // paint instantly. Module cache first, then the persistent (localStorage)
      // mirror which survives a page refresh.
      const memHit = dataCache.get(cacheKey) as CacheEntry<T> | undefined
      const persistedHit = memHit ? null : readCache<T>(cacheKey, TTL_MS)
      const seed: CacheEntry<T> | null =
        memHit ??
        (persistedHit
          ? { value: persistedHit.value, fetchedAt: persistedHit.fetchedAt }
          : null)

      if (seed) {
        if (!memHit) dataCache.set(cacheKey, seed)
        if (isCurrent()) {
          setData(seed.value)
          setFetchedAt(seed.fetchedAt)
          setIsLoading(false)
          setError(null)
          setNotFound(false)
        }
        // Fresh enough — no upstream call needed.
        if (Date.now() - seed.fetchedAt < TTL_MS) return
        // Otherwise fall through and revalidate in the background without
        // clearing the visible (stale) data or flashing a skeleton.
      } else if (mounted.current) {
        setData(null) // clear stale data from previous params so UI never shows old league
        setFetchedAt(null)
        setIsLoading(true)
        setError(null)
        setNotFound(false)
      }

      try {
        const result = await service[queryFn](stableParams)

        if (isCurrent()) {
          const entry: CacheEntry<T> = { value: result as T, fetchedAt: Date.now() }
          dataCache.set(cacheKey, entry)
          writeCache(cacheKey, result)
          setData(result as T)
          setFetchedAt(entry.fetchedAt)
          setError(null)
        }
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Could not load football data.'

        // A missing entity is a terminal, expected outcome: no toast.
        if (isCurrent() && !seed && isNotFoundError(caught)) {
          setNotFound(true)
          setError(message)
          return
        }

        // A failed *revalidation* keeps the stale data on screen; only surface a
        // hard error (and toast) when we have nothing to show.
        if (isCurrent() && !seed) {
          setError(message)
          toast({ titleKey: 'loadFailedTitle', description: message })
        }
      } finally {
        if (isCurrent()) {
          setIsLoading(false)
        }
      }
    }

    void load()
  }, [cacheKey, enabled, paramsKey, queryFn, source, stableParams, tick])

  return { data, isLoading, error, notFound, refetch, fetchedAt }
}
