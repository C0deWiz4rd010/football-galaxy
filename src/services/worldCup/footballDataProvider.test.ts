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

  it('ranks archived groups by head-to-head, dedupes stage blocks and marks qualified thirds', async () => {
    const scored = (id: number, home: [number, string], away: [number, string], h: number, a: number) => ({
      ...groupMatch(id, 'GROUP_A', home, away),
      score: { duration: 'REGULAR', fullTime: { home: h, away: a } },
    })
    const mex: [number, string] = [1, 'MEX']
    const rsa: [number, string] = [2, 'RSA']
    const kor: [number, string] = [3, 'KOR']
    const cze: [number, string] = [4, 'CZE']
    // MEX and RSA both finish on 6 points; RSA has the better goal difference but lost to MEX.
    const overall = [
      { ...row(1, 2, 'RSA', 6), goalDifference: 4 },
      { ...row(2, 1, 'MEX', 6), goalDifference: 1 },
      row(3, 3, 'KOR', 4),
      row(4, 4, 'CZE', 1),
    ]
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/standings')) {
        return {
          standings: [
            { stage: 'GROUP_STAGE', type: 'TOTAL', group: null, table: overall },
            { stage: 'LAST_32', type: 'TOTAL', group: null, table: overall },
          ],
        } as never
      }
      return {
        matches: [
          scored(1, mex, rsa, 1, 0),
          scored(2, kor, cze, 1, 1),
          { ...groupMatch(3, 'GROUP_A', kor, [9, 'BRA']), stage: 'LAST_32', group: null },
        ],
      } as never
    })

    const groups = await footballDataWorldCupProvider.getGroups()

    expect(groups.map((entry) => [entry.rank, entry.team.code, entry.qualificationHint])).toEqual([
      [1, 'MEX', 'top-two'],
      [2, 'RSA', 'top-two'],
      [3, 'KOR', 'best-third'],
      [4, 'CZE', 'eliminated'],
    ])
  })
  it('ignores later-stage tables and keeps thirds "under watch" while groups are still running', async () => {
    const scored = (id: number, home: [number, string], away: [number, string], h: number, a: number, status = 'FINISHED') => ({
      ...groupMatch(id, 'GROUP_A', home, away),
      status,
      score: { duration: 'REGULAR', fullTime: { home: h, away: a } },
    })
    const mex: [number, string] = [1, 'MEX']
    const rsa: [number, string] = [2, 'RSA']
    const kor: [number, string] = [3, 'KOR']
    const cze: [number, string] = [4, 'CZE']
    const groupTable = [row(1, 1, 'MEX', 7), row(2, 2, 'RSA', 5), row(3, 3, 'KOR', 4), row(4, 4, 'CZE', 0)]
    // In the knockout table KOR sits on top with knockout points — it must not leak into group A.
    const knockoutTable = [{ ...row(1, 3, 'KOR', 12), playedGames: 5 }, row(2, 1, 'MEX', 9), row(3, 2, 'RSA', 5), row(4, 4, 'CZE', 0)]
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/standings')) {
        return {
          standings: [
            { stage: 'LAST_32', type: 'TOTAL', group: null, table: knockoutTable },
            { stage: 'GROUP_STAGE', type: 'TOTAL', group: null, table: groupTable },
          ],
        } as never
      }
      return {
        matches: [
          scored(1, mex, rsa, 1, 0),
          scored(2, kor, cze, 0, 0, 'IN_PLAY'),
          // Group winners already appear in the round of 32 while the groups still run.
          { ...groupMatch(3, 'GROUP_A', mex, [9, 'BRA']), stage: 'LAST_32', group: null, status: 'TIMED' },
        ],
      } as never
    })

    const groups = await footballDataWorldCupProvider.getGroups()

    expect(groups.map((entry) => [entry.rank, entry.team.code, entry.points, entry.played, entry.qualificationHint])).toEqual([
      [1, 'MEX', 7, 3, 'top-two'],
      [2, 'RSA', 5, 3, 'top-two'],
      [3, 'KOR', 4, 3, 'best-third-watch'],
      [4, 'CZE', 0, 3, 'pending'],
    ])
  })
})
