import type { StandingsProvider } from '../../services'
import { getLeagueConfig, useLeagueStandings } from '../../services'
import type { LeagueId } from '../../services'
import { SummaryCards } from './summary-cards'
import { StandingsLoading } from './standings-loading'
import { StandingsState } from './standings-state'
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
  const { data, error, isLoading, isError, isFetching, refetch } =
    useLeagueStandings(leagueId, {
      provider,
    })

  if (isLoading) {
    return <StandingsLoading leagueLabel={league.label} />
  }

  if (isError) {
    return (
      <StandingsState
        eyebrow="Match center error"
        title={`Unable to load ${league.label}`}
        message={
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while loading league standings.'
        }
        tone="danger"
        actionLabel="Try again"
        onAction={() => {
          void refetch()
        }}
      >
        <div className="dashboard-surface rounded-[24px] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          Check your connection or API configuration, then retry the selected
          league table.
        </div>
      </StandingsState>
    )
  }

  if (!data || data.standings.length === 0) {
    return (
      <StandingsState
        eyebrow="No table yet"
        title={`No standings available for ${league.label}`}
        message="This competition does not currently have table data ready to display. Try another league or come back once the season information is available."
      >
        <div className="dashboard-surface rounded-[24px] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          Football Galaxy will keep this space ready for full league table
          coverage as more competition data becomes available.
        </div>
      </StandingsState>
    )
  }

  return (
    <div className="space-y-6">
      <section className="dashboard-panel dashboard-glow overflow-hidden rounded-[32px] px-6 py-6 sm:px-7 sm:py-7">
        <div className="dashboard-grid absolute inset-0 opacity-25" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
              {league.country}
            </p>
            <div className="space-y-1">
              <h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl">
                {data.leagueLabel}
              </h2>
              <p className="text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
                Matchday {data.season.currentMatchday ?? 'TBD'} - Season{' '}
                {data.season.startDate.slice(0, 4)} /{' '}
                {data.season.endDate.slice(2, 4)}
              </p>
            </div>
          </div>

          <div className="relative text-sm text-[var(--color-text-secondary)]">
            <span className="dashboard-pill inline-flex items-center gap-2 px-3 py-2">
              <span
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  isFetching
                    ? 'bg-[var(--color-accent-warm)]'
                    : 'bg-[var(--color-accent)]',
                ].join(' ')}
              />
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
