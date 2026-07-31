import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({
  fetchLiveJson: vi.fn(),
}))

import { fetchLiveJson } from '@/services/net/liveClient'

import { getLeagueSummary, getStandings } from './leagueData'

const mockedFetch = vi.mocked(fetchLiveJson)

const standingsFixture = {
  season: { year: 2026, displayName: '2026-27 English Premier League' },
  children: [
    {
      standings: {
        entries: [
          {
            team: {
              id: '359',
              displayName: 'Arsenal',
              shortDisplayName: 'Arsenal',
              abbreviation: 'ARS',
              logos: [{ href: 'https://a.espncdn.com/arsenal.png' }],
            },
            stats: [
              { type: 'rank', value: 1 },
              { type: 'gamesplayed', value: 10 },
              { type: 'wins', value: 8 },
              { type: 'ties', value: 1 },
              { type: 'losses', value: 1 },
              { type: 'pointsfor', value: 24 },
              { type: 'pointsagainst', value: 8 },
              { type: 'pointdifferential', value: 16 },
              { type: 'points', value: 25 },
            ],
          },
          {
            team: {
              id: '360',
              displayName: 'Chelsea',
              shortDisplayName: 'Chelsea',
              abbreviation: 'CHE',
              logos: [{ href: 'https://a.espncdn.com/chelsea.png' }],
            },
            stats: [
              { type: 'rank', value: 2 },
              { type: 'gamesplayed', value: 10 },
              { type: 'wins', value: 7 },
              { type: 'ties', value: 2 },
              { type: 'losses', value: 1 },
              { type: 'pointsfor', value: 20 },
              { type: 'pointsagainst', value: 9 },
              { type: 'pointdifferential', value: 11 },
              { type: 'points', value: 23 },
            ],
          },
        ],
      },
    },
  ],
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('espn leagueData', () => {
  it('maps standings entries into the Standing shape, sorted by position', async () => {
    mockedFetch.mockResolvedValue(standingsFixture)

    const standings = await getStandings({ leagueId: 'premier-league' })

    expect(standings).toHaveLength(2)
    const [first, second] = standings
    expect(first?.position).toBe(1)
    expect(first?.team.name).toBe('Arsenal')
    expect(first?.team.crest).toBe('https://a.espncdn.com/arsenal.png')
    expect(first?.played).toBe(10)
    expect(first?.won).toBe(8)
    expect(first?.drawn).toBe(1)
    expect(first?.lost).toBe(1)
    expect(first?.goalsFor).toBe(24)
    expect(first?.goalsAgainst).toBe(8)
    expect(first?.goalDifference).toBe(16)
    expect(first?.points).toBe(25)
    expect(second?.position).toBe(2)
  })

  it('throws when ESPN returns an empty table so the cascade can fall past it', async () => {
    mockedFetch.mockResolvedValue({ children: [{ standings: { entries: [] } }] })

    await expect(getStandings({ leagueId: 'la-liga' })).rejects.toThrow(/no standings/i)
  })

  it('builds a league summary whose hero is the standings table', async () => {
    mockedFetch.mockResolvedValue(standingsFixture)

    const summary = await getLeagueSummary({ leagueId: 'premier-league' })

    expect(summary.league.id).toBe('premier-league')
    expect(summary.standings).toHaveLength(2)
    expect(summary.teams).toHaveLength(2)
    expect(summary.topScorers).toEqual([])
    expect(summary.season.id).toBe('2026-27')
  })
})
