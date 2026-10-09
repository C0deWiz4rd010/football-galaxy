import { Suspense, useEffect, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { ProxyHealthBanner } from '@/components/layout/ProxyHealthBanner'
import { Sidebar } from '@/components/layout/Sidebar'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Toaster } from '@/components/ui/toast'
import { useLocale } from '@/contexts/LocaleContext'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useLazyDialog } from '@/hooks/useLazyDialog'
import { getLeague } from '@/lib/leagues'
import { lazyWithReload } from '@/lib/lazyWithReload'

import { prefetchRoute, routeModules } from './routeModules'

const ComparePage = lazyWithReload(routeModules.compare)
const CoachDetailPage = lazyWithReload(routeModules.coach)
const LeagueDashboardPage = lazyWithReload(routeModules.league)
const LiveScoresPage = lazyWithReload(routeModules.live)
const PlayerDetailPage = lazyWithReload(routeModules.player)
const PlayersExplorerPage = lazyWithReload(routeModules.players)
const SettingsPage = lazyWithReload(routeModules.settings)
const TeamDetailPage = lazyWithReload(routeModules.team)
const TeamsExplorerPage = lazyWithReload(routeModules.teams)
const worldCupPage = (name: keyof Awaited<ReturnType<typeof routeModules.worldCup>>) =>
  lazyWithReload(() => routeModules.worldCup().then((m) => ({ default: m[name] })))
const WorldCupOverviewPage = worldCupPage('WorldCupOverviewPage')
const WorldCupMatchesPage = worldCupPage('WorldCupMatchesPage')
const WorldCupGroupsPage = worldCupPage('WorldCupGroupsPage')
const WorldCupBracketPage = worldCupPage('WorldCupBracketPage')
const WorldCupTeamsPage = worldCupPage('WorldCupTeamsPage')
const WorldCupMatchDetailPage = worldCupPage('WorldCupMatchDetailPage')
const WorldCupTeamDetailPage = worldCupPage('WorldCupTeamDetailPage')
const NotFoundPage = lazyWithReload(routeModules.notFound)
const GalaxyMapPageLazy = lazyWithReload(routeModules.galaxy)

// Overlays load on first open: none of them is needed for the first paint.
const CommandPalette = lazyWithReload(() => import('@/components/shared/CommandPalette'))
const HandbookDialog = lazyWithReload(() => import('@/components/shared/HandbookDialog'))
const MobileNavSheet = lazyWithReload(() => import('@/components/layout/MobileNavSheet'))

/** Warms route chunks and data when an internal link is hovered or focused. */
function usePrefetchOnIntent() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    const onIntent = (event: Event) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.origin !== window.location.origin) return
      const path = anchor.pathname.startsWith(base) ? anchor.pathname.slice(base.length) || '/' : anchor.pathname
      prefetchRoute(path, queryClient)
    }
    document.addEventListener('pointerover', onIntent, { passive: true })
    document.addEventListener('focusin', onIntent)
    return () => {
      document.removeEventListener('pointerover', onIntent)
      document.removeEventListener('focusin', onIntent)
    }
  }, [queryClient])
}

function LoadingGrid() {
  return <LoadingSpinner />
}

function getLayoutTitle(pathname: string, t: (key: string) => string) {
  const segments = pathname.split('/').filter(Boolean)
  const leagueId = segments[0]

  if (segments[0] === 'galaxy') {
    return {
      title: t('galaxyMap'),
      subtitle: t('subtitleExplore'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'live') {
    return {
      title: t('liveScores'),
      subtitle: t('liveScoresSubtitle'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'world-cup-2026') {
    return {
      title: t('worldCup2026'),
      subtitle: t('worldCupSubtitle'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'players') {
    return {
      title: t('playersExplorer'),
      subtitle: t('subtitlePlayers'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'teams') {
    return {
      title: t('teamsExplorer'),
      subtitle: t('subtitleTeams'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'compare') {
    return {
      title: t('comparePlayers'),
      subtitle: t('subtitleCompare'),
      leagueId: undefined,
    }
  }

  if (segments[0] === 'settings') {
    return {
      title: t('settings'),
      subtitle: t('settingsSubtitle'),
      leagueId: undefined,
    }
  }

  const league = getLeague(leagueId)

  if (segments[1] === 'team') {
    if (segments[3] === 'coach') {
      return {
        title: t('coachDetailTitle'),
        subtitle: `Football Galaxy / ${league.name}`,
        leagueId: league.id,
      }
    }

    return {
      title: t('teamDetailTitle'),
      subtitle: `Football Galaxy / ${league.name}`,
      leagueId: league.id,
    }
  }

  if (segments[1] === 'player') {
    return {
      title: t('playerDetailTitle'),
      subtitle: `Football Galaxy / ${league.name}`,
      leagueId: league.id,
    }
  }

  return {
    title: league.name,
    subtitle: `Football Galaxy / ${league.name}`,
    leagueId: league.id,
  }
}

function AppLayout() {
  const search = useLazyDialog()
  const menu = useLazyDialog()
  const handbook = useLazyDialog()
  const location = useLocation()
  const { t } = useLocale()
  const layout = useMemo(() => getLayoutTitle(location.pathname, t), [location.pathname, t])
  usePrefetchOnIntent()

  useKeyboardShortcut(['k'], (event) => {
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      search.setOpen(!search.open)
    }
  })

  return (
    <>
      <a
        href="#main"
        className="sr-only z-toast rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t('skipToContent')}
      </a>
      <Sidebar />
      <Header
        title={layout.title}
        subtitle={layout.subtitle}
        onSearch={() => search.setOpen(true)}
        onHandbook={() => handbook.setOpen(true)}
      />
      <main id="main" tabIndex={-1} className="outline-none mx-auto max-w-shell px-4 pb-[calc(var(--fg-tabbar-clearance)+1rem)] pt-5 md:ml-shell md:px-6 md:pb-12 lg:px-8">
        <ErrorBoundary key={location.pathname} title={t('routeErrorTitle')}>
          <Suspense fallback={<LoadingGrid />}>
            {/* Keyed so each route fades in; no exit animation holding navigation back. */}
            <div key={location.pathname} className="fg-page">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      <MobileTabBar onSearch={() => search.setOpen(true)} onMenu={() => menu.setOpen(true)} menuOpen={menu.open} />
      <Suspense fallback={null}>
        {menu.mounted ? <MobileNavSheet open={menu.open} onOpenChange={menu.setOpen} onOpenHandbook={() => handbook.setOpen(true)} /> : null}
        {handbook.mounted ? <HandbookDialog open={handbook.open} onOpenChange={handbook.setOpen} /> : null}
        {search.mounted ? <CommandPalette open={search.open} onOpenChange={search.setOpen} /> : null}
      </Suspense>
      <ProxyHealthBanner />
      <Toaster />
    </>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/premier-league" replace />,
      },
      {
        path: 'compare',
        element: <ComparePage />,
      },
      {
        path: 'live',
        element: <LiveScoresPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'players',
        element: <PlayersExplorerPage />,
      },
      {
        path: 'teams',
        element: <TeamsExplorerPage />,
      },
      {
        path: 'galaxy',
        element: <GalaxyMapPageLazy />,
      },
      {
        path: 'world-cup-2026',
        element: <WorldCupOverviewPage />,
      },
      {
        path: 'world-cup-2026/matches',
        element: <WorldCupMatchesPage />,
      },
      {
        path: 'world-cup-2026/groups',
        element: <WorldCupGroupsPage />,
      },
      {
        path: 'world-cup-2026/bracket',
        element: <WorldCupBracketPage />,
      },
      {
        path: 'world-cup-2026/teams',
        element: <WorldCupTeamsPage />,
      },
      {
        path: 'world-cup-2026/match/:matchId',
        element: <WorldCupMatchDetailPage />,
      },
      {
        path: 'world-cup-2026/team/:teamId',
        element: <WorldCupTeamDetailPage />,
      },
      {
        path: ':leagueId',
        element: <LeagueDashboardPage />,
      },
      {
        path: ':leagueId/team/:teamId',
        element: <TeamDetailPage />,
      },
      {
        path: ':leagueId/team/:teamId/coach',
        element: <CoachDetailPage />,
      },
      {
        path: ':leagueId/player/:playerId',
        element: <PlayerDetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})
