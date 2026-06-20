import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  getWorldCupBracket,
  getWorldCupDashboard,
  getWorldCupFixture,
  getWorldCupFixtureLineups,
  getWorldCupFixtureStatistics,
  getWorldCupFixtures,
  getWorldCupGroups,
  getWorldCupLiveFixtures,
  getWorldCupTeam,
  getWorldCupTeams,
} from '@/services/worldCup/worldCup'
import type { WorldCupQueryName, WorldCupQueryParams } from '@/services/worldCup/types'

const worldCupCache = new Map<string, unknown>()

// World Cup data is live-only: every query resolves against API-Football.
// There is no fallback service and the hook deliberately ignores the global
// live/local data-source toggle so the tournament area always shows real data.
const service = {
  getDashboard: getWorldCupDashboard,
  getFixtures: getWorldCupFixtures,
  getLiveFixtures: getWorldCupLiveFixtures,
  getGroups: getWorldCupGroups,
  getTeams: getWorldCupTeams,
  getTeam: getWorldCupTeam,
  getFixture: getWorldCupFixture,
  getFixtureLineups: getWorldCupFixtureLineups,
  getFixtureStatistics: getWorldCupFixtureStatistics,
  getBracket: getWorldCupBracket,
}

export function useWorldCupData<T>(
  queryFn: WorldCupQueryName,
  params: WorldCupQueryParams = {},
  options: { refetchIntervalMs?: number } = {},
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const mounted = useRef(true)
  const requestId = useRef(0)
  const paramsKey = useMemo(() => JSON.stringify(params), [params])
  const stableParams = useMemo(() => JSON.parse(paramsKey) as WorldCupQueryParams, [paramsKey])
  const cacheKey = `world-cup-2026:${queryFn}:${paramsKey}`

  const refetch = useCallback(() => {
    worldCupCache.delete(cacheKey)
    setTick((value) => value + 1)
  }, [cacheKey])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const currentRequestId = ++requestId.current

    const load = async () => {
      const cached = worldCupCache.get(cacheKey) as T | undefined
      if (cached !== undefined) {
        if (mounted.current && requestId.current === currentRequestId) {
          setData(cached)
          setError(null)
          setIsLoading(false)
        }
        return
      }

      if (mounted.current) {
        setIsLoading(true)
        setError(null)
      }

      try {
        const result = await service[queryFn](stableParams)
        if (mounted.current && requestId.current === currentRequestId) {
          worldCupCache.set(cacheKey, result)
          setData(result as T)
        }
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Could not load World Cup data.'
        if (mounted.current && requestId.current === currentRequestId) {
          setError(message)
        }
      } finally {
        if (mounted.current && requestId.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }

    void load()
  }, [cacheKey, paramsKey, queryFn, stableParams, tick])

  useEffect(() => {
    if (!options.refetchIntervalMs) return undefined
    const interval = window.setInterval(() => {
      worldCupCache.delete(cacheKey)
      setTick((value) => value + 1)
    }, options.refetchIntervalMs)
    return () => window.clearInterval(interval)
  }, [cacheKey, options.refetchIntervalMs])

  return { data, isLoading, error, refetch }
}
