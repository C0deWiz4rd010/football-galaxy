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

function deriveTraits(player: Player): string[] {
  const traits: string[] = []
  const { goals, assists, appearances, minutes, yellowCards, redCards } = player.stats
  const apps = Math.max(1, appearances)

  if (goals / apps >= 0.6) traits.push('Clinical Finisher')
  else if (goals >= 8) traits.push('Goal Threat')

  if (assists / apps >= 0.4) traits.push('Chance Creator')
  else if (assists >= 6) traits.push('Provider')

  if (minutes / apps >= 80) traits.push('Workhorse')
  if (player.age !== undefined && player.age <= 21 && goals + assists >= 6) traits.push('Rising Star')
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

/** How much attacking output counts per position; the rest is availability. */
const OUTPUT_WEIGHT: Record<Player['position'], number> = { FW: 0.6, MF: 0.55, DF: 0.3, GK: 0.1 }

/**
 * "Form Score" (0–99) from real season statistics:
 * - output: goals + 0.7 × assists per 90 minutes (≈1.2 per 90 is elite),
 * - availability: share of each appearance actually on the pitch,
 * - experience: appearances so far (saturates after 10),
 * minus a discipline penalty. Output weighs less for defenders and keepers,
 * whose contribution these stats cannot capture.
 */
export function getFormScore(player: Player): FormScore {
  const { goals, assists, appearances, minutes, yellowCards, redCards } = player.stats
  const apps = Math.max(1, appearances)
  const nineties = Math.max(1, minutes / 90)

  const output = clamp(((goals + assists * 0.7) / nineties) * 80, 0, 100)
  const availability = appearances > 0 ? clamp((minutes / apps / 90) * 100, 0, 100) : 0
  const experience = clamp((appearances / 10) * 100, 0, 100)
  const discipline = clamp(yellowCards * 1.5 + redCards * 6, 0, 20)

  const outputWeight = OUTPUT_WEIGHT[player.position]
  const raw = output * outputWeight + availability * (0.85 - outputWeight) + experience * 0.15 - discipline
  const score = Math.round(clamp(raw, 0, 99))

  return {
    score,
    label: labelFor(score),
    traits: deriveTraits(player),
  }
}
