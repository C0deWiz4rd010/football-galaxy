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
    <section className="dashboard-panel rounded-[28px] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-2 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            Competition
          </p>
          <h2 className="mt-1 font-[var(--font-display)] text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            Switch league
          </h2>
        </div>
        <span className="hidden text-xs text-[var(--color-text-muted)] sm:inline">
          Cached league views stay ready as you browse.
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
                'dashboard-pill min-w-fit snap-start px-4 py-3 text-left',
                isSelected
                  ? 'border-[var(--color-border-strong)] bg-[linear-gradient(135deg,rgba(122,228,168,0.24),rgba(61,189,116,0.18))] text-[var(--color-text-primary)] shadow-[var(--shadow-accent)]'
                  : 'text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                {league.country}
              </span>
              <span className="mt-1 block text-sm font-semibold sm:text-[15px]">
                {league.label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
