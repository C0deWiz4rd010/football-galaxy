import { useLocale } from '@/contexts/LocaleContext'
import type { Player } from '@/services/types'

export function StatBar({ player }: { player: Player }) {
  const { t, locale } = useLocale()
  const stats = [
    ['appearancesLabel', player.stats.appearances],
    ['goals', player.stats.goals],
    ['assists', player.stats.assists],
    ['yellowCards', player.stats.yellowCards],
    ['redCards', player.stats.redCards],
    ['minutes', player.stats.minutes],
  ] as const
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {stats.map(([labelKey, value]) => (
        <div key={labelKey} className="stat-card">
          <p className="font-mono text-2xl font-bold tabular-nums sm:text-3xl">{value.toLocaleString(locale)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t(labelKey)}</p>
        </div>
      ))}
    </section>
  )
}
