import type { Player, PlayerStats } from '@/services/types'

export interface PlayerCardProfile {
  overall: number
  attributes: PlayerStats['attributes']
  archetype: string
  tier: 'Base' | 'In Form' | 'Playmaker' | 'Defensive Wall' | 'Future Star'
}

const positionWeights = {
  GK: {
    pace: 0.05,
    shooting: 0.02,
    passing: 0.16,
    dribbling: 0.07,
    defending: 0.35,
    physical: 0.35,
  },
  DF: {
    pace: 0.15,
    shooting: 0.05,
    passing: 0.15,
    dribbling: 0.1,
    defending: 0.3,
    physical: 0.25,
  },
  MF: {
    pace: 0.14,
    shooting: 0.12,
    passing: 0.26,
    dribbling: 0.2,
    defending: 0.12,
    physical: 0.16,
  },
  FW: {
    pace: 0.2,
    shooting: 0.3,
    passing: 0.12,
    dribbling: 0.22,
    defending: 0.04,
    physical: 0.12,
  },
} as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getArchetype(player: Player) {
  const attrs = player.stats.attributes

  if (player.position === 'FW') {
    return attrs.shooting >= attrs.dribbling ? 'Box Striker' : 'Wide Threat'
  }

  if (player.position === 'MF') {
    return attrs.passing >= attrs.dribbling ? 'Tempo Conductor' : 'Carrier'
  }

  if (player.position === 'DF') {
    return attrs.physical >= attrs.defending ? 'Enforcer' : 'Reader'
  }

  return 'Last Line'
}

function getTier(player: Player) {
  const contributions = player.stats.goals + player.stats.assists

  if (player.age <= 21 && contributions >= 8) {
    return 'Future Star'
  }

  if (player.stats.assists >= player.stats.goals + 4) {
    return 'Playmaker'
  }

  if (player.position === 'DF' && player.stats.goals <= 4 && player.stats.yellowCards <= 4) {
    return 'Defensive Wall'
  }

  if (player.stats.goals + player.stats.assists >= 14) {
    return 'In Form'
  }

  return 'Base'
}

export function getPlayerCardProfile(player: Player): PlayerCardProfile {
  const attrs = player.stats.attributes
  const weights = positionWeights[player.position]
  const weightedBase =
    attrs.pace * weights.pace +
    attrs.shooting * weights.shooting +
    attrs.passing * weights.passing +
    attrs.dribbling * weights.dribbling +
    attrs.defending * weights.defending +
    attrs.physical * weights.physical

  const contributionBonus = clamp(
    player.stats.goals * 0.55 +
      player.stats.assists * 0.45 +
      player.stats.appearances * 0.15,
    0,
    12,
  )
  const minutesBonus = clamp(player.stats.minutes / 450, 0, 6)
  const disciplinePenalty = player.stats.redCards * 1.2 + player.stats.yellowCards * 0.18

  const overall = Math.round(
    clamp(weightedBase * 0.88 + contributionBonus + minutesBonus - disciplinePenalty, 58, 96),
  )

  return {
    overall,
    attributes: attrs,
    archetype: getArchetype(player),
    tier: getTier(player),
  }
}
