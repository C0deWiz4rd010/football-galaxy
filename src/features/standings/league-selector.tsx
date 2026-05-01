import type { LeagueConfig, LeagueId } from '../../services'

type LeagueSelectorProps = {
  leagues: readonly LeagueConfig[]
  selectedLeagueId: LeagueId
  onSelect: (leagueId: LeagueId) => void
}

export function LeagueSelector({
  leagues,
  selectedLeagueId,
  onSelect,
}: LeagueSelectorProps) {
  return (
    <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] p-3 shadow-[var(--shadow-panel)]">
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
                'min-w-fit snap-start rounded-full border px-4 py-3 text-left transition-colors',
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                  : 'border-[var(--color-border-subtle)] bg-white/60 text-[var(--color-text-primary)] hover:bg-white',
              ].join(' ')}
            >
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] opacity-75">
                {league.country}
              </span>
              <span className="mt-1 block text-sm font-semibold">
                {league.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
