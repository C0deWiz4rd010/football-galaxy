import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({
  fetchLiveJson: vi.fn(),
}))

import { fetchLiveJson } from '@/services/net/liveClient'

import { getStandings } from './openLigaDb'

const mockedFetch = vi.mocked(fetchLiveJson)

const tableFixture = [
  {
    teamInfoId: 40,
    teamName: 'FC Bayern München',
    shortName: 'Bayern',
    teamIconUrl: 'https://example.com/bayern.png',
    points: 34,
    matches: 13,
    won: 11,
    draw: 1,
    lost: 1,
    goals: 40,
    opponentGoals: 12,
    goalDiff: 28,
  },
  {
    teamInfoId: 7,
    teamName: 'Borussia Dortmund',
    shortName: 'BVB',
    points: 27,
    matches: 13,
    won: 8,
    draw: 3,
    lost: 2,
    goals: 30,
    opponentGoals: 18,
  },
]

describe('openLigaDb.getStandings', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('maps the Bundesliga table to domain standings with positions', async () => {
    mockedFetch.mockResolvedValue(tableFixture)

    const standings = await getStandings({ leagueId: 'bundesliga' })

    expect(standings).toHaveLength(2)
    expect(standings[0]).toMatchObject({
      position: 1,
      leagueId: 'bundesliga',
      played: 13,
      won: 11,
      drawn: 1,
      lost: 1,
      goalsFor: 40,
      goalsAgainst: 12,
      goalDifference: 28,
      points: 34,
    })
    expect(standings[0].team.name).toBe('FC Bayern München')
    expect(standings[0].team.crest).toBe('https://example.com/bayern.png')
    // goalDiff is derived when the feed omits it.
    expect(standings[1].goalDifference).toBe(12)
    expect(standings[1].position).toBe(2)
  })

  it('rejects non-Bundesliga leagues so the cascade skips it', async () => {
    await expect(getStandings({ leagueId: 'la-liga' })).rejects.toThrow(
      /Bundesliga/,
    )
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('throws on an empty table', async () => {
    mockedFetch.mockResolvedValue([])
    await expect(getStandings({ leagueId: 'bundesliga' })).rejects.toThrow(
      /empty/,
    )
  })
})
