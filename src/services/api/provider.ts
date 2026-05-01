import type { LeagueId } from '../config/leagues'
import type { LeagueStandings } from '../schemas/domain'

export interface StandingsProvider {
  getStandings(leagueId: LeagueId): Promise<LeagueStandings>
}
