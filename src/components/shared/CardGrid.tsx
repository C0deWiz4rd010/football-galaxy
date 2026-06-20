import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ColRamp = 1 | 2 | 3 | 4 | 5 | 6

interface CardGridProps {
  /** Columns at the base (mobile) breakpoint. */
  base?: ColRamp
  /** Columns from `sm` up. */
  sm?: ColRamp
  /** Columns from `md` up. */
  md?: ColRamp
  /** Columns from `lg` up. */
  lg?: ColRamp
  /** Columns from `xl` up. */
  xl?: ColRamp
  /** Force equal-height rows so cards in a row line up. Default true. */
  equalRows?: boolean
  className?: string
  children?: ReactNode
}

const BASE: Record<ColRamp, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}
const SM: Record<ColRamp, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
}
const MD: Record<ColRamp, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
}
const LG: Record<ColRamp, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}
const XL: Record<ColRamp, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
}

/**
 * Mobile-first responsive grid with standardised gaps and equal-height rows so
 * cards align on one plane. Provide a column ramp per breakpoint.
 */
export function CardGrid({
  base = 1,
  sm,
  md,
  lg,
  xl,
  equalRows = true,
  className,
  children,
}: CardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-fg-3 md:gap-fg-4',
        BASE[base],
        sm && SM[sm],
        md && MD[md],
        lg && LG[lg],
        xl && XL[xl],
        equalRows && 'auto-rows-fr',
        className,
      )}
    >
      {children}
    </div>
  )
}
