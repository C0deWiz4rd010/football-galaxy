import { getTheSportsDbApiConfig } from '../config/api'
import { getLeagueConfig, type LeagueId } from '../config/leagues'
import { mapTheSportsDbStandings } from '../mappers/standings'
import { theSportsDbStandingsResponseSchema } from '../schemas/the-sports-db'
import type { StandingsProvider } from './provider'

export class TheSportsDbStandingsProvider implements StandingsProvider {
  async getStandings(leagueId: LeagueId) {
    const config = getTheSportsDbApiConfig()
    const league = getLeagueConfig(leagueId)

    const response = await fetch(
      `${config.baseUrl}/${config.apiKey}/lookuptable.php?l=${league.theSportsDbLeagueId}`,
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch standings for ${league.label} (${response.status}).`,
      )
    }

    const json = await response.json()
    const parsed = theSportsDbStandingsResponseSchema.parse(json)

    return mapTheSportsDbStandings(leagueId, parsed)
  }
}

export const theSportsDbStandingsProvider = new TheSportsDbStandingsProvider()
