import type { LeagueId } from '@/services/types'

export type NodeType = 'team' | 'legend' | 'rivalry' | 'trophy' | 'challenge'

export interface NodeReward {
  type: 'xp' | 'badge' | 'lore'
  amount?: number
  label: string
}

export interface GalaxyNode {
  id: string
  regionId: LeagueId
  title: string
  description: string
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
  title: string
  description: string
  /** Passive bonus label e.g. "+15% XP in this region" */
  bonusLabel: string
  /** Lore text unlocked at this milestone */
  lore?: string
}

export interface Region {
  id: LeagueId
  name: string
  country: string
  color: string
  /** Shown when the player first opens the region */
  entryLore: string
  /** Shown when all nodes are at max level */
  completionLore: string
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
