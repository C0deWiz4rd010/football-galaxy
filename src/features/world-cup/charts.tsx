import { useCallback } from 'react'

import { EChart } from '@/components/charts/EChart'
import { tooltipStyle, type ChartTheme } from '@/components/charts/echarts-theme'
import type {
  WorldCupGroupStanding,
  WorldCupMatchStatistic,
  WorldCupSquadPlayer,
} from '@/services/worldCup/types'

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

/**
 * Home vs away match-statistic comparison as grouped horizontal bars. Falls back
 * to `null` when the provider has not returned paired numeric statistics so the
 * caller can keep its plain-list fallback.
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
    .map((type) => {
      const home = statistics.find((stat) => stat.teamId === homeTeamId && stat.type === type)
      const away = statistics.find((stat) => stat.teamId === awayTeamId && stat.type === type)
      if (!home && !away) return null
      return { type, home: toNumber(home?.value ?? 0), away: toNumber(away?.value ?? 0) }
    })
    .filter((row): row is { type: string; home: number; away: number } => row !== null)
    .slice(0, 8)

  const getOption = useCallback(
    (theme: ChartTheme) => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipStyle(theme) },
      legend: {
        data: [homeName, awayName],
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: { left: 4, right: 16, top: 34, bottom: 4, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { color: theme.muted, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.border } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((row) => row.type),
        axisLabel: { color: theme.foreground, fontSize: 11 },
        axisLine: { lineStyle: { color: theme.border } },
        axisTick: { show: false },
      },
      series: [
        {
          name: homeName,
          type: 'bar',
          data: rows.map((row) => row.home),
          itemStyle: { color: theme.primary, borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 12,
        },
        {
          name: awayName,
          type: 'bar',
          data: rows.map((row) => row.away),
          itemStyle: { color: theme.info, borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 12,
        },
      ],
    }),
    [rows, homeName, awayName],
  )

  if (!rows.length) return null

  return (
    <EChart
      ariaLabel={`Match statistics comparison between ${homeName} and ${awayName}`}
      getOption={getOption}
      height={Math.max(180, rows.length * 38 + 40)}
    />
  )
}

/** Group points as a colour-coded horizontal bar chart by qualification zone. */
export function GroupPointsChart({ rows }: { rows: WorldCupGroupStanding[] }) {
  const data = rows.map((row) => ({
    name: row.team.placeholder ? 'Pending' : row.team.code || row.team.name,
    points: row.points,
    hint: row.qualificationHint,
  }))

  const getOption = useCallback(
    (theme: ChartTheme) => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, ...tooltipStyle(theme) },
      grid: { left: 4, right: 24, top: 8, bottom: 4, containLabel: true },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: theme.muted, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.border } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: data.map((row) => row.name),
        axisLabel: { color: theme.foreground, fontSize: 11 },
        axisLine: { lineStyle: { color: theme.border } },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: data.map((row) => ({
            value: row.points,
            itemStyle: {
              color:
                row.hint === 'top-two'
                  ? theme.info
                  : row.hint === 'best-third-watch'
                    ? theme.warning
                    : theme.muted,
              borderRadius: [0, 5, 5, 0],
            },
          })),
          barMaxWidth: 16,
          label: {
            show: true,
            position: 'right',
            color: theme.foreground,
            fontSize: 11,
            fontWeight: 'bold',
          },
        },
      ],
    }),
    [data],
  )

  if (!data.length) return null

  return (
    <EChart
      ariaLabel="Group points by qualification zone"
      getOption={getOption}
      height={Math.max(120, data.length * 30 + 24)}
    />
  )
}

/** Squad composition donut grouped into goalkeeper/defender/midfielder/forward. */
export function SquadPositionChart({ players }: { players: WorldCupSquadPlayer[] }) {
  const counts = players.reduce<Record<string, number>>((acc, player) => {
    const bucket = bucketPosition(player.position)
    acc[bucket] = (acc[bucket] ?? 0) + 1
    return acc
  }, {})
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  const getOption = useCallback(
    (theme: ChartTheme) => {
      const palette = [theme.primary, theme.info, theme.warning, theme.success, theme.muted]
      return {
        tooltip: { trigger: 'item', ...tooltipStyle(theme) },
        legend: {
          orient: 'vertical',
          right: 0,
          top: 'center',
          textStyle: { color: theme.muted, fontSize: 11 },
          itemWidth: 10,
          itemHeight: 10,
        },
        series: [
          {
            type: 'pie',
            radius: ['52%', '74%'],
            center: ['34%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: theme.surface, borderWidth: 2, borderRadius: 4 },
            label: { show: false },
            data: data.map((entry, index) => ({
              ...entry,
              itemStyle: { color: palette[index % palette.length] },
            })),
          },
        ],
      }
    },
    [data],
  )

  if (!data.length) return null

  return (
    <EChart ariaLabel="Squad composition by position" getOption={getOption} height={180} />
  )
}

/** Overview pulse: live / upcoming / finished match distribution as a donut. */
export function MatchStatePulse({
  live,
  upcoming,
  recent,
}: {
  live: number
  upcoming: number
  recent: number
}) {
  const data = [
    { name: 'Live', value: live, key: 'live' as const },
    { name: 'Upcoming', value: upcoming, key: 'info' as const },
    { name: 'Finished', value: recent, key: 'muted' as const },
  ].filter((entry) => entry.value > 0)

  const getOption = useCallback(
    (theme: ChartTheme) => ({
      tooltip: { trigger: 'item', ...tooltipStyle(theme) },
      legend: {
        bottom: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          type: 'pie',
          radius: ['56%', '78%'],
          center: ['50%', '44%'],
          itemStyle: { borderColor: theme.surface, borderWidth: 2, borderRadius: 4 },
          label: { show: false },
          data: data.map((entry) => ({
            name: entry.name,
            value: entry.value,
            itemStyle: { color: theme[entry.key] },
          })),
        },
      ],
    }),
    [data],
  )

  if (!data.length) return null

  return (
    <EChart ariaLabel="Match state distribution" getOption={getOption} height={200} />
  )
}
