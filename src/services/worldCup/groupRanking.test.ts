import { describe, expect, it } from 'vitest'

import { rankGroup, type GroupResult, type RankableTeam } from './groupRanking'

const team = (teamId: number, points: number, goalDifference: number, goalsFor: number, providerOrder: number): RankableTeam => ({
  teamId,
  points,
  goalDifference,
  goalsFor,
  providerOrder,
})
const result = (homeId: number, awayId: number, homeGoals: number, awayGoals: number): GroupResult => ({
  homeId,
  awayId,
  homeGoals,
  awayGoals,
})

describe('rankGroup', () => {
  it('orders by points first', () => {
    const ranked = rankGroup([team(1, 3, 0, 2, 1), team(2, 9, 5, 7, 2), team(3, 6, 1, 4, 3)], [])
    expect(ranked.map((entry) => entry.teamId)).toEqual([2, 3, 1])
  })

  it('puts the head-to-head result ahead of overall goal difference', () => {
    // Both on 6 points; team 2 has the better overall goal difference but lost to team 1.
    const ranked = rankGroup([team(2, 6, 5, 7, 1), team(1, 6, 1, 4, 2)], [result(1, 2, 1, 0)])
    expect(ranked.map((entry) => entry.teamId)).toEqual([1, 2])
  })

  it('falls back to overall goal difference, goals, then the provider order', () => {
    const drawn = [result(1, 2, 1, 1)]
    expect(rankGroup([team(1, 4, 0, 3, 1), team(2, 4, 2, 3, 2)], drawn).map((entry) => entry.teamId)).toEqual([2, 1])
    expect(rankGroup([team(1, 4, 2, 3, 1), team(2, 4, 2, 5, 2)], drawn).map((entry) => entry.teamId)).toEqual([2, 1])
    expect(rankGroup([team(1, 4, 2, 3, 2), team(2, 4, 2, 3, 1)], drawn).map((entry) => entry.teamId)).toEqual([2, 1])
  })
})
