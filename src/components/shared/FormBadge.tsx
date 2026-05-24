import { cn } from '@/lib/utils'
import { getFormScore, type FormLabel } from '@/lib/player-ratings'
import type { Player } from '@/services/types'

const toneByLabel: Record<FormLabel, string> = {
  'Top Form':
    'border-emerald-400/30 bg-emerald-500/15 text-emerald-200 dark:text-emerald-200',
  'In Form':
    'border-sky-400/30 bg-sky-500/15 text-sky-200 dark:text-sky-200',
  Steady:
    'border-amber-400/30 bg-amber-500/15 text-amber-200 dark:text-amber-200',
  Cold:
    'border-rose-400/30 bg-rose-500/15 text-rose-200 dark:text-rose-200',
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
          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
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
