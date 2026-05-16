import { describe, expect, it } from 'vitest'

import { mockData } from './index'

describe('mock football data completeness', () => {
  it('provides complete league, team, and player assets for every league', () => {
    for (const [leagueId, league] of Object.entries(mockData)) {
      expect(league.teams.length, `${leagueId} should expose teams`).toBeGreaterThanOrEqual(10)
      expect(league.standings.length, `${leagueId} should expose standings`).toBe(league.teams.length)
      expect(league.topScorers.length, `${leagueId} should expose top scorers`).toBeGreaterThan(0)
      expect(league.topAssists.length, `${leagueId} should expose top assists`).toBeGreaterThan(0)
      expect(league.recentMatches.length, `${leagueId} should expose recent matches`).toBeGreaterThan(0)

      for (const team of league.teams) {
        expect(team.name, `${leagueId} team name`).toBeTruthy()
        expect(team.shortName, `${team.id} short name`).toBeTruthy()
        expect(team.crest, `${team.id} crest`).toMatch(/^data:image\/svg\+xml|^https?:\/\//)
        expect(team.manager, `${team.id} manager`).toBeTruthy()
        expect(team.stadium, `${team.id} stadium`).toBeTruthy()
        expect(team.capacity, `${team.id} capacity`).toBeGreaterThan(0)
        expect(team.squad?.length ?? 0, `${team.id} squad size`).toBeGreaterThanOrEqual(18)

        for (const player of team.squad ?? []) {
          expect(player.name, `${player.id} player name`).toBeTruthy()
          expect(player.photo, `${player.id} player photo`).toMatch(/^data:image\/svg\+xml|^https?:\/\//)
          expect(player.flag, `${player.id} player flag`).toMatch(/^data:image\/svg\+xml/)
          expect(player.stats.minutes, `${player.id} minutes`).toBeGreaterThan(0)
          expect(player.contractUntil, `${player.id} contract`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        }
      }
    }
  })
})