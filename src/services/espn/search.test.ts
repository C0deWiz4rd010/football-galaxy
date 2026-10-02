import { describe, expect, it, vi } from 'vitest'

vi.mock('@/services/net/liveClient', () => ({ fetchLiveJson: vi.fn(), LiveHttpError: class extends Error {} }))

import { fetchLiveJson } from '@/services/net/liveClient'

import { searchFootball } from './search'

describe('searchFootball', () => {
  it('keeps only top-5 league hits and cleans subtitles', async () => {
    vi.mocked(fetchLiveJson).mockImplementation(async (url: string) =>
      (url.includes('type=team')
        ? { items: [{ id: '132', displayName: 'Bayern München', league: 'ger.1' }, { id: '20103', displayName: 'Bayern München', league: 'uefa.wchampions' }] }
        : {
            items: [
              { id: '1', displayName: 'Florian Wirtz', league: 'club.friendly', leagueRelationships: [{ core: { slug: 'eng.1' } }], teamRelationships: [{ displayName: 'Liverpool (Club Friendly)' }] },
              { id: '2', displayName: 'Thomas Müller', league: 'usa.1', teamRelationships: [{ displayName: 'Vancouver Whitecaps (MLS)' }] },
              { id: '3', displayName: 'Retired Player', league: 'eng.1', isActive: false },
            ],
          }) as never,
    )

    const result = await searchFootball('x')

    expect(result.teams).toEqual([{ kind: 'team', id: '132', name: 'Bayern München', leagueId: 'bundesliga', image: undefined }])
    expect(result.players).toEqual([
      { kind: 'player', id: 'espn-1', name: 'Florian Wirtz', leagueId: 'premier-league', subtitle: 'Liverpool', image: undefined },
    ])
  })
})
