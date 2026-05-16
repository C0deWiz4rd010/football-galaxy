import type { Player } from '@/services/types'

export type FormLabel = 'Top Form' | 'In Form' | 'Steady' | 'Cold'

export interface FormScore {
  /** 0–99 score derived from real season stats with recent-form weighting. */
  score: number
  label: FormLabel
  /** Short descriptors derived from the player's stat profile. */
  traits: string[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function averageTrend(trend: number[] | undefined) {
  if (!trend || trend.length === 0) {
    return null
  }
  const sum = trend.reduce((total, value) => total + value, 0)
  return sum / trend.length
}

function deriveTraits(player: Player): string[] {
  const traits: string[] = []
  const { goals, assists, appearances, minutes, yellowCards, redCards } = player.stats
  const apps = Math.max(1, appearances)

  if (goals / apps >= 0.6) traits.push('Clinical Finisher')
  else if (goals >= 8) traits.push('Goal Threat')

  if (assists / apps >= 0.4) traits.push('Chance Creator')
  else if (assists >= 6) traits.push('Provider')

  if (minutes / apps >= 80) traits.push('Workhorse')
  if (player.age <= 21 && goals + assists >= 6) traits.push('Rising Star')
  if (player.position === 'DF' && yellowCards + redCards * 2 <= 3) traits.push('Composed Defender')
  if (player.position === 'GK' && appearances >= 10) traits.push('Reliable Keeper')

  return traits.slice(0, 3)
}

function labelFor(score: number): FormLabel {
  if (score >= 80) return 'Top Form'
  if (score >= 65) return 'In Form'
  if (score >= 45) return 'Steady'
  return 'Cold'
}

/**
 * Compute a "Form Score" (0–99) from real season statistics.
 * Weights recent matches (trend) heavier than season totals for freshness.
 */
export function getFormScore(player: Player): FormScore {
  const { goals, assists, appearances, minutes, yellowCards, redCards, trend } = player.stats
  const apps = Math.max(1, appearances)

  const recentForm =
    averageTrend(trend) ??
    clamp(((goals + assists * 0.7) / apps) * 90 + minutes / apps, 0, 100)

  const per90 = (goals + assists * 0.75) / Math.max(1, minutes / 90)
  const seasonImpact = clamp(per90 * 70 + Math.min(apps, 20) * 1.2, 0, 100)

  const availability = clamp((minutes / (38 * 90)) * 100, 0, 100)

  const discipline = clamp(yellowCards * 1.8 + redCards * 6, 0, 25)

  const raw = recentForm * 0.5 + seasonImpact * 0.32 + availability * 0.18 - discipline
  const score = Math.round(clamp(raw, 0, 99))

  return {
    score,
    label: labelFor(score),
    traits: deriveTraits(player),
  }
}
