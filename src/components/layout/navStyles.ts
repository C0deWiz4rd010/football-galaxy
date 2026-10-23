import type { NavItem } from '@/app/navigation'
import { cn } from '@/lib/utils'

const activeTone = {
  default: 'border-border/60 bg-primary/10 text-foreground',
  live: 'border-live/40 bg-live/12 text-live',
  gold: 'border-warning/40 bg-warning/12 text-warning-fg',
} as const

export const iconTone = {
  default: 'text-muted-foreground',
  live: 'text-live',
  gold: 'text-warning-fg',
} as const

/** Shared row style for sidebar and mobile-menu links. */
export function navLinkClass(tone: NavItem['tone'], isActive: boolean, className?: string) {
  return cn(
    'flex min-h-10 items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm transition-colors duration-fg-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    isActive ? cn(activeTone[tone ?? 'default'], 'font-medium') : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
    className,
  )
}
