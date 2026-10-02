import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./espn/league', () => ({ getStandings: vi.fn(), formFromMatches: vi.fn() }))
vi.mock('./footballDataOrg', () => ({ getStandings: vi.fn() }))
vi.mock('./openLigaDb/openLigaDb', () => ({ getStandings: vi.fn() }))

import { NotFoundError } from './errors'
import * as espn from './espn/league'
import { cascade, getStandings } from './footballData'
import * as fdOrg from './footballDataOrg'
import * as openLigaDb from './openLigaDb/openLigaDb'
import type { Standing } from './types'

function makeStandings(source: string): Standing[] {
  return [
    {
      id: `${source}-1`,
      leagueId: 'premier-league',
      position: 1,
      team: { id: `${source}-team`, leagueId: 'premier-league', name: `${source} FC`, shortName: source, crest: '' },
      played: 1,
      won: 1,
      drawn: 0,
      lost: 0,
      goalsFor: 2,
      goalsAgainst: 0,
      goalDifference: 2,
      points: 3,
      form: [],
    },
  ]
}

const mockedEspn = vi.mocked(espn.getStandings)
const mockedFdOrg = vi.mocked(fdOrg.getStandings)
const mockedOpenLiga = vi.mocked(openLigaDb.getStandings)

afterEach(() => {
  vi.clearAllMocks()
})

describe('footballData getStandings cascade', () => {
  it('returns the primary ESPN result when it succeeds', async () => {
    mockedEspn.mockResolvedValue(makeStandings('espn'))

    const result = await getStandings({ leagueId: 'premier-league' })

    expect(result[0]?.id).toBe('espn-1')
    expect(mockedFdOrg).not.toHaveBeenCalled()
  })

  it('falls back to football-data.org when ESPN fails', async () => {
    mockedEspn.mockRejectedValue(new Error('espn down'))
    mockedFdOrg.mockResolvedValue(makeStandings('fdorg'))

    const result = await getStandings({ leagueId: 'premier-league' })

    expect(result[0]?.id).toBe('fdorg-1')
  })

  it('adds the OpenLigaDB safety net only for the Bundesliga', async () => {
    mockedEspn.mockRejectedValue(new Error('down'))
    mockedFdOrg.mockRejectedValue(new Error('down'))
    mockedOpenLiga.mockResolvedValue(makeStandings('openliga'))

    expect((await getStandings({ leagueId: 'bundesliga' }))[0]?.id).toBe('openliga-1')
    await expect(getStandings({ leagueId: 'premier-league' })).rejects.toThrow('down')
    expect(mockedOpenLiga).toHaveBeenCalledTimes(1)
  })

  it('throws the last error when every source fails so the UI shows an honest error', async () => {
    mockedEspn.mockRejectedValue(new Error('espn down'))
    mockedFdOrg.mockRejectedValue(new Error('fdorg down'))

    await expect(getStandings({ leagueId: 'premier-league' })).rejects.toThrow(/fdorg down/)
  })
})

describe('cascade', () => {
  it('stops at a not-found answer instead of asking sources with different ids', async () => {
    const second = vi.fn()
    await expect(cascade([() => Promise.reject(new NotFoundError('gone')), second])).rejects.toBeInstanceOf(NotFoundError)
    expect(second).not.toHaveBeenCalled()
  })
})
