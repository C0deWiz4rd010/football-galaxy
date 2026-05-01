import type { GetStandingsOptions, StandingsProvider } from './provider'
import { getTheSportsDbApiConfig } from '../config/api'
import { getLeagueConfig, type LeagueId } from '../config/leagues'
import { mapTheSportsDbStandings } from '../mappers/standings'
import { theSportsDbSeasonEventsResponseSchema } from '../schemas/the-sports-db'

function estimateCurrentSeasonLabel(date = new Date()) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const startYear = month >= 7 ? year : year - 1

  return `${startYear}-${startYear + 1}`
}

export class TheSportsDbStandingsProvider implements StandingsProvider {
  async getStandings(leagueId: LeagueId, options: GetStandingsOptions = {}) {
    const config = getTheSportsDbApiConfig()
    const league = getLeagueConfig(leagueId)
    const season = estimateCurrentSeasonLabel()

    const response = await fetch(
      `${config.baseUrl}/${config.apiKey}/eventsseason.php?id=${league.theSportsDbLeagueId}&s=${season}`,
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch standings for ${league.label} (${response.status}).`,
      )
    }

    const json = await response.json()
    const parsed = theSportsDbSeasonEventsResponseSchema.parse(json)

    return mapTheSportsDbStandings(leagueId, parsed, options)
  }
}

export const theSportsDbStandingsProvider = new TheSportsDbStandingsProvider()
