import { getFootballDataApiConfig } from '../config/api'
import { getLeagueConfig, type LeagueId } from '../config/leagues'
import { mapFootballDataStandings } from '../mappers/standings'
import { footballDataStandingsResponseSchema } from '../schemas/football-data'
import type { StandingsProvider } from './provider'

export class FootballDataStandingsProvider implements StandingsProvider {
  async getStandings(leagueId: LeagueId) {
    const config = getFootballDataApiConfig()
    const league = getLeagueConfig(leagueId)

    if (!config.apiToken) {
      throw new Error(
        'Missing VITE_FOOTBALL_DATA_API_TOKEN environment variable.',
      )
    }

    const response = await fetch(
      `${config.baseUrl}/competitions/${league.competitionCode}/standings`,
      {
        headers: {
          'X-Auth-Token': config.apiToken,
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch standings for ${league.label} (${response.status}).`,
      )
    }

    const json = await response.json()
    const parsed = footballDataStandingsResponseSchema.parse(json)

    return mapFootballDataStandings(leagueId, parsed)
  }
}

export const footballDataStandingsProvider =
  new FootballDataStandingsProvider()
