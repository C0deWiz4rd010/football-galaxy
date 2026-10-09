import type { Player, PlayerRef } from '@/services/types'

/** Percentile rank (0–100) of `value` within an ascending-sorted pool. */
export function percentileRank(sortedAsc: number[], value: number): number {
  if (sortedAsc.length === 0) return 0
  let count = 0
  for (const entry of sortedAsc) {
    if (entry <= value) count += 1
    else break
  }
  return Math.round((count / sortedAsc.length) * 100)
}

const perGame = (value: number, appearances: number) => (appearances > 0 ? value / appearances : 0)

export interface PlayerMetric {
  key: string
  /** Locale key for the axis/row label. */
  labelKey: string
  pool: (player: PlayerRef) => number
  value: (player: Player) => number
}

/**
 * Season metrics comparable between a full player profile and the league's
 * leader pool (the only league-wide player data the free sources provide).
 */
export const playerMetrics: PlayerMetric[] = [
  { key: 'goals', labelKey: 'goals', pool: (p) => p.goals, value: (p) => p.stats.goals },
  { key: 'assists', labelKey: 'assists', pool: (p) => p.assists, value: (p) => p.stats.assists },
  { key: 'contributions', labelKey: 'goalContributions', pool: (p) => p.goals + p.assists, value: (p) => p.stats.goals + p.stats.assists },
  { key: 'goalsPerGame', labelKey: 'goalsPerGame', pool: (p) => perGame(p.goals, p.appearances), value: (p) => perGame(p.stats.goals, p.stats.appearances) },
  { key: 'assistsPerGame', labelKey: 'assistsPerGame', pool: (p) => perGame(p.assists, p.appearances), value: (p) => perGame(p.stats.assists, p.stats.appearances) },
  { key: 'appearances', labelKey: 'appearancesLabel', pool: (p) => p.appearances, value: (p) => p.stats.appearances },
]

/** Ascending value lists per metric, built once per pool. */
export function buildMetricPools(pool: PlayerRef[], metrics: PlayerMetric[] = playerMetrics): Map<string, number[]> {
  return new Map(metrics.map((metric) => [metric.key, pool.map(metric.pool).sort((a, b) => a - b)]))
}

export function playerPercentiles(player: Player, pools: Map<string, number[]>, metrics: PlayerMetric[] = playerMetrics) {
  return metrics.map((metric) => ({ metric, value: metric.value(player), percentile: percentileRank(pools.get(metric.key) ?? [], metric.value(player)) }))
}
