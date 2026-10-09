import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => {
  class LiveHttpError extends Error {
    status: number
    constructor(status: number) {
      super(`HTTP ${status}`)
      this.status = status
    }
  }
  return { fetchLiveJson: vi.fn(), LiveHttpError }
})

import { fetchLiveJson } from '@/services/net/liveClient'

import { footballDataWorldCupProvider } from './footballDataProvider'

const fetchMock = vi.mocked(fetchLiveJson)

const team = (id: number, tla: string) => ({ id, name: tla, shortName: tla, tla })
const row = (position: number, id: number, tla: string, points: number) => ({
  position,
  team: team(id, tla),
  playedGames: 3,
  won: 0,
  draw: 0,
  lost: 0,
  points,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
})
const groupMatch = (id: number, group: string, home: [number, string], away: [number, string]) => ({
  id,
  utcDate: '2026-06-12T18:00:00Z',
  status: 'FINISHED',
  stage: 'GROUP_STAGE',
  group,
  homeTeam: team(...home),
  awayTeam: team(...away),
})

describe('football-data.org World Cup provider', () => {
  afterEach(() => vi.clearAllMocks())

  it('asks for the 2026 season and splits the archived overall table into groups', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/standings')) {
        return {
          standings: [
            { stage: 'GROUP_STAGE', type: 'TOTAL', group: null, table: [row(1, 1, 'FRA', 9), row(2, 3, 'MEX', 7), row(3, 2, 'SEN', 4), row(4, 4, 'KOR', 3)] },
            { stage: 'GROUP_STAGE', type: 'HOME', group: null, table: [row(1, 1, 'FRA', 9)] },
          ],
        } as never
      }
      return {
        matches: [groupMatch(10, 'GROUP_A', [3, 'MEX'], [4, 'KOR']), groupMatch(11, 'GROUP_I', [1, 'FRA'], [2, 'SEN'])],
      } as never
    })

    const groups = await footballDataWorldCupProvider.getGroups()

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([expect.stringContaining('/competitions/WC/standings?season=2026')]),
    )
    expect(groups.map((entry) => [entry.group, entry.rank, entry.team.code])).toEqual([
      ['A', 1, 'MEX'],
      ['A', 2, 'KOR'],
      ['I', 1, 'FRA'],
      ['I', 2, 'SEN'],
    ])
    expect(groups[0]?.qualificationHint).toBe('top-two')
  })
})
