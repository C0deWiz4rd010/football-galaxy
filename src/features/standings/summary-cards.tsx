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
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric, index) => (
        <article
          key={metric.label}
          className={[
            'dashboard-panel rounded-[28px] p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--league-accent-strong)] hover:shadow-[0_20px_40px_var(--league-accent-glow)] sm:p-6',
            index === 0 ? 'dashboard-glow' : '',
          ].join(' ')}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-muted)]">
            {metric.label}
          </p>
          <h2 className="mt-4 font-[var(--font-display)] text-[1.15rem] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-[1.35rem]">
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
