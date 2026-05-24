import type { LeagueId } from '../config/leagues'
import type { LeagueStandings } from '../schemas/domain'

export type GetStandingsOptions = {
  matchday?: number | null
}

export interface StandingsProvider {
  getStandings(
    leagueId: LeagueId,
    options?: GetStandingsOptions,
  ): Promise<LeagueStandings>
}
