import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import type { Player } from '@/services/types'

/**
 * Season output normalised per 90 minutes. Built only from the player's real
 * season totals; per-match splits are not available from the free sources.
 */
export function PerformanceChart({ player }: { player: Player }) {
  const { t } = useLocale()
  const { minutes, goals, assists, yellowCards, redCards } = player.stats
  const per90 = (value: number) => (minutes > 0 ? Math.round((value / minutes) * 90 * 100) / 100 : 0)
  const data = [
    { name: t('goals'), value: per90(goals) },
    { name: t('assists'), value: per90(assists) },
    { name: t('goalContributions'), value: per90(goals + assists) },
    { name: t('cards'), value: per90(yellowCards + redCards) },
  ]

  return (
    <section className="stat-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('seasonOutput')}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('per90Minutes')}</h2>
      </div>
      {minutes > 0 ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 16, left: -20, right: 8 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                color: 'hsl(var(--popover-foreground))',
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" name={t('per90Minutes')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" className="fill-foreground text-xs" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState title={t('noTrendYet')} description={t('noMinutesYet')} className="min-h-0 border-0 p-0" />
      )}
    </section>
  )
}
