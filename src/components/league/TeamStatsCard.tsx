import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Standing } from '@/services/types'

export function TeamStatsCard({ standings }: { standings: Standing[] }) {
  const data = [
    { name: 'Most Goals', team: standings[0]?.team.shortName ?? '-', value: Math.max(...standings.map((standing) => standing.goalsFor)) },
    { name: 'Fewest Conceded', team: standings[0]?.team.shortName ?? '-', value: Math.min(...standings.map((standing) => standing.goalsAgainst)) },
    { name: 'Avg Possession', team: standings[0]?.team.shortName ?? '-', value: Math.round(Math.max(...standings.map((standing) => standing.avgPossession))) },
  ]
  return (
    <section className="stat-card">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Team Stats</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value, _name, item) => [`${value}`, item.payload.team]} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
