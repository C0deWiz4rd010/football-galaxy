import { cn } from '@/lib/utils'
import { getFormScore, type FormLabel } from '@/lib/player-ratings'
import type { Player } from '@/services/types'

const toneByLabel: Record<FormLabel, string> = {
  'Top Form':
    'border-success/30 bg-success/15 text-success-fg',
  'In Form':
    'border-info/30 bg-info/15 text-info-fg',
  Steady:
    'border-warning/30 bg-warning/15 text-warning-fg',
  Cold:
    'border-danger/30 bg-danger/15 text-danger-fg',
}

interface FormBadgeProps {
  player: Player
  variant?: 'full' | 'score' | 'label'
  className?: string
}

/**
 * Compact visualization of a player's real-stats form score.
 * Replaces the previous EA-FC-style overall rating card.
 */
export function FormBadge({ player, variant = 'full', className }: FormBadgeProps) {
  const { score, label } = getFormScore(player)
  const tone = toneByLabel[label]

  if (variant === 'score') {
    return (
      <span
        className={cn(
          'inline-flex min-w-[2.25rem] items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-semibold tabular-nums',
          tone,
          className,
        )}
        aria-label={`Form score ${score}`}
      >
        {score}
      </span>
    )
  }

  if (variant === 'label') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-wide',
          tone,
          className,
        )}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium',
        tone,
        className,
      )}
      title={`Form ${score} · ${label}`}
    >
      <span className="font-semibold tabular-nums">{score}</span>
      <span className="opacity-80">{label}</span>
    </span>
  )
}
