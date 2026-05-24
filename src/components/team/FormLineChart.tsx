import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function FormLineChart() {
  const data = Array.from({ length: 10 }, (_, index) => ({ matchday: index + 29, points: 2 + index * 2 + (index % 3), goals: 1 + (index % 4) + index }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="matchday" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="goals" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
