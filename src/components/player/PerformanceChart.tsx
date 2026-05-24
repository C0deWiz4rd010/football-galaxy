import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Player } from '@/services/types'

export function PerformanceChart({ player }: { player: Player }) {
  const data = Array.from({ length: 10 }, (_, index) => ({ matchday: index + 29, goals: (player.stats.goals + index) % 3, assists: (player.stats.assists + index) % 2 }))
  return (
    <section className="stat-card">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <XAxis dataKey="matchday" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="goals" fill="hsl(var(--primary))" animationDuration={600} />
          <Line dataKey="assists" stroke="#22c55e" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  )
}
