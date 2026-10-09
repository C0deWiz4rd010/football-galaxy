/**
 * Page chunks by route. The router lazy-loads them, and `prefetchRoute` warms
 * the chunk (and the page's main query) when a link is hovered or focused,
 * so navigation usually renders without a spinner.
 */
import type { QueryClient } from '@tanstack/react-query'

import { isLeagueId } from '@/lib/leagues'
import { currentSeasonId } from '@/lib/season'

export const routeModules = {
  compare: () => import('@/pages/Compare'),
  coach: () => import('@/pages/CoachDetail'),
  league: () => import('@/pages/LeagueDashboard'),
  live: () => import('@/pages/LiveScoresPage'),
  player: () => import('@/pages/PlayerDetail'),
  players: () => import('@/pages/PlayersExplorer'),
  settings: () => import('@/pages/Settings'),
  team: () => import('@/pages/TeamDetail'),
  teams: () => import('@/pages/TeamsExplorer'),
  worldCup: () => import('@/pages/world-cup/WorldCupPages'),
  galaxy: () => import('@/features/galaxy-map/GalaxyRoute'),
  notFound: () => import('@/pages/NotFound'),
} as const

type RouteModule = keyof typeof routeModules

function moduleFor(segments: string[]): RouteModule | undefined {
  const [first, second, , fourth] = segments
  if (!first) return 'league'
  if (first === 'world-cup-2026') return 'worldCup'
  if (first in routeModules && first !== 'league' && first !== 'team' && first !== 'player' && first !== 'coach') {
    return first as RouteModule
  }
  if (!isLeagueId(first)) return undefined
  if (second === 'team') return fourth === 'coach' ? 'coach' : 'team'
  if (second === 'player') return 'player'
  return 'league'
}

const warmed = new Set<string>()

export function prefetchRoute(pathname: string, queryClient: QueryClient) {
  if (warmed.has(pathname)) return
  warmed.add(pathname)
  const segments = pathname.split('/').filter(Boolean)
  const module = moduleFor(segments)
  if (module) void routeModules[module]().catch(() => warmed.delete(pathname))

  const [leagueId, kind, id] = segments
  if (!isLeagueId(leagueId)) return
  // The data layer (Zod, providers) stays out of the shell bundle: load it on demand.
  void import('@/hooks/queries/football').then(({ footballQueries }) => {
    const season = currentSeasonId()
    if (!kind) return queryClient.prefetchQuery(footballQueries.summary(leagueId, season))
    if (kind === 'team' && id) return queryClient.prefetchQuery(footballQueries.team(leagueId, season, id))
    if (kind === 'player' && id) return queryClient.prefetchQuery(footballQueries.player(leagueId, season, id))
    return undefined
  })
}
