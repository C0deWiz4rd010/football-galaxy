import type { StandingsProvider } from '../../services'
import { useLeagueStandings } from '../../services'
import type { LeagueId } from '../../services'
import { StandingsTable } from './standings-table'

type StandingsFeatureProps = {
  leagueId: LeagueId
  provider?: StandingsProvider
}

export function StandingsFeature({
  leagueId,
  provider,
}: StandingsFeatureProps) {
  const { data, error, isLoading, isError } = useLeagueStandings(leagueId, {
    provider,
  })

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-6 shadow-[var(--shadow-panel)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            Loading
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Fetching standings
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
            Unable to load standings
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
            No standings available
          </h2>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            The selected league does not currently have standings data to
            display.
          </p>
        </div>
      </section>
    )
  }

  return <StandingsTable standings={data} />
}
