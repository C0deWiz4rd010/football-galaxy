import { useMemo } from 'react'

import { ProfileRadar } from '@/components/charts/ProfileRadar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import { buildMetricPools, playerPercentiles } from '@/lib/percentiles'
import type { Player, PlayerRef } from '@/services/types'

/**
 * Season profile as percentiles against the league's goal and assist leaders.
 * The dashed shape is the pool median (50), so the chart only shows real data.
 */
export function PlayerRadarChart({ player, pool }: { player: Player; pool: PlayerRef[] }) {
  const { t } = useLocale()
  const data = useMemo(() => {
    if (!pool.length) return []
    return playerPercentiles(player, buildMetricPools(pool)).map(({ metric, percentile }) => ({
      name: t(metric.labelKey),
      player: percentile,
      median: 50,
    }))
  }, [player, pool, t])

  return (
    <section className="stat-card">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('percentileEyebrow')}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('radarView')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('percentileLeadersSubtitle')}</p>
      </div>
      {data.length ? (
        <ProfileRadar
          data={data}
          valueSuffix=" / 100"
          series={[
            { key: 'player', name: player.name, tone: 'primary' },
            { key: 'median', name: t('leagueMedian'), tone: 'reference' },
          ]}
        />
      ) : (
        <EmptyState title={t('noTrendYet')} description={t('chartNeedsMatches')} className="min-h-0 border-0 p-0" />
      )}
    </section>
  )
}
