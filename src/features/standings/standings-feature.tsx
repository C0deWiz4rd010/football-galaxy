import type { LeagueConfig, StandingsProvider } from '../../services'
import { getLeagueConfig, useLeagueStandings } from '../../services'
import type { LeagueId } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { FlagIcon } from '../../shared/ui/flag-icon'
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
  selectedMatchday: number | null
  onLeagueSelect: (leagueId: LeagueId) => void
  onMatchdaySelect: (matchday: number) => void
}

export function StandingsFeature({
  leagueId,
  provider,
  language,
  leagues,
  selectedMatchday,
  onLeagueSelect,
  onMatchdaySelect,
}: StandingsFeatureProps) {
  const league = getLeagueConfig(leagueId)
  const copy = getDashboardCopy(language)
  const { data, error, isLoading, isError, isFetching, refetch, dataUpdatedAt } =
    useLeagueStandings(leagueId, {
      provider,
      matchday: selectedMatchday,
    })

  const header = (
    <section className="dashboard-panel dashboard-glow overflow-hidden rounded-[28px] px-4 py-4 sm:px-5 sm:py-4.5">
      <div className="dashboard-grid absolute inset-0 opacity-25" />
      <div className="space-y-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative min-w-0 space-y-1.5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              <FlagIcon
                code={league.flagCode}
                title={league.country}
                className="h-4 w-4 shrink-0"
              />
              {league.country}
            </p>
            <div className="space-y-1">
              <h2 className="font-[var(--font-display)] text-[1.35rem] font-semibold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-[1.72rem]">
                {data?.leagueLabel ?? league.label}
              </h2>
              <p className="text-[13px] leading-5 text-[var(--color-text-secondary)]">
                {copy.matchdayLabel}{' '}
                {data?.season.selectedMatchday ??
                  data?.season.currentMatchday ??
                  'TBD'}{' '}
                ·{' '}
                {copy.seasonLabel} {data?.season.label ?? 'Current season'}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-1.5 text-sm text-[var(--color-text-secondary)] lg:items-end">
            <span className="dashboard-pill inline-flex items-center gap-2 px-3 py-1.5 text-[12px]">
              <span
                className={[
                  'h-2 w-2 rounded-full',
                  isFetching || isLoading
                    ? 'bg-[var(--color-accent-warm)]'
                    : 'bg-[var(--league-accent)]',
                ].join(' ')}
              />
              {isFetching || isLoading ? copy.updating : copy.upToDate}
            </span>
            {!isLoading && data ? (
              <p className="text-[11px] text-[var(--color-text-muted)]">
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
      <StandingsTable
        standings={data}
        language={language}
        onMatchdaySelect={onMatchdaySelect}
      />
    </div>
  )
}
