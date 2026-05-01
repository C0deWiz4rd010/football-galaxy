import type { LeagueConfig, LeagueId } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'

type LeagueSelectorProps = {
  leagues: readonly LeagueConfig[]
  selectedLeagueId: LeagueId
  onSelect: (leagueId: LeagueId) => void
  language: LanguageCode
}

export function LeagueSelector({
  leagues,
  selectedLeagueId,
  onSelect,
  language,
}: LeagueSelectorProps) {
  const copy = getDashboardCopy(language)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            {copy.leagueSwitcherEyebrow}
          </p>
          <h2 className="mt-1 font-[var(--font-display)] text-[1.02rem] font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            {copy.leagueSwitcherTitle}
          </h2>
        </div>
        <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">
          {copy.cacheHint}
        </span>
      </div>

      <div className="flex snap-x gap-2 overflow-x-auto pb-1">
        {leagues.map((league) => {
          const isSelected = league.id === selectedLeagueId

          return (
            <button
              key={league.id}
              type="button"
              onClick={() => onSelect(league.id)}
              aria-pressed={isSelected}
              aria-label={`${league.country} ${league.label}`}
              className={[
                'dashboard-pill min-w-fit snap-start px-3.5 py-2.5 text-left duration-200',
                isSelected
                  ? 'border-[color:var(--league-accent)] bg-[linear-gradient(135deg,var(--league-accent-soft),rgba(255,255,255,0.04))] text-[var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--league-accent-soft)]'
                  : 'text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm" aria-hidden="true">
                  {league.flag}
                </span>
                <span className="block text-[13px] font-semibold sm:text-[14px]">
                  {league.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
