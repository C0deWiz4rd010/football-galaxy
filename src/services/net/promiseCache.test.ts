import { afterEach, describe, expect, it, vi } from 'vitest'

import { createPromiseCache } from './promiseCache'

describe('createPromiseCache', () => {
  afterEach(() => vi.useRealTimers())

  it('dedupes within the TTL and reloads after it expires', async () => {
    vi.useFakeTimers()
    const cache = createPromiseCache<string, number>(1000)
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2)

    expect(await cache.get('a', load)).toBe(1)
    expect(await cache.get('a', load)).toBe(1)
    expect(load).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1001)
    expect(await cache.get('a', load)).toBe(2)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('evicts rejected loads so the next call retries', async () => {
    const cache = createPromiseCache<string, number>(60_000)
    const load = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(3)

    await expect(cache.get('a', load)).rejects.toThrow('boom')
    expect(await cache.get('a', load)).toBe(3)
  })
})
