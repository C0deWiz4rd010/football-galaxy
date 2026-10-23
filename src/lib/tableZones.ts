import type { LeagueId } from '@/services/types'

/**
 * Table zones that follow from the league rules alone (2026/27):
 * - `ucl`: league phase of the Champions League,
 * - `ucl-q`: Champions League qualifying (Ligue 1's 4th place),
 * - `playoff`: relegation play-off (Bundesliga, Ligue 1: 16th),
 * - `rel`: direct relegation.
 * Europa/Conference League places depend on the domestic cup winners and the
 * extra UEFA performance spots on the final coefficients, so they are not
 * marked.
 */
export type Zone = 'ucl' | 'ucl-q' | 'playoff' | 'rel'

interface ZoneRules {
  ucl: number
  uclQualifier: boolean
  relegationPlayoff: boolean
  relegated: number
}

const RULES: Record<LeagueId, ZoneRules> = {
  'premier-league': { ucl: 4, uclQualifier: false, relegationPlayoff: false, relegated: 3 },
  'la-liga': { ucl: 4, uclQualifier: false, relegationPlayoff: false, relegated: 3 },
  'serie-a': { ucl: 4, uclQualifier: false, relegationPlayoff: false, relegated: 3 },
  bundesliga: { ucl: 4, uclQualifier: false, relegationPlayoff: true, relegated: 2 },
  'ligue-1': { ucl: 3, uclQualifier: true, relegationPlayoff: true, relegated: 2 },
}

export function zoneOf(leagueId: LeagueId, position: number, total: number): Zone | undefined {
  const rules = RULES[leagueId]
  if (position <= rules.ucl) return 'ucl'
  if (rules.uclQualifier && position === rules.ucl + 1) return 'ucl-q'
  if (position > total - rules.relegated) return 'rel'
  if (rules.relegationPlayoff && position === total - rules.relegated) return 'playoff'
  return undefined
}

/** Zones that occur in a league, for its legend. */
export function zonesIn(leagueId: LeagueId): Zone[] {
  const rules = RULES[leagueId]
  return [
    'ucl',
    ...(rules.uclQualifier ? (['ucl-q'] as const) : []),
    ...(rules.relegationPlayoff ? (['playoff'] as const) : []),
    'rel',
  ]
}
