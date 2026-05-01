import type { LeagueStandings } from '../../services'

type SummaryCardsProps = {
  standings: LeagueStandings
}

type SummaryMetric = {
  label: string
  value: string
  detail: string
}

function deriveSummaryMetrics(standings: LeagueStandings): SummaryMetric[] {
  const rows = standings.standings
  const leader = rows[0]

  const bestAttack =
    rows.reduce((best, row) =>
      row.goalsFor > best.goalsFor ? row : best,
    ) ?? leader

  const bestDefense =
    rows.reduce((best, row) =>
      row.goalsAgainst < best.goalsAgainst ? row : best,
    ) ?? leader

  const bestGoalDifference =
    rows.reduce((best, row) =>
      row.goalDifference > best.goalDifference ? row : best,
    ) ?? leader

  return [
    {
      label: 'Leader',
      value: leader?.team.shortName ?? 'TBD',
      detail: leader ? `${leader.points} pts` : 'No data',
    },
    {
      label: 'Best attack',
      value: bestAttack?.team.shortName ?? 'TBD',
      detail: bestAttack ? `${bestAttack.goalsFor} goals scored` : 'No data',
    },
    {
      label: 'Best defense',
      value: bestDefense?.team.shortName ?? 'TBD',
      detail: bestDefense
        ? `${bestDefense.goalsAgainst} goals conceded`
        : 'No data',
    },
    {
      label: 'Best goal difference',
      value: bestGoalDifference?.team.shortName ?? 'TBD',
      detail: bestGoalDifference
        ? `${bestGoalDifference.goalDifference > 0 ? '+' : ''}${bestGoalDifference.goalDifference} GD`
        : 'No data',
    },
  ]
}

export function SummaryCards({ standings }: SummaryCardsProps) {
  const metrics = deriveSummaryMetrics(standings)

  return (
    <section
      aria-label="League summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-5 shadow-[var(--shadow-panel)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {metric.label}
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            {metric.value}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {metric.detail}
          </p>
        </article>
      ))}
    </section>
  )
}
