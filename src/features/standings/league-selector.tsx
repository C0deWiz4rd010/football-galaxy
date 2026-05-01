import type { LeagueConfig, LeagueId } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { FlagIcon } from '../../shared/ui/flag-icon'

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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          {copy.leagueSwitcherTitle}
        </p>
        <span className="hidden text-[11px] text-[var(--color-text-muted)] sm:inline">
          {copy.cacheHint}
        </span>
      </div>

      <div className="flex snap-x gap-1.5 overflow-x-auto pb-1">
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
                'dashboard-pill min-w-fit snap-start px-3 py-2 text-left duration-200',
                isSelected
                  ? 'border-[color:var(--league-accent)] bg-[linear-gradient(135deg,var(--league-accent-soft),rgba(255,255,255,0.04))] text-[var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--league-accent-soft)]'
                  : 'text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]',
              ].join(' ')}
            >
              <span className="flex items-center gap-2">
                <FlagIcon
                  code={league.flagCode}
                  title={league.country}
                  className="h-4 w-4 shrink-0"
                />
                <span className="block text-[12px] font-semibold sm:text-[13px]">
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
