import { describe, expect, it } from 'vitest'

import { currentSeasonId, parseSeasonStartYear, seasonInfo, toTheSportsDbSeason } from './season'

describe('season helpers', () => {
  it('rolls over to the new season on July 1st', () => {
    expect(currentSeasonId(new Date('2026-06-30T23:59:59Z'))).toBe('2025-26')
    expect(currentSeasonId(new Date('2026-07-01T00:00:00Z'))).toBe('2026-27')
    expect(currentSeasonId(new Date('2026-10-02T12:00:00Z'))).toBe('2026-27')
  })

  it('handles the century boundary', () => {
    expect(currentSeasonId(new Date('2099-09-01T00:00:00Z'))).toBe('2099-00')
  })

  it('parses and converts season formats', () => {
    expect(parseSeasonStartYear('2026-27')).toBe(2026)
    expect(parseSeasonStartYear('2026-2027')).toBe(2026)
    expect(parseSeasonStartYear(undefined)).toBeUndefined()
    expect(toTheSportsDbSeason('2026-27')).toBe('2026-2027')
    expect(seasonInfo('2026-27')).toEqual({
      id: '2026-27',
      label: '2026/27',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2027-05-31T23:59:59Z',
    })
  })
})

describe('matchday helpers', () => {
  it('derives the current matchday from the table', async () => {
    const { currentMatchdayFromTable, totalMatchdays } = await import('./season')
    // Round 5 half played: still matchday 5, not 6.
    const midRound = Array.from({ length: 20 }, (_, index) => ({ played: index % 2 ? 5 : 4 }))
    expect(currentMatchdayFromTable(midRound, [{ status: 'SCHEDULED' }])).toBe(5)
    expect(currentMatchdayFromTable(midRound, [{ status: 'FINISHED' }])).toBe(5)
    // Round 5 done except one postponed game: matchday 6 is next.
    const postponed = Array.from({ length: 20 }, (_, index) => ({ played: index < 2 ? 4 : 5 }))
    expect(currentMatchdayFromTable(postponed, [{ status: 'SCHEDULED' }])).toBe(6)
    expect(currentMatchdayFromTable(postponed, [{ status: 'FINISHED' }])).toBe(5)
    expect(currentMatchdayFromTable([], [])).toBe(1)
    expect(totalMatchdays(18)).toBe(34)
    expect(currentMatchdayFromTable(Array.from({ length: 18 }, () => ({ played: 34 })), [{ status: 'SCHEDULED' }])).toBe(34)
  })
})
