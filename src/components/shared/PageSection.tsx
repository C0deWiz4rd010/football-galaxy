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
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
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
