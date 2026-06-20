import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useDataSource } from '@/contexts/DataSourceContext'
import * as liveService from '@/services/footballData'
import type { FootballQueryName, FootballQueryParams } from '@/services/types'

// Module-level cache: keyed by `queryFn:source:paramsJSON`.
// Hit → return immediately, no loading state, no skeleton flash on back navigation.
const dataCache = new Map<string, unknown>()

export function useFootballData<T>(
  queryFn: FootballQueryName,
  params: FootballQueryParams = {},
) {
  const { source, season } = useDataSource()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

    const load = async () => {
      // Serve from cache instantly — no skeleton flash on back navigation.
      const cached = dataCache.get(cacheKey) as T | undefined
      if (cached !== undefined) {
        if (mounted.current && requestId.current === currentRequestId) {
          setData(cached)
          setIsLoading(false)
          setError(null)
        }
        return
      }

      if (mounted.current) {
        setData(null)        // clear stale data from previous params so UI never shows old league
        setIsLoading(true)
        setError(null)
      }

      try {
        const result = await service[queryFn](stableParams)

        if (mounted.current && requestId.current === currentRequestId) {
          dataCache.set(cacheKey, result)
          setData(result as T)
        }
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Could not load football data.'

        if (mounted.current && requestId.current === currentRequestId) {
          setError(message)
          window.dispatchEvent(
            new CustomEvent('football-toast', {
              detail: { title: 'Fetch failed', description: message },
            }),
          )
        }
      } finally {
        if (mounted.current && requestId.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }

    void load()
  }, [cacheKey, paramsKey, queryFn, source, stableParams, tick])

  return { data, isLoading, error, refetch }
}
