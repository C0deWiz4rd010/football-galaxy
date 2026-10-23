import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartColors, chartPalette, legendStyle, tooltipProps, useChartMotion } from '@/components/charts/chartTheme'
import { useLocale } from '@/contexts/LocaleContext'
import { POSITION_ORDER, positionBucket, positionGroupKey } from '@/lib/positions'
import type { WorldCupMatchStatistic, WorldCupSquadPlayer } from '@/services/worldCup/types'

function toNumber(value: string | number): number {
  if (typeof value === 'number') return value
  const parsed = Number(String(value).replace('%', '').trim())
  return Number.isFinite(parsed) ? parsed : 0
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
  const { t } = useLocale()
  const chartMotion = useChartMotion()
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
    <div role="img" aria-label={t('wcMatchStatsAria', { home: homeName, away: awayName })}>
      <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 40 + 48)}>
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16 }} barGap={2}>
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" tick={axisTick} />
          <YAxis type="category" dataKey="type" tick={categoryTick} width={110} />
          <Tooltip {...tooltipProps} />
          <Legend {...legendProps} verticalAlign="top" />
          <Bar {...chartMotion} name={homeName} dataKey="home" fill={chartColors.primary} radius={[0, 4, 4, 0]} maxBarSize={12} />
          <Bar {...chartMotion} name={awayName} dataKey="away" fill={chartColors.secondary} radius={[0, 4, 4, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Donut({ data, label, height }: { data: Array<{ name: string; value: number; color: string }>; label: string; height: number }) {
  const chartMotion = useChartMotion()
  return (
    <div role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip {...tooltipProps} />
          <Legend {...legendProps} />
          <Pie {...chartMotion} data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke={chartColors.surface} strokeWidth={2}>
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
  const { t } = useLocale()
  const counts = new Map<string, number>()
  for (const player of players) {
    const bucket = positionBucket(player.position)
    const name = bucket ? t(positionGroupKey[bucket]) : t('posUnknown')
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const order = [...POSITION_ORDER.map((code) => t(positionGroupKey[code])), t('posUnknown')]
  const data = order
    .filter((name) => counts.has(name))
    .map((name, index) => ({ name, value: counts.get(name)!, color: chartPalette[index % chartPalette.length] ?? chartColors.muted }))

  if (!data.length) return null
  return <Donut data={data} label={t('wcSquadCompositionAria')} height={200} />
}

/** Overview pulse: live / upcoming / finished match distribution as a donut. */
export function MatchStatePulse({ live, upcoming, recent }: { live: number; upcoming: number; recent: number }) {
  const { t } = useLocale()
  const data = [
    { name: t('wcStateLive'), value: live, color: chartColors.live },
    { name: t('wcStateUpcoming'), value: upcoming, color: chartColors.secondary },
    { name: t('wcStateFinished'), value: recent, color: chartColors.muted },
  ].filter((entry) => entry.value > 0)

  // A single state (e.g. an archived, finished tournament) is a full ring: no information.
  if (data.length < 2) return null
  return <Donut data={data} label={t('wcMatchStateAria')} height={200} />
}
