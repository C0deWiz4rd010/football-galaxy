import type { LeagueId } from './types'
import type { WorldCupQueryName, WorldCupQueryParams } from './worldCup/types'

/**
 * Query key factory. Keys are hierarchical so whole areas can be invalidated
 * at once (e.g. `queryKeys.football.league(id)` matches every query of a league).
 */
export const queryKeys = {
  football: {
    all: ['football'] as const,
    league: (leagueId: LeagueId | undefined, season: string) => ['football', leagueId, season] as const,
    summary: (leagueId: LeagueId | undefined, season: string) => [...queryKeys.football.league(leagueId, season), 'summary'] as const,
    standings: (leagueId: LeagueId | undefined, season: string) => [...queryKeys.football.league(leagueId, season), 'standings'] as const,
    matches: (leagueId: LeagueId | undefined, season: string) => [...queryKeys.football.league(leagueId, season), 'matches'] as const,
    team: (leagueId: LeagueId | undefined, season: string, teamId: string | undefined) =>
      [...queryKeys.football.league(leagueId, season), 'team', teamId] as const,
    squad: (leagueId: LeagueId | undefined, season: string, teamId: string | undefined) =>
      [...queryKeys.football.league(leagueId, season), 'squad', teamId] as const,
    player: (leagueId: LeagueId | undefined, season: string, playerId: string | undefined) =>
      [...queryKeys.football.league(leagueId, season), 'player', playerId] as const,
  },
  liveScores: (leagueId: LeagueId | 'all') => ['live-scores', leagueId] as const,
  worldCup: (name: WorldCupQueryName, params: WorldCupQueryParams = {}) => ['world-cup-2026', name, params] as const,
}
