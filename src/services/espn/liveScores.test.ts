import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({
  fetchLiveJson: vi.fn(),
}))

import { fetchLiveJson } from '@/services/net/liveClient'

import { fetchLeagueLiveScores, hasLiveMatch } from './liveScores'

const mockedFetch = vi.mocked(fetchLiveJson)

const scoreboardFixture = {
  events: [
    {
      id: 'finished-1',
      competitions: [
        {
          id: 'comp-finished',
          date: '2026-05-01T14:00:00Z',
          status: { type: { state: 'post', completed: true } },
          competitors: [
            {
              homeAway: 'home',
              score: '2',
              team: { id: '1', displayName: 'Arsenal', shortDisplayName: 'Arsenal', abbreviation: 'ARS' },
            },
            {
              homeAway: 'away',
              score: '1',
              team: { id: '2', displayName: 'Chelsea', shortDisplayName: 'Chelsea', abbreviation: 'CHE' },
            },
          ],
        },
      ],
    },
    {
      id: 'live-1',
      competitions: [
        {
          id: 'comp-live',
          date: '2026-05-01T16:30:00Z',
          status: { displayClock: "67'", type: { state: 'in' } },
          competitors: [
            {
              homeAway: 'home',
              score: '1',
              team: { id: '3', displayName: 'Liverpool', shortDisplayName: 'Liverpool', abbreviation: 'LIV' },
            },
            {
              homeAway: 'away',
              score: '0',
              team: { id: '4', displayName: 'Everton', shortDisplayName: 'Everton', abbreviation: 'EVE' },
            },
          ],
          details: [
            {
              type: { text: 'Goal' },
              clock: { displayValue: "23'" },
              team: { id: '3' },
              scoringPlay: true,
              athletesInvolved: [{ displayName: 'M. Salah' }],
            },
          ],
        },
      ],
    },
    {
      id: 'pre-1',
      competitions: [
        {
          id: 'comp-pre',
          date: '2026-05-01T19:00:00Z',
          status: { type: { state: 'pre' } },
          competitors: [
            {
              homeAway: 'home',
              team: { id: '5', displayName: 'Spurs', shortDisplayName: 'Spurs', abbreviation: 'TOT' },
            },
            {
              homeAway: 'away',
              team: { id: '6', displayName: 'Fulham', shortDisplayName: 'Fulham', abbreviation: 'FUL' },
            },
          ],
        },
      ],
    },
  ],
}

describe('fetchLeagueLiveScores', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maps, orders (live → pre → ft), and parses events', async () => {
    mockedFetch.mockResolvedValue(scoreboardFixture)

    const matches = await fetchLeagueLiveScores('premier-league')

    expect(matches.map((m) => m.state)).toEqual(['live', 'pre', 'ft'])

    const live = matches[0]
    expect(live.leagueLabel).toBe('Premier League')
    expect(live.statusLabel).toBe("67'")
    expect(live.home.score).toBe(1)
    expect(live.away.score).toBe(0)
    expect(live.events).toHaveLength(1)
    expect(live.events[0]).toMatchObject({
      type: 'goal',
      side: 'home',
      playerName: 'M. Salah',
      minute: "23'",
    })

    const upcoming = matches[1]
    expect(upcoming.home.score).toBeNull()
    expect(upcoming.statusLabel).not.toBe('Live')
  })

  it('hasLiveMatch reflects in-progress games', async () => {
    mockedFetch.mockResolvedValue(scoreboardFixture)
    const matches = await fetchLeagueLiveScores('premier-league')
    expect(hasLiveMatch(matches)).toBe(true)
    expect(hasLiveMatch([])).toBe(false)
  })

  it('degrades to an empty list when the feed has no events', async () => {
    mockedFetch.mockResolvedValue({ events: null })
    const matches = await fetchLeagueLiveScores('bundesliga')
    expect(matches).toEqual([])
  })
})
