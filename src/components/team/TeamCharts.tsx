import { useMemo } from 'react'

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartColors, legendStyle, tooltipProps } from '@/components/charts/chartTheme'
import { ProfileRadar } from '@/components/charts/ProfileRadar'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import type { Match, Standing, Team } from '@/services/types'

const perGame = (value: number, played: number) => (played > 0 ? value / played : 0)

/** Scales `value` to 0–100 between the league minimum and maximum. */
function scale(value: number, values: number[], invert = false) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return 50
  const ratio = (value - min) / (max - min)
  return Math.round((invert ? 1 - ratio : ratio) * 100)
}

/**
 * Team profile relative to the rest of the league, derived only from the live
 * table: every axis is the team's rank-normalised value (0 = league worst,
 * 100 = league best), and the dashed shape is the league median.
 */
export function TeamProfileRadar({ standing, standings }: { standing?: Standing; standings: Standing[] }) {
  const { t } = useLocale()
  const data = useMemo(() => {
    const rows = standings.filter((row) => row.played > 0)
    if (!standing || standing.played === 0 || rows.length < 2) return []
    const metrics: Array<{ key: string; of: (row: Standing) => number; invert?: boolean }> = [
      { key: 'radarAttack', of: (row) => perGame(row.goalsFor, row.played) },
      { key: 'radarDefense', of: (row) => perGame(row.goalsAgainst, row.played), invert: true },
      { key: 'radarPoints', of: (row) => perGame(row.points, row.played) },
      { key: 'radarWinRate', of: (row) => perGame(row.won, row.played) },
      { key: 'radarGoalDiff', of: (row) => perGame(row.goalDifference, row.played) },
      {
        key: 'radarForm',
        of: (row) => row.form.reduce((sum, item) => sum + (item.result === 'W' ? 3 : item.result === 'D' ? 1 : 0), 0),
      },
    ]
    return metrics.map(({ key, of, invert }) => {
      const values = rows.map(of)
      const scaled = values.map((value) => scale(value, values, invert)).sort((a, b) => a - b)
      return {
        name: t(key),
        team: scale(of(standing), values, invert),
        median: scaled[Math.floor(scaled.length / 2)] ?? 50,
      }
    })
  }, [standing, standings, t])

  if (!data.length) {
    return <EmptyState title={t('noTrendYet')} description={t('chartNeedsMatches')} className="min-h-0 border-0 p-0" />
  }

  return (
    <ProfileRadar
      data={data}
      series={[
        { key: 'team', name: t('team'), tone: 'primary' },
        { key: 'median', name: t('leagueMedian'), tone: 'reference' },
      ]}
    />
  )
}

function finishedTeamMatches(matches: Match[], team: Team) {
  return matches
    .filter(
      (match) =>
        match.status === 'FINISHED' &&
        typeof match.homeScore === 'number' &&
        typeof match.awayScore === 'number' &&
        (match.homeTeam.id === team.id || match.awayTeam.id === team.id),
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .map((match) => {
      const home = match.homeTeam.id === team.id
      const scored = home ? match.homeScore! : match.awayScore!
      const conceded = home ? match.awayScore! : match.homeScore!
      const opponent = home ? match.awayTeam : match.homeTeam
      return { match, scored, conceded, opponent: opponent.shortName || opponent.name, home }
    })
}

/** Goals scored vs conceded in the team's most recent finished matches. */
export function TeamMatchGoalsChart({ matches, team, limit = 10 }: { matches: Match[]; team: Team; limit?: number }) {
  const { t } = useLocale()
  const data = useMemo(
    () =>
      finishedTeamMatches(matches, team)
        .slice(-limit)
        .map((item) => ({
          label: `${item.home ? '' : '@'}${item.opponent}`,
          scored: item.scored,
          conceded: item.conceded,
        })),
    [limit, matches, team],
  )

  if (!data.length) {
    return <EmptyState title={t('noTrendYet')} description={t('chartNeedsMatches')} className="min-h-0 border-0 p-0" />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="label" tick={axisTick} interval={0} angle={-30} textAnchor="end" height={48} />
        <YAxis allowDecimals={false} tick={axisTick} />
        <Tooltip {...tooltipProps} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Bar name={t('goalsScored')} dataKey="scored" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
        <Bar name={t('goalsConceded')} dataKey="conceded" fill={chartColors.negative} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Cumulative points over the season's finished matches. */
export function TeamPointsTrendChart({ matches, team }: { matches: Match[]; team: Team }) {
  const { t } = useLocale()
  const data = useMemo(
    () =>
      finishedTeamMatches(matches, team).reduce<Array<{ game: number; points: number; goals: number; opponent: string }>>(
        (rows, item, index) => {
          const previous = rows[index - 1]
          const won = item.scored > item.conceded ? 3 : item.scored === item.conceded ? 1 : 0
          rows.push({
            game: index + 1,
            points: (previous?.points ?? 0) + won,
            goals: (previous?.goals ?? 0) + item.scored,
            opponent: item.opponent,
          })
          return rows
        },
        [],
      ),
    [matches, team],
  )

  if (data.length < 2) {
    return <EmptyState title={t('noTrendYet')} description={t('chartNeedsMatches')} className="min-h-0 border-0 p-0" />
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="game" tick={axisTick} />
        <YAxis allowDecimals={false} tick={axisTick} />
        <Tooltip {...tooltipProps} cursor={{ stroke: chartColors.grid }} labelFormatter={(game) => t('matchNumber', { number: String(game) })} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Line name={t('cumulativePoints')} type="monotone" dataKey="points" stroke={chartColors.primary} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
        <Line name={t('cumulativeGoals')} type="monotone" dataKey="goals" stroke={chartColors.secondary} strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
