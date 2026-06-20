import { describe, expect, it } from 'vitest'

import { mapApiFootballFixture, mapApiFootballStandings } from './apiFootballProvider'

describe('World Cup API-Football mapper', () => {
  it('maps fixtures into standalone World Cup fixture models', () => {
    const fixture = mapApiFootballFixture({
      fixture: {
        id: 101,
        date: '2026-06-11T19:00:00+00:00',
        status: { short: '1H', elapsed: 32 },
        venue: { name: 'Estadio Azteca', city: 'Mexico City' },
      },
      league: { round: 'Group A - 1' },
      teams: {
        home: { id: 1, name: 'Mexico', code: 'MEX', country: 'Mexico', logo: 'https://example.com/mex.png' },
        away: { id: 2, name: 'Canada', code: 'CAN', country: 'Canada', logo: 'https://example.com/can.png' },
      },
      goals: { home: 1, away: 0 },
      score: {
        halftime: { home: 1, away: 0 },
        fulltime: { home: null, away: null },
      },
    })

    expect(fixture.id).toBe('af-fixture-101')
    expect(fixture.stage).toBe('group')
    expect(fixture.group).toBe('A')
    expect(fixture.status).toBe('LIVE')
    expect(fixture.homeTeam.id).toBe('af-1')
    expect(fixture.homeTeam.flagUrl).toBe('https://example.com/mex.png')
    expect(fixture.referee).toBeUndefined()
    expect(fixture.scoreBreakdown?.halftime?.home).toBe(1)
    expect(fixture.quality.provider).toBe('api-football')
    expect(fixture.quality.isLive).toBe(true)
  })

  it('maps standings without touching league dashboard models', () => {
    const standings = mapApiFootballStandings({
      league: {
        standings: [
          [
            {
              rank: 1,
              group: 'Group A',
              points: 7,
              goalsDiff: 3,
              form: 'WWD',
              team: { id: 1, name: 'Mexico', code: 'MEX', country: 'Mexico' },
              all: {
                played: 3,
                win: 2,
                draw: 1,
                lose: 0,
                goals: { for: 5, against: 2 },
              },
            },
          ],
        ],
      },
    })

    expect(standings[0]?.group).toBe('A')
    expect(standings[0]?.team.group).toBe('A')
    expect(standings[0]?.qualificationHint).toBe('top-two')
    expect(standings[0]?.quality.provider).toBe('api-football')
    expect(standings[0]?.quality.confidence).toBe('official')
  })
})
