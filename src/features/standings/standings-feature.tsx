import type { LeagueConfig, StandingsProvider } from '../../services'
import { getLeagueConfig, useLeagueStandings } from '../../services'
import type { LeagueId } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { SummaryCards } from './summary-cards'
import { LeagueSelector } from './league-selector'
import { StandingsLoading } from './standings-loading'
import { StandingsState } from './standings-state'
import { StandingsTable } from './standings-table'
import { formatLastUpdated } from './time'

type StandingsFeatureProps = {
  leagueId: LeagueId
  provider?: StandingsProvider
  language: LanguageCode
  leagues: readonly LeagueConfig[]
  onLeagueSelect: (leagueId: LeagueId) => void
}

export function StandingsFeature({
  leagueId,
  provider,
  language,
  leagues,
  onLeagueSelect,
}: StandingsFeatureProps) {
  const league = getLeagueConfig(leagueId)
  const copy = getDashboardCopy(language)
  const { data, error, isLoading, isError, isFetching, refetch, dataUpdatedAt } =
    useLeagueStandings(leagueId, {
      provider,
    })

  const header = (
    <section className="dashboard-panel dashboard-glow overflow-hidden rounded-[32px] px-5 py-5 sm:px-6 sm:py-5.5">
      <div className="dashboard-grid absolute inset-0 opacity-25" />
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative space-y-2">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
              <span className="text-sm">{league.flag}</span>
              {league.country}
            </p>
            <div className="space-y-1">
              <h2 className="font-[var(--font-display)] text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-[2.1rem]">
                {data?.leagueLabel ?? league.label}
              </h2>
              <p className="text-[14px] leading-6 text-[var(--color-text-secondary)] sm:text-[15px]">
                {copy.matchdayLabel} {data?.season.currentMatchday ?? 'TBD'} -{' '}
                {copy.seasonLabel} {data?.season.label ?? 'Current season'}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-2 text-sm text-[var(--color-text-secondary)] lg:items-end">
            <span className="dashboard-pill inline-flex items-center gap-2 px-3 py-2">
              <span
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  isFetching || isLoading
                    ? 'bg-[var(--color-accent-warm)]'
                    : 'bg-[var(--league-accent)]',
                ].join(' ')}
              />
              {isFetching || isLoading ? copy.updating : copy.upToDate}
            </span>
            {!isLoading && data ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatLastUpdated(dataUpdatedAt, language)}
              </p>
            ) : null}
          </div>
        </div>

        <LeagueSelector
          leagues={leagues}
          selectedLeagueId={leagueId}
          onSelect={onLeagueSelect}
          language={language}
        />
      </div>
    </section>
  )

  if (isLoading) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {header}
        <StandingsLoading leagueLabel={league.label} language={language} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {header}
        <StandingsState
          eyebrow={copy.errorEyebrow}
          title={copy.errorTitle(league.label)}
          message={
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading league standings.'
          }
          tone="danger"
          actionLabel={copy.retryLabel}
          onAction={() => {
            void refetch()
          }}
        >
          <div className="dashboard-surface rounded-[24px] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            {copy.errorSupport}
          </div>
        </StandingsState>
      </div>
    )
  }

  if (!data || data.standings.length === 0) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {header}
        <StandingsState
          eyebrow={copy.emptyEyebrow}
          title={copy.emptyTitle(league.label)}
          message={copy.emptyMessage}
        >
          <div className="dashboard-surface rounded-[24px] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            {copy.emptySupport}
          </div>
        </StandingsState>
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {header}

      <SummaryCards standings={data} language={language} />
      <StandingsTable standings={data} language={language} />
    </div>
  )
}
