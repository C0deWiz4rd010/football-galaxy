import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useDataSource } from '@/contexts/DataSourceContext'
import * as liveService from '@/services/footballData'
import * as historicalService from '@/services/openFootball'
import type { FootballQueryName, FootballQueryParams } from '@/services/types'

type ServiceMap = typeof liveService

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

  const refetch = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const service = (source === 'live' ? liveService : historicalService) as ServiceMap
    const currentRequestId = ++requestId.current

    const load = async () => {
      if (mounted.current) {
        setIsLoading(true)
        setError(null)
      }

      try {
        const result = await service[queryFn](stableParams)

        if (mounted.current && requestId.current === currentRequestId) {
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
  }, [paramsKey, queryFn, source, stableParams, tick])

  return { data, isLoading, error, refetch }
}
