import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { clearCache, readCache, writeCache } from './persistentCache'

describe('persistentCache', () => {
  beforeEach(() => {
    clearCache()
  })

  afterEach(() => {
    clearCache()
  })

  it('writes and reads a value back', () => {
    writeCache('team:1', { name: 'Arsenal' })
    const hit = readCache<{ name: string }>('team:1', 10_000)
    expect(hit?.value).toEqual({ name: 'Arsenal' })
    expect(hit?.isStale).toBe(false)
    expect(typeof hit?.fetchedAt).toBe('number')
  })

  it('returns null on a miss', () => {
    expect(readCache('missing', 10_000)).toBeNull()
  })

  it('flags entries older than the TTL as stale but still returns them', () => {
    writeCache('scorers', [1, 2, 3])
    // TTL of 0 ms means anything already written is stale.
    const hit = readCache<number[]>('scorers', 0)
    expect(hit?.value).toEqual([1, 2, 3])
    expect(hit?.isStale).toBe(true)
  })

  it('drops corrupted entries and returns null', () => {
    window.localStorage.setItem('fg-cache:broken', '{ not json')
    expect(readCache('broken', 10_000)).toBeNull()
    expect(window.localStorage.getItem('fg-cache:broken')).toBeNull()
  })

  it('ignores entries from a different schema version', () => {
    window.localStorage.setItem(
      'fg-cache:legacy',
      JSON.stringify({ v: 0, t: Date.now(), d: 'old' }),
    )
    expect(readCache('legacy', 10_000)).toBeNull()
  })

  it('clearCache only removes namespaced keys', () => {
    window.localStorage.setItem('unrelated', 'keep-me')
    writeCache('a', 1)
    clearCache()
    expect(readCache('a', 10_000)).toBeNull()
    expect(window.localStorage.getItem('unrelated')).toBe('keep-me')
  })
})
