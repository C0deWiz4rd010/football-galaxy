import { describe, expect, it } from 'vitest'
import { mockData } from './index'

describe('mock football data', () => {
  it('provides complete top-five league dashboards', () => {
    for (const league of Object.values(mockData)) {
      // Premier League / La Liga / Serie A have 20 clubs; Bundesliga & Ligue 1 have 18.
      expect([18, 20]).toContain(league.standings.length)
      expect(league.standings.length).toBe(league.teams.length)
      expect(league.topScorers).toHaveLength(15)
      expect(league.topAssists).toHaveLength(15)
      expect(league.recentMatches.length).toBeGreaterThanOrEqual(9)
      expect(league.teams.every((team) => (team.squad?.length ?? 0) >= 18)).toBe(true)
    }
  })
})
