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

      <div className="md:hidden">
        <ol className="divide-y divide-[var(--color-border-subtle)]">
          {standings.standings.map((row) => (
            <li key={row.team.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white/70 text-xs font-semibold text-[var(--color-text-primary)]">
                    {row.position}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">
                      {row.team.shortName}
                    </p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">
                      {row.team.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm font-semibold text-white">
                  {row.points} pts
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm text-[var(--color-text-secondary)]">
                <div className="rounded-2xl bg-white/60 px-3 py-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Played
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)]">
                    {row.played}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/60 px-3 py-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Record
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)]">
                    {row.won}-{row.draw}-{row.lost}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/60 px-3 py-2">
                  <dt className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Goal diff
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)]">
                    {row.goalDifference > 0 ? '+' : ''}
                    {row.goalDifference}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>

      <div className="hidden overflow-x-auto md:block">
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
