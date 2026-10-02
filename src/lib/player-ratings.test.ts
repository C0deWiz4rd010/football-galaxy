import { describe, expect, it } from 'vitest'

import { makePlayer } from '@/test/fixtures'

import { getFormScore } from './player-ratings'

describe('getFormScore', () => {
  it('returns a bounded score with a valid label and traits', () => {
    const form = getFormScore(makePlayer())

    expect(form.score).toBeGreaterThanOrEqual(0)
    expect(form.score).toBeLessThanOrEqual(99)
    expect(['Top Form', 'In Form', 'Steady', 'Cold']).toContain(form.label)
    expect(Array.isArray(form.traits)).toBe(true)
  })

  it('ranks a productive striker above a low-output player', () => {
    const productive = makePlayer({ stats: { goals: 9, assists: 5, trend: [2, 1, 3, 2, 2] } })
    const quiet = makePlayer({ stats: { goals: 0, assists: 0, trend: [0, 0, 0, 0, 0] } })

    expect(getFormScore(productive).score).toBeGreaterThan(getFormScore(quiet).score)
  })
})

describe('getFormScore calibration', () => {
  it('rates an elite striker (5 goals in 5 full games) as Top Form', () => {
    const striker = makePlayer({ position: 'FW', stats: { appearances: 5, goals: 5, assists: 0, minutes: 430, yellowCards: 0 } })
    expect(getFormScore(striker).label).toBe('Top Form')
  })

  it('does not punish a regular defender for scoring little', () => {
    const defender = makePlayer({ position: 'DF', stats: { appearances: 6, goals: 0, assists: 1, minutes: 516, yellowCards: 1 } })
    expect(getFormScore(defender).score).toBeGreaterThanOrEqual(45)
  })
})
