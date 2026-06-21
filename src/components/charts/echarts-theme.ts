/**
 * Reads the live design-token colours from CSS custom properties so ECharts
 * visuals automatically follow the active palette (Galaxy, Midnight, …) and the
 * light/dark mode. All tokens are stored as space-separated HSL triplets
 * (e.g. "152 62% 38%"), which compose into valid `hsl()` colours.
 */
export interface ChartTheme {
  primary: string
  primarySoft: string
  foreground: string
  muted: string
  border: string
  surface: string
  success: string
  warning: string
  info: string
  live: string
}

function readVar(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function hsl(name: string, alpha?: number): string {
  const triplet = readVar(name)
  if (!triplet) return alpha != null ? 'rgba(148,163,184,0.4)' : '#94a3b8'
  return alpha != null ? `hsl(${triplet} / ${alpha})` : `hsl(${triplet})`
}

export function getChartTheme(): ChartTheme {
  return {
    primary: hsl('--primary'),
    primarySoft: hsl('--primary', 0.18),
    foreground: hsl('--foreground'),
    muted: hsl('--muted-foreground'),
    border: hsl('--border', 0.5),
    surface: hsl('--card'),
    success: hsl('--success'),
    warning: hsl('--warning'),
    info: hsl('--info'),
    live: hsl('--live'),
  }
}

/** Shared tooltip styling so every chart matches the panel surfaces. */
export function tooltipStyle(theme: ChartTheme) {
  return {
    backgroundColor: hsl('--popover'),
    borderColor: theme.border,
    borderWidth: 1,
    textStyle: { color: theme.foreground, fontSize: 12 },
    extraCssText: 'border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,0.25);',
  }
}
