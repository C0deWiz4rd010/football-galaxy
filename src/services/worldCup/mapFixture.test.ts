import { describe, expect, it } from 'vitest'

import { worldCupKnockoutMatches } from '@/test/payloads/worldCupKnockout'
import { winnerSide } from '@/features/world-cup/utils'

import { ageAtTournamentStart, mapFixture } from './footballDataProvider'

describe('mapFixture scores', () => {
  it('keeps the shoot-out out of the match score', () => {
    // Germany 1:1 Paraguay a.e.t., 3:4 on penalties — the API sends fullTime 4:5.
    const fixture = mapFixture(worldCupKnockoutMatches.shootout)

    expect([fixture.homeScore, fixture.awayScore]).toEqual([1, 1])
    expect(fixture.penalties).toEqual({ home: 3, away: 4 })
    expect(fixture.decidedBy).toBe('penalties')
    expect(fixture.winner).toBe('away')
    expect(winnerSide(fixture)).toBe('away')
    expect(fixture.scoreBreakdown?.regular).toEqual({ home: 1, away: 1 })
  })

  it('counts extra-time goals in the match score', () => {
    // Belgium 2:2 Senegal after 90 minutes, 3:2 after extra time.
    const fixture = mapFixture(worldCupKnockoutMatches.extraTime)

    expect([fixture.homeScore, fixture.awayScore]).toEqual([3, 2])
    expect(fixture.penalties).toBeUndefined()
    expect(fixture.decidedBy).toBe('extra-time')
    expect(fixture.scoreBreakdown?.regular).toEqual({ home: 2, away: 2 })
    expect(fixture.scoreBreakdown?.extratime).toEqual({ home: 1, away: 0 })
  })

  it('uses fullTime as-is for matches decided in 90 minutes', () => {
    const fixture = mapFixture(worldCupKnockoutMatches.regular)

    expect([fixture.homeScore, fixture.awayScore]).toEqual([0, 1])
    expect(fixture.decidedBy).toBe('regular')
    expect(fixture.scoreBreakdown?.regular).toEqual({ home: 0, away: 1 })
    expect(winnerSide(fixture)).toBe('away')
  })

  it('does not claim a winner before the final whistle', () => {
    const fixture = mapFixture({ ...worldCupKnockoutMatches.regular, status: 'IN_PLAY' })

    expect(fixture.winner).toBeUndefined()
    expect(fixture.decidedBy).toBeUndefined()
  })
})

describe('ageAtTournamentStart', () => {
  it('counts birthdays up to the opening day, not today', () => {
    // Opening day is 2026-06-11.
    expect(ageAtTournamentStart('2000-06-11')).toBe(26)
    expect(ageAtTournamentStart('2000-06-12')).toBe(25)
    expect(ageAtTournamentStart('not a date')).toBeUndefined()
  })
})
