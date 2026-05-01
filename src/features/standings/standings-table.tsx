import type { LeagueStandings } from '../../services'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'
import { TeamEmblem } from '../../shared/ui/team-emblem'
import { StandingsRow } from './standings-row'

type StandingsTableProps = {
  standings: LeagueStandings
  language: LanguageCode
}

export function StandingsTable({ standings, language }: StandingsTableProps) {
  const copy = getDashboardCopy(language)

  return (
    <section className="dashboard-panel overflow-hidden rounded-[30px]">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border-subtle)] px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-text-muted)]">
            {standings.leagueLabel}
          </p>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-3xl">
            {copy.currentStandings}
          </h2>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)]">
          <div className="dashboard-pill inline-flex items-center gap-2 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent-warm)]" />
            <p>
              {copy.matchdayLabel}{' '}
              <span className="font-semibold text-[var(--color-text-primary)]">
                {standings.season.currentMatchday ?? 'TBD'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <ol className="space-y-3 p-4">
          {standings.standings.map((row) => (
            <li
              key={row.team.id}
              className={[
                'dashboard-surface rounded-[26px] p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(3,8,15,0.28)]',
                row.position <= 4
                  ? 'border-[var(--league-accent-strong)] bg-[linear-gradient(135deg,var(--league-accent-soft),rgba(255,255,255,0.03))]'
                  : row.position >= 18
                    ? 'border-[rgba(255,107,107,0.24)]'
                    : '',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                      row.position <= 4
                        ? 'border-[var(--league-accent-strong)] bg-[var(--league-accent-soft)] text-[var(--league-accent)]'
                        : row.position >= 18
                          ? 'border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.12)] text-[var(--color-danger)]'
                          : 'border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.06)] text-[var(--color-text-primary)]',
                    ].join(' ')}
                  >
                    {row.position}
                  </span>
                  <TeamEmblem
                    crestUrl={row.team.crestUrl}
                    fallback={row.team.tla}
                    teamName={row.team.name}
                    className="h-10 w-10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[var(--color-text-primary)]">
                      {row.team.shortName}
                    </p>
                    <p className="truncate text-[13px] text-[var(--color-text-muted)]">
                      {row.team.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-full bg-[linear-gradient(135deg,var(--league-accent),var(--league-accent-strong))] px-3 py-1.5 text-sm font-semibold text-[#071119] shadow-[0_14px_28px_var(--league-accent-glow)]">
                  {row.points} {copy.pointsShort}
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm text-[var(--color-text-secondary)]">
                <div className="rounded-[20px] bg-[rgba(255,255,255,0.05)] px-3 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    {copy.played}
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)] tabular-nums">
                    {row.played}
                  </dd>
                </div>
                <div className="rounded-[20px] bg-[rgba(255,255,255,0.05)] px-3 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    {copy.record}
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)] tabular-nums">
                    {row.won}-{row.draw}-{row.lost}
                  </dd>
                </div>
                <div className="rounded-[20px] bg-[rgba(255,255,255,0.05)] px-3 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    {copy.goalDiff}
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--color-text-primary)] tabular-nums">
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
            <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              <th className="px-5 py-4 font-semibold">Pos</th>
              <th className="px-5 py-4 font-semibold">Club</th>
              <th className="px-4 py-4 text-center font-semibold">{copy.playedShort}</th>
              <th className="px-4 py-4 text-center font-semibold">W</th>
              <th className="px-4 py-4 text-center font-semibold">D</th>
              <th className="px-4 py-4 text-center font-semibold">L</th>
              <th className="px-4 py-4 text-center font-semibold">GF</th>
              <th className="px-4 py-4 text-center font-semibold">GA</th>
              <th className="px-4 py-4 text-center font-semibold">{copy.goalDifferenceShort}</th>
              <th className="px-5 py-4 text-center font-semibold">{copy.pointsShort}</th>
            </tr>
          </thead>
          <tbody>
            {standings.standings.map((row) => (
              <StandingsRow key={row.team.id} row={row} />
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border-subtle)] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--league-accent)]" />
            {copy.top4Legend}: {copy.championsLeagueLegend}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />
            {copy.relegationLegend}
          </span>
        </div>
      </div>
    </section>
  )
}
