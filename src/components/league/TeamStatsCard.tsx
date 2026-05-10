import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { Standing } from '@/services/types'

function pickLeader(
  standings: Standing[],
  selector: (standing: Standing) => number,
  sortOrder: 'max' | 'min' = 'max',
) {
  return standings.slice().sort((left, right) => {
    const delta = selector(right) - selector(left)
    return sortOrder === 'max' ? delta : -delta
  })[0]
}

export function TeamStatsCard({ standings }: { standings: Standing[] }) {
  const topAttack = pickLeader(standings, (standing) => standing.goalsFor)
  const topDefense = pickLeader(standings, (standing) => standing.goalsAgainst, 'min')
  const topControl = pickLeader(standings, (standing) => standing.avgPossession)

  const data = [
    {
      name: 'Goals',
      team: topAttack?.team.shortName ?? '-',
      value: topAttack?.goalsFor ?? 0,
    },
    {
      name: 'Fewest GA',
      team: topDefense?.team.shortName ?? '-',
      value: topDefense?.goalsAgainst ?? 0,
    },
    {
      name: 'Possession',
      team: topControl?.team.shortName ?? '-',
      value: Math.round(topControl?.avgPossession ?? 0),
    },
  ]

  return (
    <section className="stat-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Team analytics
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">League Leaders</h2>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 12, right: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={92}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(value, _name, item) => [`${value}`, item.payload.team]} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid gap-2">
        {data.map((item) => (
          <div key={item.name} className="surface-soft flex items-center justify-between rounded-xl px-3 py-2 text-sm">
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium">
              {item.team} · {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
