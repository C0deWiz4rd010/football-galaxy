import type { StandingRow as StandingRowModel } from '../../services'

type StandingsRowProps = {
  row: StandingRowModel
}

export function StandingsRow({ row }: StandingsRowProps) {
  return (
    <tr className="border-t border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)]">
      <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
        {row.position}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white/70 text-xs font-semibold text-[var(--color-text-primary)]">
            {row.team.tla}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--color-text-primary)]">
              {row.team.shortName}
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              {row.team.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">{row.played}</td>
      <td className="px-4 py-3 text-center">{row.won}</td>
      <td className="px-4 py-3 text-center">{row.draw}</td>
      <td className="px-4 py-3 text-center">{row.lost}</td>
      <td className="px-4 py-3 text-center">{row.goalsFor}</td>
      <td className="px-4 py-3 text-center">{row.goalsAgainst}</td>
      <td className="px-4 py-3 text-center">{row.goalDifference}</td>
      <td className="px-4 py-3 text-center font-semibold text-[var(--color-text-primary)]">
        {row.points}
      </td>
    </tr>
  )
}
