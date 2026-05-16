import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'

import type { GalaxyProgress, NodeProgress } from './types'
import { getNode } from './data'

const STORAGE_KEY = 'football-galaxy-map-progress'

function loadProgress(): GalaxyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GalaxyProgress
  } catch {
    // ignore parse errors
  }
  return { totalXp: 0, nodes: {}, regionMilestones: {}, seenLore: [] }
}

function saveProgress(progress: GalaxyProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore storage errors
  }
}

type Action =
  | { type: 'UPGRADE_NODE'; nodeId: string }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'MARK_LORE_SEEN'; loreId: string }
  | { type: 'RESET' }

function reducer(state: GalaxyProgress, action: Action): GalaxyProgress {
  switch (action.type) {
    case 'UPGRADE_NODE': {
      const found = getNode(action.nodeId)
      if (!found) return state

      const { region, node } = found
      const current: NodeProgress = state.nodes[node.id] ?? { level: 0 }
      const targetLevel = current.level + 1

      if (targetLevel > node.maxLevel) return state

      const cost = node.levelCosts[targetLevel - 1] ?? 0
      if (state.totalXp < cost) return state

      // collect rewards
      const rewardsForLevel = node.levelRewards[targetLevel - 1] ?? []
      const xpGain = rewardsForLevel
        .filter((r) => r.type === 'xp')
        .reduce((sum, r) => sum + (r.amount ?? 0), 0)

      const newNodeProgress: NodeProgress = {
        level: targetLevel,
        lastUpgraded: new Date().toISOString(),
      }

      const updatedNodes = { ...state.nodes, [node.id]: newNodeProgress }

      // check milestones for this region
      const regionNodes = region.nodes
      let highestMilestone = state.regionMilestones[region.id] ?? -1

      for (let mi = highestMilestone + 1; mi < region.milestones.length; mi++) {
        const milestone = region.milestones[mi]!
        const qualifyingNodes = regionNodes.filter((n) => {
          const progress = updatedNodes[n.id] ?? { level: 0 }
          return progress.level >= milestone.minLevel
        })
        if (qualifyingNodes.length >= milestone.nodesAtMinLevel) {
          highestMilestone = mi
        } else {
          break
        }
      }

      const next: GalaxyProgress = {
        ...state,
        totalXp: state.totalXp - cost + xpGain,
        nodes: updatedNodes,
        regionMilestones: { ...state.regionMilestones, [region.id]: highestMilestone },
      }
      saveProgress(next)
      return next
    }

    case 'ADD_XP': {
      const next: GalaxyProgress = { ...state, totalXp: state.totalXp + action.amount }
      saveProgress(next)
      return next
    }

    case 'MARK_LORE_SEEN': {
      if (state.seenLore.includes(action.loreId)) return state
      const next: GalaxyProgress = { ...state, seenLore: [...state.seenLore, action.loreId] }
      saveProgress(next)
      return next
    }

    case 'RESET': {
      const next: GalaxyProgress = { totalXp: 0, nodes: {}, regionMilestones: {}, seenLore: [] }
      saveProgress(next)
      return next
    }
  }
}

export type GalaxyContextValue = {
  progress: GalaxyProgress
  /** Upgrade a node to next level — deducts XP cost, adds rewards */
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

const GalaxyContext = createContext<GalaxyContextValue | null>(null)

export function GalaxyProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, undefined, loadProgress)

  const upgradeNode = useCallback((nodeId: string) => {
    dispatch({ type: 'UPGRADE_NODE', nodeId })
  }, [])

  const addXp = useCallback((amount: number) => {
    dispatch({ type: 'ADD_XP', amount })
  }, [])

  const markLoreSeen = useCallback((loreId: string) => {
    dispatch({ type: 'MARK_LORE_SEEN', loreId })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const nodeLevel = useCallback(
    (nodeId: string) => progress.nodes[nodeId]?.level ?? 0,
    [progress],
  )

  const canUpgrade = useCallback(
    (nodeId: string) => {
      const found = getNode(nodeId)
      if (!found) return false
      const { node } = found
      const level = progress.nodes[nodeId]?.level ?? 0
      if (level >= node.maxLevel) return false
      const cost = node.levelCosts[level] ?? Infinity
      return progress.totalXp >= cost
    },
    [progress],
  )

  const regionMilestoneIndex = useCallback(
    (regionId: string) => progress.regionMilestones[regionId] ?? -1,
    [progress],
  )

  const value = useMemo(
    (): GalaxyContextValue => ({
      progress,
      upgradeNode,
      addXp,
      markLoreSeen,
      reset,
      nodeLevel,
      canUpgrade,
      regionMilestoneIndex,
    }),
    [progress, upgradeNode, addXp, markLoreSeen, reset, nodeLevel, canUpgrade, regionMilestoneIndex],
  )

  return <GalaxyContext.Provider value={value}>{children}</GalaxyContext.Provider>
}

export function useGalaxy() {
  const ctx = useContext(GalaxyContext)
  if (!ctx) throw new Error('useGalaxy must be used inside GalaxyProvider')
  return ctx
}

/** Derive XP progress toward next level threshold */
export function xpLevelThresholds(): number[] {
  return [0, 500, 1500, 3500, 7500, 15000]
}

export function playerLevel(totalXp: number): { level: number; current: number; next: number; pct: number } {
  const thresholds = xpLevelThresholds()
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= (thresholds[i] ?? 0)) {
      const current = thresholds[i] ?? 0
      const next = thresholds[i + 1] ?? current
      const range = next - current
      const pct = range > 0 ? Math.min(100, Math.round(((totalXp - current) / range) * 100)) : 100
      return { level: i + 1, current, next, pct }
    }
  }
  return { level: 1, current: 0, next: 500, pct: 0 }
}
