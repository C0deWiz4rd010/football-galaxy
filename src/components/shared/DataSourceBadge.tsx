import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Unified data-freshness vocabulary shared by every area of the app (leagues,
 * players and the World Cup). Keeping one component means the live / official /
 * snapshot / offline states always look and read the same wherever they appear.
 */
export type DataFreshness = 'live' | 'official' | 'snapshot' | 'offline'

const FRESHNESS_STYLES: Record<
  DataFreshness,
  { dot: string; pill: string; pulse: boolean; defaultLabel: string }
> = {
  live: {
    dot: 'bg-emerald-300',
    pill: 'border-emerald-400/50 bg-emerald-400/12 text-emerald-100',
    pulse: true,
    defaultLabel: 'Live',
  },
  official: {
    dot: 'bg-sky-300',
    pill: 'border-sky-400/40 bg-sky-400/10 text-sky-100',
    pulse: false,
    defaultLabel: 'Official',
  },
  snapshot: {
    dot: 'bg-amber-300',
    pill: 'border-amber-400/40 bg-amber-400/10 text-amber-100',
    pulse: false,
    defaultLabel: 'Snapshot',
  },
  offline: {
    dot: 'bg-zinc-400',
    pill: 'border-zinc-400/30 bg-zinc-400/10 text-zinc-200',
    pulse: false,
    defaultLabel: 'Offline',
  },
}

export function DataSourceBadge({
  freshness,
  label,
  className,
  icon,
}: {
  freshness: DataFreshness
  label?: ReactNode
  className?: string
  icon?: ReactNode
}) {
  const style = FRESHNESS_STYLES[freshness]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-tight',
        style.pill,
        className,
      )}
    >
      <span className="relative flex size-1.5">
        {style.pulse ? (
          <span
            className={cn(
              'absolute inline-flex size-full animate-ping rounded-full opacity-75',
              style.dot,
            )}
          />
        ) : null}
        <span className={cn('relative inline-flex size-1.5 rounded-full', style.dot)} />
      </span>
      {icon}
      {label ?? style.defaultLabel}
    </span>
  )
}
