import { Suspense, lazy, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { createBrowserRouter, Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'

import { Header } from '@/components/layout/Header'
import { MatchdaySwiper } from '@/components/layout/MatchdaySwiper'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Toaster } from '@/components/ui/toast'
import { getLeague, isLeagueId, leagues } from '@/lib/leagues'

const ComparePage = lazy(() => import('@/pages/Compare'))
const LeagueDashboardPage = lazy(() => import('@/pages/LeagueDashboard'))
const PlayerDetailPage = lazy(() => import('@/pages/PlayerDetail'))
const TeamDetailPage = lazy(() => import('@/pages/TeamDetail'))

function LoadingGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [matchday, setMatchday] = useState(0)
  const location = useLocation()
  const [, leagueId, entity] = location.pathname.split('/')
  const showSwiper = isLeagueId(leagueId)
  const league = getLeague(leagueId)
  const title =
    entity === 'team'
      ? 'Team Detail'
      : entity === 'player'
        ? 'Player Detail'
        : location.pathname === '/compare'
          ? 'Compare Players'
          : league.name

  return (
    <>
      <Sidebar />
      <Header
        title={title}
        subtitle={`Football Galaxy / ${league.name}`}
        onSearch={() => setSearchOpen(true)}
        onMenu={() => setMobileMenuOpen((value) => !value)}
      />
      {showSwiper ? (
        <MatchdaySwiper
          leagueId={league.id}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
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
        path: ':leagueId',
        element: <LeagueDashboardPage />,
      },
      {
        path: ':leagueId/team/:teamId',
        element: <TeamDetailPage />,
      },
      {
        path: ':leagueId/player/:playerId',
        element: <PlayerDetailPage />,
      },
    ],
  },
])
