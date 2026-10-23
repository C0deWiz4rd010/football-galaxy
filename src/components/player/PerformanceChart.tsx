import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartColors, tooltipProps, useChartMotion } from '@/components/charts/chartTheme'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import type { Player } from '@/services/types'

/**
 * Season output per appearance, from the player's real season totals. The
 * feeds have no minutes played, so there is no per-90 view.
 */
export function PerformanceChart({ player }: { player: Player }) {
  const { t } = useLocale()
  const chartMotion = useChartMotion()
  const { appearances, goals, assists, yellowCards, redCards } = player.stats
  const perGame = (value: number) => (appearances > 0 ? Math.round((value / appearances) * 100) / 100 : 0)
  const data = [
    { name: t('goals'), value: perGame(goals) },
    { name: t('assists'), value: perGame(assists) },
    { name: t('goalContributions'), value: perGame(goals + assists) },
    { name: t('cards'), value: perGame(yellowCards + redCards) },
  ]

  return (
    <section className="stat-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('seasonOutput')}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('perAppearance')}</h2>
      </div>
      {appearances > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 16, left: -20, right: 8 }}>
            <CartesianGrid vertical={false} stroke={chartColors.grid} />
            <XAxis dataKey="name" tick={axisTick} />
            <YAxis tick={axisTick} />
            <Tooltip {...tooltipProps} />
            <Bar {...chartMotion} dataKey="value" name={t('perAppearance')} fill={chartColors.primary} radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" className="fill-foreground text-xs" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState title={t('noTrendYet')} description={t('noAppearancesYet')} className="min-h-0 border-0 p-0" />
      )}
    </section>
  )
}
