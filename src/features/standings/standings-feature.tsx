import type { StandingsProvider } from '../../services'
import { getLeagueConfig, useLeagueStandings } from '../../services'
import type { LeagueId } from '../../services'
import { SummaryCards } from './summary-cards'
import { StandingsTable } from './standings-table'

type StandingsFeatureProps = {
  leagueId: LeagueId
  provider?: StandingsProvider
}

export function StandingsFeature({
  leagueId,
  provider,
}: StandingsFeatureProps) {
  const league = getLeagueConfig(leagueId)
  const { data, error, isLoading, isError, isFetching } = useLeagueStandings(
    leagueId,
    {
      provider,
    },
  )

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Loading
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Fetching {league.label}
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            League table data is loading for the selected competition.
          </p>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Error
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Unable to load {league.label}
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading league standings.'}
          </p>
        </div>
      </section>
    )
  }

  if (!data || data.standings.length === 0) {
    return (
      <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Empty
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            No standings available for {league.label}
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            The selected league does not currently have standings data to
            display.
          </p>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] px-6 py-5 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              {league.country}
            </p>
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                {data.leagueLabel}
              </h2>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
                Matchday {data.season.currentMatchday ?? 'TBD'} • Season{' '}
                {data.season.startDate.slice(0, 4)} /{' '}
                {data.season.endDate.slice(2, 4)}
              </p>
            </div>
          </div>

          <div className="text-sm text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-white/60 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              {isFetching ? 'Updating standings' : 'Standings up to date'}
            </span>
          </div>
        </div>
      </section>

      <SummaryCards standings={data} />
      <StandingsTable standings={data} />
    </div>
  )
}
