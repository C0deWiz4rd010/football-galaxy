import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageSectionProps {
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Right-aligned action (button, badge, link). */
  action?: ReactNode
  className?: string
  /** Heading level of `title`; use `h1` for the page's first section. */
  headingAs?: 'h1' | 'h2'
  /** Spacing between the header and the children. */
  bodyClassName?: string
  children?: ReactNode
}

/**
 * Consistent section wrapper: optional eyebrow + title + action header, then a
 * body with standard vertical rhythm. Use to keep page sections aligned across
 * the app.
 */
export function PageSection({
  eyebrow,
  title,
  description,
  action,
  className,
  headingAs: Heading = 'h2',
  bodyClassName,
  children,
}: PageSectionProps) {
  const hasHeader = Boolean(eyebrow || title || description || action)

  return (
    <section className={cn('space-y-fg-4', className)}>
      {hasHeader ? (
        <div className="flex flex-wrap items-end justify-between gap-fg-3">
          <div className="min-w-0 space-y-1">
            {eyebrow ? (
              <p className="text-2xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <Heading className={cn('font-semibold tracking-tight', Heading === 'h1' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl')}>
                {title}
              </Heading>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children ? <div className={cn('space-y-fg-4', bodyClassName)}>{children}</div> : null}
    </section>
  )
}
