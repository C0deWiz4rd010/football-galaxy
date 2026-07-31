import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/contexts/DataSourceContext', () => ({
  useDataSource: () => ({ source: 'live', season: '2026-27' }),
}))

vi.mock('@/services/cache/persistentCache', () => ({
  readCache: vi.fn(),
  writeCache: vi.fn(),
}))

vi.mock('@/services/footballData', () => ({
  getStandings: vi.fn(),
}))

import { readCache } from '@/services/cache/persistentCache'
import * as liveService from '@/services/footballData'

import { useFootballData } from './useFootballData'

const mockedReadCache = vi.mocked(readCache)
const mockedGetStandings = vi.mocked(liveService.getStandings)

afterEach(() => {
  vi.clearAllMocks()
})

describe('useFootballData', () => {
  it('cold start: shows loading, then resolves data with no error', async () => {
    mockedReadCache.mockReturnValue(null)
    mockedGetStandings.mockResolvedValue([{ id: 'cold' }] as never)

    const { result } = renderHook(() =>
      useFootballData('getStandings', { leagueId: 'premier-league' }),
    )

    // Nothing cached -> loading with no data initially.
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual([{ id: 'cold' }])
    expect(result.current.error).toBeNull()
  })

  it('paints fresh cached data instantly without a loading flash or upstream call', async () => {
    mockedReadCache.mockReturnValue({
      value: [{ id: 'cached' }],
      fetchedAt: Date.now(),
    } as never)

    const { result } = renderHook(() =>
      useFootballData('getStandings', { leagueId: 'la-liga' }),
    )

    await waitFor(() => expect(result.current.data).toEqual([{ id: 'cached' }]))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    // Fresh cache means no upstream request is made.
    expect(mockedGetStandings).not.toHaveBeenCalled()
  })

  it('surfaces a hard error and dispatches a toast when there is no seed data', async () => {
    mockedReadCache.mockReturnValue(null)
    mockedGetStandings.mockRejectedValue(new Error('all sources down'))
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')

    const { result } = renderHook(() =>
      useFootballData('getStandings', { leagueId: 'serie-a' }),
    )

    await waitFor(() => expect(result.current.error).toBe('all sources down'))
    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(
      dispatchSpy.mock.calls.some(([event]) => (event as Event).type === 'football-toast'),
    ).toBe(true)

    dispatchSpy.mockRestore()
  })
})
