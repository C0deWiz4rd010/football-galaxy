import { describe, expect, it } from 'vitest'
import { mockData } from './index'

describe('mock football data', () => {
  it('provides complete top-five league dashboards', () => {
    for (const league of Object.values(mockData)) {
      expect(league.standings).toHaveLength(20)
      expect(league.topScorers).toHaveLength(15)
      expect(league.topAssists).toHaveLength(15)
      expect(league.recentMatches).toHaveLength(10)
      expect(league.teams.every((team) => (team.squad?.length ?? 0) >= 18)).toBe(true)
    }
  })
})
