import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface StatCardProps {
  eyebrow?: ReactNode
  value: ReactNode
  caption?: ReactNode
  icon?: ReactNode
  /** Optional accent colour for the value (e.g. a league/status colour). */
  accent?: string
  className?: string
}

/**
 * Canonical stat tile. `flex flex-col h-full` with the value pinned to the
 * bottom via `mt-auto` so values line up across cards of varying label length
 * when placed in a CardGrid.
 */
export function StatCard({
  eyebrow,
  value,
  caption,
  icon,
  accent,
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card flex h-full flex-col gap-fg-2', className)}>
      <div className="flex items-start justify-between gap-2">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : (
          <span />
        )}
        {icon ? <span className="shrink-0 text-muted-foreground">{icon}</span> : null}
      </div>
      <p
        className="mt-auto text-xl font-semibold tabular-nums tracking-tight sm:text-2xl"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
    </div>
  )
}
