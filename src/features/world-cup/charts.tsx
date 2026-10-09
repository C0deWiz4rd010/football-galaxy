import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartColors, chartPalette, legendStyle, tooltipProps } from '@/components/charts/chartTheme'
import type { WorldCupGroupStanding, WorldCupMatchStatistic, WorldCupSquadPlayer } from '@/services/worldCup/types'

function toNumber(value: string | number): number {
  if (typeof value === 'number') return value
  const parsed = Number(String(value).replace('%', '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

const POSITION_BUCKETS: Record<string, string> = {
  G: 'Goalkeepers',
  Goalkeeper: 'Goalkeepers',
  D: 'Defenders',
  Defender: 'Defenders',
  M: 'Midfielders',
  Midfielder: 'Midfielders',
  F: 'Forwards',
  Forward: 'Forwards',
  Attacker: 'Forwards',
}

function bucketPosition(position?: string): string {
  if (!position) return 'Unassigned'
  return POSITION_BUCKETS[position] ?? position
}

const legendProps = { wrapperStyle: legendStyle, iconType: 'circle', iconSize: 8 } as const
const categoryTick = { ...axisTick, fill: chartColors.foreground }

/**
 * Home vs away match-statistic comparison as grouped horizontal bars. Renders
 * nothing when the provider has not returned paired statistics so the caller
 * keeps its plain-list fallback.
 */
export function MatchStatsChart({
  statistics,
  homeTeamId,
  awayTeamId,
  homeName,
  awayName,
}: {
  statistics: WorldCupMatchStatistic[]
  homeTeamId: string
  awayTeamId: string
  homeName: string
  awayName: string
}) {
  const types = Array.from(new Set(statistics.map((stat) => stat.type)))
  const rows = types
    .flatMap((type) => {
      const home = statistics.find((stat) => stat.teamId === homeTeamId && stat.type === type)
      const away = statistics.find((stat) => stat.teamId === awayTeamId && stat.type === type)
      if (!home && !away) return []
      return [{ type, home: toNumber(home?.value ?? 0), away: toNumber(away?.value ?? 0) }]
    })
    .slice(0, 8)

  if (!rows.length) return null

  return (
    <div role="img" aria-label={`Match statistics comparison between ${homeName} and ${awayName}`}>
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 40 + 48)}>
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16 }} barGap={2}>
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" tick={axisTick} />
          <YAxis type="category" dataKey="type" tick={categoryTick} width={110} />
          <Tooltip {...tooltipProps} />
          <Legend {...legendProps} verticalAlign="top" />
          <Bar name={homeName} dataKey="home" fill={chartColors.primary} radius={[0, 4, 4, 0]} maxBarSize={12} />
          <Bar name={awayName} dataKey="away" fill={chartColors.secondary} radius={[0, 4, 4, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const hintColor = {
  'top-two': chartColors.secondary,
  'best-third-watch': chartColors.warning,
  pending: chartColors.muted,
} as const

/** Group points as a colour-coded horizontal bar chart by qualification zone. */
export function GroupPointsChart({ rows }: { rows: WorldCupGroupStanding[] }) {
  const data = rows.map((row) => ({
    name: row.team.placeholder ? 'Pending' : row.team.code || row.team.name,
    points: row.points,
    hint: row.qualificationHint,
  }))

  if (!data.length) return null

  return (
    <div role="img" aria-label="Group points by qualification zone">
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 30 + 24)}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 28 }}>
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis type="category" dataKey="name" tick={categoryTick} width={52} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipProps} />
          <Bar name="Points" dataKey="points" radius={[0, 5, 5, 0]} maxBarSize={16}>
            {data.map((row) => (
              <Cell key={row.name} fill={hintColor[row.hint]} />
            ))}
            <LabelList dataKey="points" position="right" fill={chartColors.foreground} fontSize={12} fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Donut({ data, label, height }: { data: Array<{ name: string; value: number; color: string }>; label: string; height: number }) {
  return (
    <div role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip {...tooltipProps} />
          <Legend {...legendProps} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke={chartColors.surface} strokeWidth={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Squad composition donut grouped into goalkeeper/defender/midfielder/forward. */
export function SquadPositionChart({ players }: { players: WorldCupSquadPlayer[] }) {
  const counts = players.reduce<Record<string, number>>((acc, player) => {
    const bucket = bucketPosition(player.position)
    acc[bucket] = (acc[bucket] ?? 0) + 1
    return acc
  }, {})
  const data = Object.entries(counts).map(([name, value], index) => ({ name, value, color: chartPalette[index % chartPalette.length] ?? chartColors.muted }))

  if (!data.length) return null
  return <Donut data={data} label="Squad composition by position" height={200} />
}

/** Overview pulse: live / upcoming / finished match distribution as a donut. */
export function MatchStatePulse({ live, upcoming, recent }: { live: number; upcoming: number; recent: number }) {
  const data = [
    { name: 'Live', value: live, color: chartColors.live },
    { name: 'Upcoming', value: upcoming, color: chartColors.secondary },
    { name: 'Finished', value: recent, color: chartColors.muted },
  ].filter((entry) => entry.value > 0)

  // A single state (e.g. an archived, finished tournament) is a full ring: no information.
  if (data.length < 2) return null
  return <Donut data={data} label="Match state distribution" height={200} />
}
