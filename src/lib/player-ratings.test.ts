import { describe, expect, it } from 'vitest'

import * as premierLeagueData from '@/data/mock/premier-league'

import { getPlayerCardProfile } from './player-ratings'

describe('getPlayerCardProfile', () => {
  it('returns a bounded overall and descriptive metadata', () => {
    const player = premierLeagueData.teams[0]!.squad![8]!

    const profile = getPlayerCardProfile(player)

    expect(profile.overall).toBeGreaterThanOrEqual(58)
    expect(profile.overall).toBeLessThanOrEqual(96)
    expect(profile.archetype.length).toBeGreaterThan(0)
    expect(['Base', 'In Form', 'Playmaker', 'Defensive Wall', 'Future Star']).toContain(profile.tier)
  })
})
