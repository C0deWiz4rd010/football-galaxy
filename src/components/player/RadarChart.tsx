import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart as ReRadarChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import type { Player } from '@/services/types'

export function PlayerRadarChart({ player }: { player: Player }) {
  const [showAverage, setShowAverage] = useState(false)
  const attrs = player.stats.attributes
  const data = [
    ['Pace', attrs.pace],
    ['Shooting', attrs.shooting],
    ['Passing', attrs.passing],
    ['Dribbling', attrs.dribbling],
    ['Defending', attrs.defending],
    ['Physical', attrs.physical],
  ].map(([name, value]) => ({ name, player: value, average: 66 }))
  return (
    <section className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Attributes</h2>
        <Button variant="outline" size="sm" onClick={() => setShowAverage((value) => !value)}>vs League Average</Button>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ReRadarChart data={data}>
          <defs>
            <linearGradient id="playerRadar" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.65} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.28} />
            </linearGradient>
          </defs>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <Tooltip />
          <Radar dataKey="player" stroke="hsl(var(--primary))" fill="url(#playerRadar)" fillOpacity={0.55} />
          {showAverage ? <Radar dataKey="average" stroke="#94a3b8" strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.12} /> : null}
        </ReRadarChart>
      </ResponsiveContainer>
    </section>
  )
}
