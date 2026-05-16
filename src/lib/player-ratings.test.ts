import { describe, expect, it } from 'vitest'

import * as premierLeagueData from '@/data/mock/premier-league'

import { getFormScore } from './player-ratings'

describe('getFormScore', () => {
  it('returns a bounded score with a valid label and traits', () => {
    const player = premierLeagueData.teams[0]!.squad![8]!

    const form = getFormScore(player)

    expect(form.score).toBeGreaterThanOrEqual(0)
    expect(form.score).toBeLessThanOrEqual(99)
    expect(['Top Form', 'In Form', 'Steady', 'Cold']).toContain(form.label)
    expect(Array.isArray(form.traits)).toBe(true)
  })

  it('ranks a productive striker above a low-output player', () => {
    const squad = premierLeagueData.teams[0]!.squad!
    const productive = squad.reduce((best, player) =>
      player.stats.goals + player.stats.assists >
      best.stats.goals + best.stats.assists
        ? player
        : best,
    )
    const quiet = squad.reduce((min, player) =>
      player.stats.goals + player.stats.assists <
      min.stats.goals + min.stats.assists
        ? player
        : min,
    )

    expect(getFormScore(productive).score).toBeGreaterThanOrEqual(
      getFormScore(quiet).score,
    )
  })
})
