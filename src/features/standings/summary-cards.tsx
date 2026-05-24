import type { LeagueStandings } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { TeamEmblem } from '../../shared/ui/team-emblem'

type SummaryCardsProps = {
  standings: LeagueStandings
  language: LanguageCode
}

type SummaryMetric = {
  label: string
  value: string
  detail: string
  crestUrl: string | null
  tla: string
}

function deriveSummaryMetrics(
  standings: LeagueStandings,
  language: LanguageCode,
): SummaryMetric[] {
  const rows = standings.standings
  const leader = rows[0]
  const copy = getDashboardCopy(language)

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
      label: copy.leader,
      value: leader?.team.shortName ?? 'TBD',
      detail: leader ? `${leader.points} ${copy.pointsShort}` : copy.noData,
      crestUrl: leader?.team.crestUrl ?? null,
      tla: leader?.team.tla ?? '--',
    },
    {
      label: copy.bestAttack,
      value: bestAttack?.team.shortName ?? 'TBD',
      detail: bestAttack
        ? `${bestAttack.goalsFor} ${copy.goalsScored}`
        : copy.noData,
      crestUrl: bestAttack?.team.crestUrl ?? null,
      tla: bestAttack?.team.tla ?? '--',
    },
    {
      label: copy.bestDefense,
      value: bestDefense?.team.shortName ?? 'TBD',
      detail: bestDefense
        ? `${bestDefense.goalsAgainst} ${copy.goalsConceded}`
        : copy.noData,
      crestUrl: bestDefense?.team.crestUrl ?? null,
      tla: bestDefense?.team.tla ?? '--',
    },
    {
      label: copy.bestGoalDifference,
      value: bestGoalDifference?.team.shortName ?? 'TBD',
      detail: bestGoalDifference
        ? `${bestGoalDifference.goalDifference > 0 ? '+' : ''}${bestGoalDifference.goalDifference} ${copy.goalDifferenceShort}`
        : copy.noData,
      crestUrl: bestGoalDifference?.team.crestUrl ?? null,
      tla: bestGoalDifference?.team.tla ?? '--',
    },
  ]
}

export function SummaryCards({ standings, language }: SummaryCardsProps) {
  const metrics = deriveSummaryMetrics(standings, language)

  return (
    <section
      aria-label="League summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric, index) => (
        <article
          key={metric.label}
          className={[
            'dashboard-panel rounded-[24px] p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--league-accent-strong)] hover:shadow-[0_18px_36px_var(--league-accent-glow)]',
            index === 0 ? 'dashboard-glow' : '',
          ].join(' ')}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            {metric.label}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <TeamEmblem
                crestUrl={metric.crestUrl}
                fallback={metric.tla}
                teamName={metric.value}
                className="h-9 w-9 shrink-0"
              />
              <h2 className="truncate font-[var(--font-display)] text-[0.98rem] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)] sm:text-[1.05rem]">
                {metric.value}
              </h2>
            </div>
            <p className="shrink-0 text-right text-[12px] font-medium text-[var(--color-text-secondary)]">
              {metric.detail}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
