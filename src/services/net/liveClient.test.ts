import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetLiveClientState, fetchLiveJson, wasServedStale } from './liveClient'

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

  it('retries a 429 whose limit resets within seconds', async () => {
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

  it('times out a hung request and reports it', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
    )

    await expect(
      fetchLiveJson('https://example.com/hang', { fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 20, maxRetries: 0 }),
    ).rejects.toThrow(/timed out/)
  })

  it('does not retry when the caller aborts', async () => {
    const controller = new AbortController()
    const fetchImpl = vi.fn(async () => {
      controller.abort()
      throw new DOMException('Aborted', 'AbortError')
    })

    await expect(
      fetchLiveJson('https://example.com/abort', { fetchImpl, init: { signal: controller.signal } }),
    ).rejects.toThrow()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('does not retry non-retryable statuses and exposes the status', async () => {
    const fetchImpl = vi.fn(async () => errorResponse(404))
    await expect(fetchLiveJson('https://example.com/missing', { fetchImpl })).rejects.toMatchObject({ status: 404 })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
  it('fails fast on a 429 without a near reset instead of retrying', async () => {
    const fetchImpl = vi.fn(async () => errorResponse(429, '45'))
    await expect(fetchLiveJson('https://example.com/limited', { fetchImpl })).rejects.toMatchObject({ status: 429 })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('allows ten football-data.org calls per minute and queues the eleventh', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi.fn(async () => jsonResponse({ ok: true }))
    const calls = Array.from({ length: 11 }, (_, index) =>
      fetchLiveJson(`https://api.football-data.org/v4/x/${index}`, { fetchImpl }),
    )

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchImpl).toHaveBeenCalledTimes(10)

    await vi.advanceTimersByTimeAsync(60_000)
    await Promise.all(calls)
    expect(fetchImpl).toHaveBeenCalledTimes(11)
  })
  it('remembers when the proxy answered with its stored copy', async () => {
    const stale = { ...jsonResponse({ ok: true }), headers: new Headers({ 'x-proxy-cache': 'stale' }) } as Response
    await fetchLiveJson('https://example.com/table', { fetchImpl: vi.fn(async () => stale) })
    expect(wasServedStale('https://example.com/table')).toBe(true)

    await fetchLiveJson('https://example.com/table', { fetchImpl: vi.fn(async () => jsonResponse({ ok: true })) })
    expect(wasServedStale('https://example.com/table')).toBe(false)
  })
  it('does not count proxy cache hits against the football-data.org window', async () => {
    vi.useFakeTimers()
    const cached = () => ({ ...jsonResponse({ ok: true }), headers: new Headers({ 'x-proxy-cache': 'hit' }) }) as Response
    const fetchImpl = vi.fn(async () => cached())
    for (let index = 0; index < 15; index += 1) {
      await fetchLiveJson(`https://api.football-data.org/v4/cached/${index}`, { fetchImpl })
    }
    expect(fetchImpl).toHaveBeenCalledTimes(15)
  })
})
