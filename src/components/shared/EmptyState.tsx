import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Empty result block. `headingAs` keeps the outline valid: h2 when the state
 * replaces a page section, h3 (default) inside a card that has its own h2.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  className,
  headingAs: Heading = 'h3',
}: {
  title: string
  description: string
  icon?: LucideIcon
  className?: string
  headingAs?: 'h2' | 'h3' | 'p'
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center',
        className,
      )}
    >
      <div aria-hidden className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <Heading className="text-base font-semibold tracking-tight">{title}</Heading>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
