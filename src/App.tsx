import { lazy, Suspense, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { DataSourceProvider } from '@/contexts/DataSourceContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { MatchdaySwiper } from '@/components/layout/MatchdaySwiper'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Toaster } from '@/components/ui/toast'
import { isLeagueId, leagues } from '@/lib/leagues'

const LeagueDashboard = lazy(() => import('@/pages/LeagueDashboard'))
const TeamDetail = lazy(() => import('@/pages/TeamDetail'))
const PlayerDetail = lazy(() => import('@/pages/PlayerDetail'))
const Compare = lazy(() => import('@/pages/Compare'))

function RouteShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [matchday, setMatchday] = useState(0)
  const location = useLocation()
  const leagueId = location.pathname.split('/')[1]
  const showSwiper = isLeagueId(leagueId)

  return (
    <>
      <Sidebar />
      <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMobileMenuOpen((value) => !value)} />
      {showSwiper ? <MatchdaySwiper leagueId={leagueId} matchday={matchday} onSelect={setMatchday} /> : null}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-x-4 top-20 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur" onClick={(event) => event.stopPropagation()}>
            <nav className="space-y-2">
              {leagues.map((league) => (
                <NavLink key={league.id} to={`/${league.id}`} onClick={() => setMobileMenuOpen(false)} className="block rounded-xl border px-4 py-3 text-sm font-medium">
                  {league.name}
                </NavLink>
              ))}
              <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl border px-4 py-3 text-sm font-medium">
                Compare Players
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-5 md:ml-64 md:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="grid gap-4 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/premier-league" replace />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/:leagueId" element={<LeagueDashboard />} />
              <Route path="/:leagueId/team/:teamId" element={<TeamDetail />} />
              <Route path="/:leagueId/player/:playerId" element={<PlayerDetail />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <MobileTabBar />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <Toaster />
    </>
  )
}

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <DataSourceProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <RouteShell />
          </BrowserRouter>
        </FavoritesProvider>
      </DataSourceProvider>
    </ThemeProvider>
  )
}
