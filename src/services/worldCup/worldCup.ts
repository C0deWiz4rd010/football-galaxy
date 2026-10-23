import { footballDataWorldCupProvider as provider } from './footballDataProvider'
import type { WorldCupQueryParams } from './types'

// World Cup 2026 is served live from football-data.org (competition `WC`)
// through the proxy. The tournament ended on 2026-07-19, so the area is an
// archive: the query layer loads each payload once and caches it for a long
// time instead of polling. There is deliberately no offline fallback; failures
// surface as an honest error state.

function required(value: string | undefined, label: string): string {
  if (!value) throw new Error(`Missing World Cup ${label}.`)
  return value
}

export const getWorldCupDashboard = () => provider.getDashboard()
export const getWorldCupFixtures = () => provider.getFixtures()
export const getWorldCupLiveFixtures = () => provider.getLiveFixtures()
export const getWorldCupGroups = () => provider.getGroups()
export const getWorldCupTeams = () => provider.getTeams()
export const getWorldCupBracket = () => provider.getBracket()
export const getWorldCupTeam = (params: WorldCupQueryParams) => provider.getTeam(required(params.teamId, 'team id'))
export const getWorldCupFixture = (params: WorldCupQueryParams) => provider.getFixture(required(params.matchId, 'match id'))
export const getWorldCupFixtureLineups = (params: WorldCupQueryParams) =>
  provider.getFixtureLineups(required(params.matchId, 'match id'))
export const getWorldCupFixtureStatistics = (params: WorldCupQueryParams) =>
  provider.getFixtureStatistics(required(params.matchId, 'match id'))

export * from './types'
