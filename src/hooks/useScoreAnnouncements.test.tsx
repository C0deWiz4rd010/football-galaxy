import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { LiveMatch } from '@/services/espn/liveScores'

import { useScoreAnnouncements } from './useScoreAnnouncements'

const team = (name: string, score: number | null) => ({ id: name, name, shortName: name, abbreviation: name, score })
const match = (homeScore: number, state: LiveMatch['state'] = 'live'): LiveMatch => ({
  id: 'm1',
  leagueId: 'premier-league',
  leagueLabel: 'PL',
  state,
  statusLabel: "60'",
  kickoff: null,
  home: team('ARS', homeScore),
  away: team('CHE', 0),
  events: [],
})
const describeMatch = (m: LiveMatch) => `${m.home.name} ${m.home.score}:${m.away.score} ${m.away.name}`

describe('useScoreAnnouncements', () => {
  it('stays quiet on the first data and announces only score changes', () => {
    const { result, rerender } = renderHook(({ matches }) => useScoreAnnouncements(matches, describeMatch), {
      initialProps: { matches: [match(0)] },
    })
    expect(result.current).toBe('')
    rerender({ matches: [match(0)] })
    expect(result.current).toBe('')
    rerender({ matches: [match(1)] })
    expect(result.current).toBe('ARS 1:0 CHE')
  })
})
