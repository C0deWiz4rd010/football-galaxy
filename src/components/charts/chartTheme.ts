/**
 * Shared Recharts styling. Every colour is a CSS custom property, so charts
 * follow the active palette and light/dark mode without re-rendering.
 */
import type { CSSProperties } from 'react'

export const chartColors = {
  primary: 'hsl(var(--primary))',
  /** Second series next to `primary`; distinct hue in every palette. */
  secondary: 'hsl(var(--info))',
  positive: 'hsl(var(--success))',
  negative: 'hsl(var(--destructive))',
  warning: 'hsl(var(--warning))',
  live: 'hsl(var(--live))',
  muted: 'hsl(var(--muted-foreground))',
  foreground: 'hsl(var(--foreground))',
  grid: 'hsl(var(--border))',
  surface: 'hsl(var(--card))',
} as const

/** Categorical order for pies and multi-series charts. */
export const chartPalette = [chartColors.primary, chartColors.secondary, chartColors.warning, chartColors.positive, chartColors.muted]

export const axisTick = { fill: chartColors.muted, fontSize: 12 } as const

export const legendStyle: CSSProperties = { fontSize: 12, color: chartColors.muted }

const tooltipContentStyle: CSSProperties = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  boxShadow: 'var(--fg-elevation-3)',
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
  padding: '8px 10px',
}

/** Spread onto `<Tooltip>`. */
export const tooltipProps = {
  contentStyle: tooltipContentStyle,
  labelStyle: { color: 'hsl(var(--popover-foreground))', fontWeight: 600, marginBottom: 2 },
  itemStyle: { padding: 0 },
  cursor: { fill: 'hsl(var(--muted) / 0.5)' },
} as const
