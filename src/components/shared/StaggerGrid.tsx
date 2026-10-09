/**
 * `StaggerGrid` reveals its children with a short cascade on mount. Pure CSS
 * (`.fg-stagger` in index.css): no animation library in the critical path,
 * and the global reduced-motion rule turns it off.
 *
 * Wrap the parent in `<StaggerGrid>` and each animated child in
 * `<StaggerGridItem>`; `as` keeps the rendered element semantic.
 */

import type { ElementType, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

type StaggerProps = {
  as?: 'div' | 'section' | 'article' | 'ul' | 'li'
  children: ReactNode
} & HTMLAttributes<HTMLElement>

export function StaggerGrid({ as, children, className, ...rest }: StaggerProps) {
  const Component: ElementType = as ?? 'div'
  return (
    <Component className={cn('fg-stagger', className)} {...rest}>
      {children}
    </Component>
  )
}

export function StaggerGridItem({ as, children, ...rest }: StaggerProps) {
  const Component: ElementType = as ?? 'div'
  return <Component {...rest}>{children}</Component>
}
