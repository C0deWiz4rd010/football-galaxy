import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts'

import { axisTick, chartColors, legendStyle, tooltipProps } from './chartTheme'

export interface RadarSeries {
  key: string
  name: string
  /** `reference` is the dashed comparison shape (league median, second player). */
  tone: 'primary' | 'secondary' | 'reference'
}

const toneStyle = {
  primary: { stroke: chartColors.primary, fill: chartColors.primary, fillOpacity: 0.32 },
  secondary: { stroke: chartColors.secondary, fill: chartColors.secondary, fillOpacity: 0.18, strokeDasharray: '5 4' },
  reference: { stroke: chartColors.muted, fill: chartColors.muted, fillOpacity: 0.06, strokeDasharray: '4 4' },
} as const

/**
 * The one radar used across team, player and compare pages. Values are
 * expected on a 0–100 scale (percentile or league-normalised rank).
 */
export function ProfileRadar({
  data,
  series,
  height = 300,
  valueSuffix = '',
}: {
  data: Array<{ name: string } & Record<string, number | string>>
  series: RadarSeries[]
  height?: number
  valueSuffix?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke={chartColors.grid} />
        <PolarAngleAxis dataKey="name" tick={axisTick} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip {...tooltipProps} formatter={(value) => `${String(value)}${valueSuffix}`} />
        {series.length > 1 ? <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} /> : null}
        {series.map((item) => (
          <Radar key={item.key} name={item.name} dataKey={item.key} strokeWidth={2} {...toneStyle[item.tone]} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )
}
