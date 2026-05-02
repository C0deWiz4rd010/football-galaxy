import { PolarAngleAxis, PolarGrid, Radar, RadarChart as ReRadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export function TeamRadarChart() {
  const data = ['Attack', 'Defense', 'Pressing', 'Possession', 'Set Pieces', 'Transitions'].map((name, index) => ({ name, team: 62 + index * 5, average: 58 + index * 3 }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <Tooltip />
        <Legend />
        <Radar name="Team" dataKey="team" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
        <Radar name="League average" dataKey="average" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.16} />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
