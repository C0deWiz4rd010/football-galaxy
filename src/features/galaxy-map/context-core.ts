import { createContext, useContext } from 'react'

import type { GalaxyProgress } from './types'

export type GalaxyContextValue = {
  progress: GalaxyProgress
  /** Upgrade a node to next level - deducts XP cost, adds rewards */
  upgradeNode: (nodeId: string) => void
  /** Add XP to the pool (e.g. from a match event or challenge) */
  addXp: (amount: number) => void
  markLoreSeen: (loreId: string) => void
  reset: () => void
  /** Derived: level of a specific node */
  nodeLevel: (nodeId: string) => number
  /** Derived: can the player afford to upgrade this node? */
  canUpgrade: (nodeId: string) => boolean
  /** Derived: highest milestone index reached for a region (-1 = none) */
  regionMilestoneIndex: (regionId: string) => number
}

export const GalaxyContext = createContext<GalaxyContextValue | null>(null)

export function useGalaxy() {
  const ctx = useContext(GalaxyContext)
  if (!ctx) throw new Error('useGalaxy must be used inside GalaxyProvider')
  return ctx
}
