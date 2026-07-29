import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetLiveClientState, fetchLiveJson } from './liveClient'

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
  } as unknown as Response
}

function errorResponse(status: number, retryAfter?: string): Response {
  const headers = new Headers()
  if (retryAfter) headers.set('retry-after', retryAfter)
  return {
    ok: false,
    status,
    headers,
    json: async () => ({}),
  } as unknown as Response
}

describe('fetchLiveJson', () => {
  beforeEach(() => {
    __resetLiveClientState()
  })

  afterEach(() => {
    vi.useRealTimers()
    __resetLiveClientState()
  })

  it('de-duplicates concurrent identical requests', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ ok: true }))

    const [a, b] = await Promise.all([
      fetchLiveJson<{ ok: boolean }>('https://example.com/x', { fetchImpl }),
      fetchLiveJson<{ ok: boolean }>('https://example.com/x', { fetchImpl }),
    ])

    expect(a).toEqual({ ok: true })
    expect(b).toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('retries on a 429 and then resolves', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(429, '0'))
      .mockResolvedValueOnce(jsonResponse({ done: true }))

    const promise = fetchLiveJson<{ done: boolean }>('https://example.com/retry', {
      fetchImpl,
    })

    await vi.advanceTimersByTimeAsync(9000)
    await expect(promise).resolves.toEqual({ done: true })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('does not retry a non-retryable 404', async () => {
    const fetchImpl = vi.fn(async () => errorResponse(404))

    await expect(
      fetchLiveJson('https://example.com/missing', { fetchImpl, maxRetries: 2 }),
    ).rejects.toThrow(/404/)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('gives up after exhausting retries on repeated 500s', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => errorResponse(500))

    const promise = fetchLiveJson('https://example.com/down', {
      fetchImpl,
      maxRetries: 1,
    })
    const assertion = expect(promise).rejects.toThrow(/500/)
    await vi.advanceTimersByTimeAsync(9000)
    await assertion
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})
