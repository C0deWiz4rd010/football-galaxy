import { Suspense, lazy, useMemo, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { MatchdaySwiper } from '@/components/layout/MatchdaySwiper'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Toaster } from '@/components/ui/toast'
import { getLeague, isLeagueId, leagues } from '@/lib/leagues'
import { pageMotion } from '@/shared/motion/tokens'

const ComparePage = lazy(() => import('@/pages/Compare'))
const CoachDetailPage = lazy(() => import('@/pages/CoachDetail'))
const LeagueDashboardPage = lazy(() => import('@/pages/LeagueDashboard'))
const PlayerDetailPage = lazy(() => import('@/pages/PlayerDetail'))
const PlayersExplorerPage = lazy(() => import('@/pages/PlayersExplorer'))
const TeamDetailPage = lazy(() => import('@/pages/TeamDetail'))
const TeamsExplorerPage = lazy(() => import('@/pages/TeamsExplorer'))

function LoadingGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

function getLayoutTitle(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const leagueId = segments[0]

  if (segments[0] === 'players') {
    return {
      title: 'Players Explorer',
      subtitle: 'Football Galaxy / Global Player Catalog',
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'teams') {
    return {
      title: 'Teams Explorer',
      subtitle: 'Football Galaxy / Global Club Catalog',
      showSwiper: false,
      leagueId: undefined,
    }
  }

  if (segments[0] === 'compare') {
    return {
      title: 'Compare Players',
      subtitle: 'Football Galaxy / Player Comparison',
      showSwiper: false,
      leagueId: undefined,
    }
  }

  const league = getLeague(leagueId)

  if (segments[1] === 'team') {
    if (segments[3] === 'coach') {
      return {
        title: 'Coach Detail',
        subtitle: `Football Galaxy / ${league.name}`,
        showSwiper: false,
        leagueId: league.id,
      }
    }

    return {
      title: 'Team Detail',
      subtitle: `Football Galaxy / ${league.name}`,
      showSwiper: false,
      leagueId: league.id,
    }
  }

  if (segments[1] === 'player') {
    return {
      title: 'Player Detail',
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
  const [matchday, setMatchday] = useState(0)
  const location = useLocation()
  const layout = useMemo(() => getLayoutTitle(location.pathname), [location.pathname])

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
          onSelect={setMatchday}
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
                Players Explorer
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl border px-4 py-3 text-sm font-medium"
              >
                Teams Explorer
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
                className="block rounded-xl border px-4 py-3 text-sm font-medium"
              >
                Compare Players
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
        path: 'players',
        element: <PlayersExplorerPage />,
      },
      {
        path: 'teams',
        element: <TeamsExplorerPage />,
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
