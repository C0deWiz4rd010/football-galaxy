import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { Player } from '@/services/types'

export function StatBar({ player }: { player: Player }) {
  const stats = [
    ['Appearances', player.stats.appearances],
    ['Goals', player.stats.goals],
    ['Assists', player.stats.assists],
    ['Yellow Cards', player.stats.yellowCards],
    ['Red Cards', player.stats.redCards],
    ['Minutes', player.stats.minutes],
  ] as const
  const trend = player.stats.trend.map((value, index) => ({ index, value }))
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {stats.map(([label, value]) => (
        <div key={label} className="stat-card">
          <p className="font-mono text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          <ResponsiveContainer width={60} height={24}>
            <LineChart data={trend}><Line dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </section>
  )
}
