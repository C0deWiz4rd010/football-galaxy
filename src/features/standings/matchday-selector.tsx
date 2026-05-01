import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'

type MatchdaySelectorProps = {
  currentMatchday: number | null
  selectedMatchday: number | null
  language: LanguageCode
  onSelect: (matchday: number) => void
}

export function MatchdaySelector({
  currentMatchday,
  selectedMatchday,
  language,
  onSelect,
}: MatchdaySelectorProps) {
  const copy = getDashboardCopy(language)

  if (!currentMatchday || currentMatchday < 1) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {copy.matchdayLabel}
      </span>
      {Array.from({ length: currentMatchday }, (_, index) => {
        const matchday = index + 1
        const isSelected = matchday === selectedMatchday

        return (
          <button
            key={matchday}
            type="button"
            onClick={() => onSelect(matchday)}
            aria-pressed={isSelected}
            className={[
              'dashboard-pill h-8 w-8 shrink-0 text-[12px] font-semibold tabular-nums',
              isSelected
                ? 'border-[color:var(--league-accent)] bg-[linear-gradient(135deg,var(--league-accent-soft),rgba(255,255,255,0.04))] text-[var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--league-accent-soft)]'
                : 'text-[var(--color-text-secondary)]',
            ].join(' ')}
          >
            {matchday}
          </button>
        )
      })}
    </div>
  )
}
