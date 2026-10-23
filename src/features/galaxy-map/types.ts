import type { LeagueId } from '@/services/types'

export type NodeType = 'team' | 'legend' | 'rivalry' | 'trophy' | 'challenge'

export type LocalizedText = { de: string; en: string }

export type NodeReward =
  | { type: 'xp'; amount: number }
  | { type: 'badge' | 'lore'; label: LocalizedText }

export interface GalaxyNode {
  id: string
  regionId: LeagueId
  title: LocalizedText
  description: LocalizedText
  type: NodeType
  maxLevel: number
  /** XP cost to go from level N-1 → N (array index = target level, so index 0 = cost for level 1) */
  levelCosts: number[]
  /** Rewards for reaching each level (array index = level reached) */
  levelRewards: NodeReward[][]
  /** Grid position within the region for the visual map */
  position: { col: number; row: number }
}

export interface RegionMilestone {
  /** Number of nodes that must be at level >= minLevel to trigger */
  nodesAtMinLevel: number
  minLevel: number
  title: LocalizedText
  description: LocalizedText
  /** Passive bonus label e.g. { de: '+15 % XP in dieser Region', en: '+15% XP in this region' } */
  bonusLabel: LocalizedText
  /** Lore text unlocked at this milestone */
  lore?: LocalizedText
}

export interface Region {
  id: LeagueId
  name: string
  country: LocalizedText
  color: string
  /** Shown when the player first opens the region */
  entryLore: LocalizedText
  /** Shown when all nodes are at max level */
  completionLore: LocalizedText
  milestones: RegionMilestone[]
  nodes: GalaxyNode[]
}

export interface NodeProgress {
  level: number
  /** ISO date of last level-up */
  lastUpgraded?: string
}

export interface GalaxyProgress {
  totalXp: number
  /** nodeId -> progress */
  nodes: Record<string, NodeProgress>
  /** regionId -> milestone index (highest reached) */
  regionMilestones: Record<string, number>
  /** Array of lore entry ids that have been seen */
  seenLore: string[]
}
