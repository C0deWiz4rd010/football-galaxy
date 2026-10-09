import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Compact KPI tile: label on top, big value, optional helper line. Stacked so
 * long labels never collide with the value in narrow grid columns.
 * `onMedia` is for club-colour heroes (white text over a scrim).
 */
export function MetricTile({
  label,
  value,
  helper,
  icon,
  onMedia = false,
  className,
}: {
  label: string
  value: ReactNode
  helper?: string
  icon?: ReactNode
  onMedia?: boolean
  className?: string
}) {
  const subtle = onMedia ? 'text-white/75' : 'text-muted-foreground'
  return (
    <div
      className={cn(
        'min-w-0 rounded-lg p-3',
        onMedia ? 'border border-white/15 bg-black/20 backdrop-blur-sm' : 'surface-soft',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {icon ? <span className="shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5" aria-hidden>{icon}</span> : null}
        <p className={cn('truncate text-2xs uppercase tracking-eyebrow', subtle)}>{label}</p>
      </div>
      <p className="mt-1 font-mono text-2xl font-bold leading-none tabular-nums">{value}</p>
      {helper ? <p className={cn('mt-1 truncate text-xs', subtle)}>{helper}</p> : null}
    </div>
  )
}
