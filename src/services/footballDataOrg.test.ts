import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({ fetchLiveJson: vi.fn() }))

import { fetchLiveJson } from '@/services/net/liveClient'

import { getMatches, getTopAssists } from './footballDataOrg'

const fetchMock = vi.mocked(fetchLiveJson)
const team = (id: number, name: string) => ({ id, name, shortName: name, tla: name.slice(0, 3).toUpperCase() })

describe('football-data.org fallback source', () => {
  afterEach(() => vi.clearAllMocks())

  it('ranks assists from the widest scorer list, by assists', async () => {
    fetchMock.mockResolvedValueOnce({
      scorers: [
        { player: { id: 1, name: 'Scorer' }, team: team(10, 'Alpha'), playedMatches: 8, goals: 9, assists: 1 },
        { player: { id: 2, name: 'Creator' }, team: team(11, 'Beta'), playedMatches: 8, goals: 1, assists: 6 },
        { player: { id: 3, name: 'Finisher' }, team: team(12, 'Gamma'), playedMatches: 8, goals: 5, assists: 0 },
      ],
    } as never)

    const assists = await getTopAssists({ leagueId: 'bundesliga', season: '2026-27' })

    expect(fetchMock.mock.calls[0]?.[0]).toContain('/scorers?limit=100')
    expect(assists.map((entry) => [entry.player.name, entry.assists])).toEqual([
      ['Creator', 6],
      ['Scorer', 1],
    ])
  })

  it('keeps postponed games apart and never scores them', async () => {
    fetchMock.mockResolvedValueOnce({
      matches: [
        { id: 1, utcDate: '2026-10-01T18:00:00Z', status: 'FINISHED', homeTeam: team(10, 'Alpha'), awayTeam: team(11, 'Beta'), score: { fullTime: { home: 2, away: 1 } } },
        { id: 2, utcDate: '2026-10-02T18:00:00Z', status: 'POSTPONED', homeTeam: team(12, 'Gamma'), awayTeam: team(13, 'Delta'), score: { fullTime: { home: null, away: null } } },
        { id: 3, utcDate: '2026-10-03T18:00:00Z', status: 'TIMED', homeTeam: team(10, 'Alpha'), awayTeam: team(12, 'Gamma') },
      ],
    } as never)

    const matches = await getMatches({ leagueId: 'bundesliga', season: '2026-27' })

    expect(matches.map((match) => [match.status, match.homeScore, match.awayScore])).toEqual([
      ['FINISHED', 2, 1],
      ['POSTPONED', undefined, undefined],
      ['SCHEDULED', undefined, undefined],
    ])
  })
})
