import * as React from 'react'

import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'outline' | 'soft'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  outline: 'border-border/70 bg-transparent text-foreground',
  soft: 'border-transparent bg-white/10 text-foreground',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  )
}
