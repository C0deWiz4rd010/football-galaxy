import { describe, expect, it } from 'vitest'

import { makeLeagueSummary } from '@/test/fixtures'

import { cachedSearchHits } from './search'

describe('cachedSearchHits', () => {
  it('finds league players and clubs regardless of accents and case', () => {
    const summary = makeLeagueSummary('premier-league', 4)
    const first = summary.playerPool[0]!
    summary.playerPool[0] = { ...first, player: { ...first.player, name: 'Erling Håland' } }

    const hits = cachedSearchHits([summary], 'haland')
    expect(hits.players.map((hit) => hit.name)).toEqual(['Erling Håland'])
    expect(hits.players[0]).toMatchObject({ kind: 'player', leagueId: 'premier-league' })
    expect(cachedSearchHits([summary], 'test club 2').teams.map((hit) => hit.name)).toEqual(['Test Club 2'])
  })
})
