import type { StandingRow as StandingRowModel } from '../../services'

type StandingsRowProps = {
  row: StandingRowModel
}

export function StandingsRow({ row }: StandingsRowProps) {
  const isTopFour = row.position <= 4
  const isRelegation = row.position >= 18

  const positionClasses = isTopFour
    ? 'border-[var(--league-accent-strong)] bg-[var(--league-accent-soft)] text-[var(--league-accent)]'
    : isRelegation
      ? 'border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.12)] text-[var(--color-danger)]'
      : 'border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)]'

  return (
    <tr
      className={[
        'border-t border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] transition-[background-color,transform] duration-200 odd:bg-[rgba(255,255,255,0.018)] hover:bg-[rgba(255,255,255,0.035)]',
        isTopFour
          ? 'bg-[linear-gradient(90deg,var(--league-accent-soft),transparent_18%)]'
          : '',
        isRelegation
          ? 'bg-[linear-gradient(90deg,rgba(255,107,107,0.1),transparent_18%)]'
          : '',
      ].join(' ')}
    >
      <td className="px-5 py-4">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${positionClasses}`}
        >
          {row.position}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.06)] text-xs font-semibold text-[var(--color-text-primary)]">
            {row.team.tla}
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
      </td>
      <td className="px-4 py-4 text-center tabular-nums">{row.played}</td>
      <td className="px-4 py-4 text-center tabular-nums">{row.won}</td>
      <td className="px-4 py-4 text-center tabular-nums">{row.draw}</td>
      <td className="px-4 py-4 text-center tabular-nums">{row.lost}</td>
      <td className="px-4 py-4 text-center tabular-nums">{row.goalsFor}</td>
      <td className="px-4 py-4 text-center tabular-nums">{row.goalsAgainst}</td>
      <td
        className={[
          'px-4 py-4 text-center font-medium tabular-nums',
          isTopFour ? 'text-[var(--league-accent)]' : '',
          isRelegation ? 'text-[var(--color-danger)]' : '',
        ].join(' ')}
      >
        {row.goalDifference > 0 ? '+' : ''}
        {row.goalDifference}
      </td>
      <td className="px-5 py-4 text-center font-semibold text-[var(--color-text-primary)] tabular-nums">
        {row.points}
      </td>
    </tr>
  )
}
