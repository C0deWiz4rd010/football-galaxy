import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({ fetchLiveJson: vi.fn() }))

import { fetchLiveJson } from '@/services/net/liveClient'

import { getWikidataPlayerImage } from './wikidata'

const fetchMock = vi.mocked(fetchLiveJson)

describe('getWikidataPlayerImage', () => {
  afterEach(() => vi.clearAllMocks())

  it('uses the footballer among the search hits', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('wbsearchentities')) {
        return { search: [{ id: 'Q1', description: 'American actor' }, { id: 'Q2', description: 'Norwegian association football player' }] } as never
      }
      return { entities: { Q2: { claims: { P18: [{ mainsnak: { datavalue: { value: 'Player Portrait.jpg' } } }] } } } } as never
    })

    const image = await getWikidataPlayerImage('Test Footballer One')

    expect(image).toBe('https://commons.wikimedia.org/wiki/Special:FilePath/Player%20Portrait.jpg?width=320')
    expect(fetchMock.mock.calls[1]?.[0]).toContain('ids=Q2')
  })

  it('shows no photo rather than someone else’s when no hit is a footballer', async () => {
    fetchMock.mockResolvedValueOnce({ search: [{ id: 'Q9', description: 'politician' }] } as never)

    expect(await getWikidataPlayerImage('Test Namesake Two')).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
