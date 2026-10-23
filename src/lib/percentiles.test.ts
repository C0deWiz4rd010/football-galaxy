import { describe, expect, it } from 'vitest'

import { makePlayer, makePlayerRef, makeTeam } from '@/test/fixtures'

import { buildMetricPools, comparablePool, MIN_POOL_SIZE, percentileRank, playerPercentiles } from './percentiles'

describe('percentiles', () => {
  it('ranks a value within an ascending pool', () => {
    expect(percentileRank([], 3)).toBe(0)
    expect(percentileRank([1, 2, 3, 4], 2)).toBe(50)
    expect(percentileRank([1, 2, 3, 4], 9)).toBe(100)
  })

  it('compares a player profile with the league leader pool', () => {
    const team = makeTeam(0)
    const ref = (goals: number, assists: number, appearances: number, index: number) => ({ ...makePlayerRef(index, team), goals, assists, appearances })
    const pool = [ref(1, 0, 5, 0), ref(4, 2, 5, 1), ref(8, 1, 4, 2)]
    const player = makePlayer({ stats: { goals: 4, assists: 2, appearances: 5 } })
    const byKey = Object.fromEntries(playerPercentiles(player, buildMetricPools(pool)).map((entry) => [entry.metric.key, entry.percentile]))
    expect(byKey.goals).toBe(67)
    expect(byKey.assists).toBe(100)
    expect(byKey.appearances).toBe(100)
  })

  it('drops leaders without appearances and refuses tiny pools', () => {
    const team = makeTeam(0)
    const ref = (appearances: number, index: number) => ({ ...makePlayerRef(index, team), goals: 3, assists: 1, appearances })
    const full = Array.from({ length: MIN_POOL_SIZE }, (_, index) => ref(6, index))

    expect(comparablePool([...full, ref(0, 99)])).toHaveLength(MIN_POOL_SIZE)
    expect(comparablePool(full.slice(1))).toEqual([])
  })
})
