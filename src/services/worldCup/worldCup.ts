import { getSourcePreference } from '@/services/config/dataSource'

import { footballDataWorldCupProvider } from './footballDataProvider'
import { snapshotWorldCupProvider } from './snapshotProvider'
import type { WorldCupProvider, WorldCupQueryParams } from './types'

// World Cup 2026 cascades like the league data: the live source is
// football-data.org (free tier, code `WC`), which returns the real tournament —
// groups, fixtures, results, squads, coaches, referees and official crests —
// through the proxy. Any failure (missing key, offline, rate limit, or an empty
// pre-tournament payload) falls back to a free, offline structural snapshot so
// the area is never blank. Choosing Local Fallback skips the network entirely.
const live: WorldCupProvider = footballDataWorldCupProvider
const fallback: WorldCupProvider = snapshotWorldCupProvider

async function cascade<T>(
  run: (_provider: WorldCupProvider) => Promise<T>,
  isEmpty?: (_result: T) => boolean,
): Promise<T> {
  if (getSourcePreference() === 'fallback') {
    return run(fallback)
  }
  try {
    const result = await run(live)
    // A reachable-but-empty live feed (e.g. proxy running without an
    // API-Football key, or pre-tournament) should still show the free offline
    // structure instead of a blank area.
    if (isEmpty?.(result)) {
      return run(fallback)
    }
    return result
  } catch {
    return run(fallback)
  }
}

function isEmptyArray(result: unknown[]): boolean {
  return result.length === 0
}

export function getWorldCupDashboard() {
  return cascade(
    (provider) => provider.getDashboard(),
    (dashboard) =>
      dashboard.groups.length === 0 &&
      dashboard.teams.length === 0 &&
      dashboard.liveMatches.length === 0 &&
      dashboard.upcomingMatches.length === 0 &&
      dashboard.recentMatches.length === 0,
  )
}

export function getWorldCupFixtures() {
  return cascade((provider) => provider.getFixtures())
}

export function getWorldCupLiveFixtures() {
  return cascade((provider) => provider.getLiveFixtures())
}

export function getWorldCupGroups() {
  return cascade((provider) => provider.getGroups(), isEmptyArray)
}

export function getWorldCupTeams() {
  return cascade((provider) => provider.getTeams(), isEmptyArray)
}

export function getWorldCupTeam(params: WorldCupQueryParams) {
  if (!params.teamId) {
    throw new Error('Missing World Cup team id.')
  }
  const teamId = params.teamId
  return cascade((provider) => provider.getTeam(teamId))
}

export function getWorldCupFixture(params: WorldCupQueryParams) {
  if (!params.matchId) {
    throw new Error('Missing World Cup match id.')
  }
  const matchId = params.matchId
  return cascade((provider) => provider.getFixture(matchId))
}

export function getWorldCupFixtureLineups(params: WorldCupQueryParams) {
  if (!params.matchId) {
    throw new Error('Missing World Cup match id.')
  }
  const matchId = params.matchId
  return cascade((provider) => provider.getFixtureLineups(matchId))
}

export function getWorldCupFixtureStatistics(params: WorldCupQueryParams) {
  if (!params.matchId) {
    throw new Error('Missing World Cup match id.')
  }
  const matchId = params.matchId
  return cascade((provider) => provider.getFixtureStatistics(matchId))
}

export function getWorldCupBracket() {
  return cascade((provider) => provider.getBracket())
}

export * from './types'
