import type { LeagueStandings } from '../../services'
import { StandingsRow } from './standings-row'

type StandingsTableProps = {
  standings: LeagueStandings
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <section className="rounded-[24px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-panel)] shadow-[var(--shadow-panel)]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border-subtle)] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {standings.leagueLabel}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Current standings
          </h2>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          <p>
            Matchday{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {standings.season.currentMatchday ?? 'TBD'}
            </span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <th className="px-4 py-3 font-semibold">Pos</th>
              <th className="px-4 py-3 font-semibold">Club</th>
              <th className="px-4 py-3 text-center font-semibold">P</th>
              <th className="px-4 py-3 text-center font-semibold">W</th>
              <th className="px-4 py-3 text-center font-semibold">D</th>
              <th className="px-4 py-3 text-center font-semibold">L</th>
              <th className="px-4 py-3 text-center font-semibold">GF</th>
              <th className="px-4 py-3 text-center font-semibold">GA</th>
              <th className="px-4 py-3 text-center font-semibold">GD</th>
              <th className="px-4 py-3 text-center font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.standings.map((row) => (
              <StandingsRow key={row.team.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
