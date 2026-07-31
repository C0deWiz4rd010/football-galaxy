import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./theSportsDb', () => ({ getStandings: vi.fn() }))
vi.mock('./espn/leagueData', () => ({ getStandings: vi.fn() }))
vi.mock('./footballDataOrg', () => ({ getStandings: vi.fn() }))
vi.mock('./openLigaDb/openLigaDb', () => ({ getStandings: vi.fn() }))

import * as espnService from './espn/leagueData'
import * as fdOrgService from './footballDataOrg'
import { getStandings } from './footballData'
import * as openLigaDbService from './openLigaDb/openLigaDb'
import * as liveService from './theSportsDb'
import type { Standing } from './types'

function makeStandings(source: string): Standing[] {
  return [
    {
      id: `${source}-1`,
      leagueId: 'premier-league',
      position: 1,
      team: {
        id: `${source}-team`,
        leagueId: 'premier-league',
        name: `${source} FC`,
        shortName: source,
        crest: '',
      },
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 0,
      goalDifference: 2,
      points: 3,
      form: [],
      avgPossession: 0,
    },
  ]
}

const mockedLive = vi.mocked(liveService.getStandings)
const mockedEspn = vi.mocked(espnService.getStandings)
const mockedFdOrg = vi.mocked(fdOrgService.getStandings)
const mockedOpenLiga = vi.mocked(openLigaDbService.getStandings)

afterEach(() => {
  vi.clearAllMocks()
})

describe('footballData getStandings cascade', () => {
  it('returns the primary (TheSportsDB) result when it succeeds', async () => {
    mockedLive.mockResolvedValue(makeStandings('sportsdb'))

    const result = await getStandings({ leagueId: 'premier-league' })

    expect(result[0]?.id).toBe('sportsdb-1')
    expect(mockedLive).toHaveBeenCalledTimes(1)
    expect(mockedEspn).not.toHaveBeenCalled()
    expect(mockedFdOrg).not.toHaveBeenCalled()
  })

  it('falls back to keyless ESPN when TheSportsDB throws', async () => {
    mockedLive.mockRejectedValue(new Error('429 rate limited'))
    mockedEspn.mockResolvedValue(makeStandings('espn'))

    const result = await getStandings({ leagueId: 'premier-league' })

    expect(result[0]?.id).toBe('espn-1')
    expect(mockedLive).toHaveBeenCalledTimes(1)
    expect(mockedEspn).toHaveBeenCalledTimes(1)
    expect(mockedFdOrg).not.toHaveBeenCalled()
  })

  it('falls back to football-data.org when both TheSportsDB and ESPN fail', async () => {
    mockedLive.mockRejectedValue(new Error('sportsdb down'))
    mockedEspn.mockRejectedValue(new Error('espn down'))
    mockedFdOrg.mockResolvedValue(makeStandings('fdorg'))

    const result = await getStandings({ leagueId: 'premier-league' })

    expect(result[0]?.id).toBe('fdorg-1')
    expect(mockedFdOrg).toHaveBeenCalledTimes(1)
  })

  it('adds the OpenLigaDB safety net only for Bundesliga', async () => {
    mockedLive.mockRejectedValue(new Error('down'))
    mockedEspn.mockRejectedValue(new Error('down'))
    mockedFdOrg.mockRejectedValue(new Error('down'))
    mockedOpenLiga.mockResolvedValue(makeStandings('openliga'))

    const result = await getStandings({ leagueId: 'bundesliga' })

    expect(result[0]?.id).toBe('openliga-1')
    expect(mockedOpenLiga).toHaveBeenCalledTimes(1)
  })

  it('throws the last error when every source fails so the UI shows an honest error', async () => {
    mockedLive.mockRejectedValue(new Error('sportsdb down'))
    mockedEspn.mockRejectedValue(new Error('espn down'))
    mockedFdOrg.mockRejectedValue(new Error('fdorg down'))

    await expect(getStandings({ leagueId: 'premier-league' })).rejects.toThrow(/fdorg down/)
  })
})
