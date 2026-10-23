import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useGalaxy } from './context-core'
import { GalaxyProvider } from './context'
import { GALAXY_REGIONS } from './data'
import { playerLevel } from './levels'

const wrapper = ({ children }: { children: ReactNode }) => <GalaxyProvider>{children}</GalaxyProvider>
const region = GALAXY_REGIONS[0]!
const [first, second] = region.nodes

describe('galaxy progress', () => {
  beforeEach(() => localStorage.clear())

  it('only upgrades a node once there is enough XP, and charges its cost', () => {
    const { result } = renderHook(() => useGalaxy(), { wrapper })
    const cost = first!.levelCosts[0]!

    expect(result.current.canUpgrade(first!.id)).toBe(false)
    act(() => result.current.upgradeNode(first!.id))
    expect(result.current.nodeLevel(first!.id)).toBe(0)

    act(() => result.current.addXp(cost))
    expect(result.current.canUpgrade(first!.id)).toBe(true)
    act(() => result.current.upgradeNode(first!.id))

    const xpReward = first!.levelRewards[0]!.reduce((sum, reward) => sum + (reward.type === 'xp' ? reward.amount : 0), 0)
    expect(result.current.nodeLevel(first!.id)).toBe(1)
    expect(result.current.progress.totalXp).toBe(xpReward)
  })

  it('reaches the first region milestone and persists progress', () => {
    const { result, unmount } = renderHook(() => useGalaxy(), { wrapper })
    const milestone = region.milestones[0]!
    act(() => result.current.addXp(10_000))
    for (const node of region.nodes.slice(0, milestone.nodesAtMinLevel)) {
      act(() => result.current.upgradeNode(node.id))
    }
    expect(result.current.regionMilestoneIndex(region.id)).toBe(0)
    unmount()

    const { result: restored } = renderHook(() => useGalaxy(), { wrapper })
    expect(restored.current.nodeLevel(second!.id)).toBe(1)
    expect(restored.current.regionMilestoneIndex(region.id)).toBe(0)

    act(() => restored.current.reset())
    expect(restored.current.progress.totalXp).toBe(0)
    expect(restored.current.nodeLevel(first!.id)).toBe(0)
  })
})

describe('playerLevel', () => {
  it('maps XP onto levels with progress toward the next threshold', () => {
    expect(playerLevel(0)).toEqual({ level: 1, current: 0, next: 500, pct: 0 })
    expect(playerLevel(1000)).toMatchObject({ level: 2, pct: 50 })
    expect(playerLevel(20_000)).toMatchObject({ level: 6, pct: 100 })
  })
})
