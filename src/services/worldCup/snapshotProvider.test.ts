import { afterEach, describe, expect, it } from 'vitest'

import { setSourcePreference } from '@/services/config/dataSource'

import { snapshotWorldCupProvider } from './snapshotProvider'
import { getWorldCupDashboard, getWorldCupGroups, getWorldCupTeams } from './worldCup'

describe('World Cup offline snapshot fallback', () => {
  afterEach(() => {
    setSourcePreference('live')
  })

  it('builds a non-empty, honestly-labelled structural dashboard', async () => {
    const dashboard = await snapshotWorldCupProvider.getDashboard()

    // 12 groups of four = the full 2026 field structure.
    expect(dashboard.groups).toHaveLength(48)
    // The three host nations are the only confirmed teams exposed offline.
    expect(dashboard.teams).toHaveLength(3)
    expect(dashboard.quality.provider).toBe('snapshot')
    expect(dashboard.quality.confidence).toBe('snapshot')
    expect(dashboard.quality.isLive).toBe(false)
  })

  it('uses the snapshot when the user picks Local Fallback', async () => {
    setSourcePreference('fallback')

    const [dashboard, groups, teams] = await Promise.all([
      getWorldCupDashboard(),
      getWorldCupGroups(),
      getWorldCupTeams(),
    ])

    expect(dashboard.quality.provider).toBe('snapshot')
    expect(groups).toHaveLength(48)
    expect(teams).toHaveLength(3)
  })
})
