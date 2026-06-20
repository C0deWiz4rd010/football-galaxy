import { Suspense, lazy, useCallback, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
  useSearchParams,
} from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { MatchdaySwiper } from '@/components/layout/MatchdaySwiper'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Toaster } from '@/components/ui/toast'
import { useLocale } from '@/contexts/LocaleContext'
import { getLeague, isLeagueId, leagues } from '@/lib/leagues'
import { pageMotion } from '@/shared/motion/tokens'

const ComparePage = lazy(() => import('@/pages/Compare'))
const CoachDetailPage = lazy(() => import('@/pages/CoachDetail'))
const LeagueDashboardPage = lazy(() => import('@/pages/LeagueDashboard'))
const PlayerDetailPage = lazy(() => import('@/pages/PlayerDetail'))
const PlayersExplorerPage = lazy(() => import('@/pages/PlayersExplorer'))
const SettingsPage = lazy(() => import('@/pages/Settings'))
const TeamDetailPage = lazy(() => import('@/pages/TeamDetail'))
const TeamsExplorerPage = lazy(() => import('@/pages/TeamsExplorer'))
const WorldCupOverviewPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupOverviewPage })),
)
const WorldCupMatchesPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupMatchesPage })),
)
const WorldCupGroupsPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupGroupsPage })),
)
const WorldCupBracketPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupBracketPage })),
)
const WorldCupTeamsPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupTeamsPage })),
)
const WorldCupMatchDetailPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupMatchDetailPage })),
)
const WorldCupTeamDetailPage = lazy(() =>
  import('@/pages/world-cup/WorldCupPages').then((m) => ({ default: m.WorldCupTeamDetailPage })),
)

const GalaxyMapPageLazy = lazy(() =>
  import('@/features/galaxy-map/GalaxyMapPage').then((m) => ({ default: m.GalaxyMapPage })),
)

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
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'world-cup-2026') {
    return {
      title: 'World Cup 2026',
      subtitle: 'Football Galaxy / Tournament command center',
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'players') {
    return {
      title: t('playersExplorer'),
      subtitle: t('subtitlePlayers'),
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'teams') {
    return {
      title: t('teamsExplorer'),
      subtitle: t('subtitleTeams'),
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'compare') {
    return {
      title: t('comparePlayers'),
      subtitle: t('subtitleCompare'),
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'settings') {
    return {
      title: t('settings'),
      subtitle: t('settingsSubtitle'),
      showSwiper: false,
      leagueId: undefined,
    }
  }

  const league = getLeague(leagueId)

  if (segments[1] === 'team') {
    if (segments[3] === 'coach') {
      return {
        title: t('coachDetailTitle'),
        subtitle: `Football Galaxy / ${league.name}`,
        showSwiper: false,
        leagueId: league.id,
      }
    }

    return {
      title: t('teamDetailTitle'),
      subtitle: `Football Galaxy / ${league.name}`,
      showSwiper: false,
      leagueId: league.id,
    }
  }

  if (segments[1] === 'player') {
    return {
      title: t('playerDetailTitle'),
      subtitle: `Football Galaxy / ${league.name}`,
      showSwiper: false,
      leagueId: league.id,
    }
  }

  return {
    title: league.name,
    subtitle: `Football Galaxy / ${league.name}`,
    showSwiper: isLeagueId(leagueId),
    leagueId: league.id,
  }
}

function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { t } = useLocale()
  const layout = useMemo(() => getLayoutTitle(location.pathname, t), [location.pathname, t])

  const matchday = Number(searchParams.get('matchday') ?? 0)

  const handleMatchdaySelect = useCallback(
    (value: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('matchday', String(value))
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  return (
    <>
      <Sidebar />
      <Header
        title={layout.title}
        subtitle={layout.subtitle}
        onSearch={() => setSearchOpen(true)}
        onMenu={() => setMobileMenuOpen((value) => !value)}
      />
      {layout.showSwiper && layout.leagueId ? (
        <MatchdaySwiper
          leagueId={layout.leagueId}
          matchday={matchday}
          onSelect={handleMatchdaySelect}
        />
      ) : null}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute inset-x-4 top-20 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur"
            onClick={(event) => event.stopPropagation()}
          >
            <nav className="space-y-2">
              <Link
                to="/players"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border px-4 py-3 text-sm font-medium"
              >
                {t('playersExplorer')}
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border px-4 py-3 text-sm font-medium"
              >
                {t('teamsExplorer')}
              </Link>
              <Link
                to="/world-cup-2026"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100"
              >
                World Cup 2026
              </Link>
              {leagues.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/${item.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl border px-4 py-3 text-sm font-medium"
                >
                  {item.name}
                </NavLink>
              ))}
              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-fg-md border border-border/55 px-4 py-3 text-sm font-medium"
              >
                {t('comparePlayers')}
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-fg-md border border-border/55 px-4 py-3 text-sm font-medium"
              >
                {t('settings')}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-5 md:ml-64 md:px-6 lg:px-8">
        <Suspense fallback={<LoadingGrid />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={pageMotion.initial}
              animate={pageMotion.animate}
              exit={pageMotion.exit}
              transition={pageMotion.transition}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <MobileTabBar />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
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
    ],
  },
])
