import { useEffect } from 'react'

import { Menu, RadioTower, Search, Trophy } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { readLastLeague, rememberLeague } from '@/app/navigation'
import { useLocale } from '@/contexts/LocaleContext'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { cn } from '@/lib/utils'

const tabClass = (isActive: boolean, activeTone = 'text-foreground') =>
  cn(
    'relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg text-2xs font-medium transition-colors duration-fg-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    isActive ? cn('bg-foreground/8', activeTone) : 'text-muted-foreground hover:text-foreground',
  )

function TabButton({ label, icon, onClick, pressed }: { label: string; icon: ReactNode; onClick: () => void; pressed?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={pressed} className={tabClass(Boolean(pressed))}>
      {icon}
      <span className="max-w-full truncate">{label}</span>
    </button>
  )
}

/**
 * Bottom navigation on phones: five targets (league, live, World Cup, search,
 * menu). The league tab follows the league the user is in or last visited;
 * every other destination lives in the menu sheet.
 */
export function MobileTabBar({ onSearch, onMenu, menuOpen }: { onSearch: () => void; onMenu: () => void; menuOpen: boolean }) {
  const { t } = useLocale()
  const { pathname } = useLocation()
  const routeLeague = pathname.split('/')[1]
  const currentLeague = isLeagueId(routeLeague) ? routeLeague : undefined

  useEffect(() => {
    if (currentLeague) rememberLeague(currentLeague)
  }, [currentLeague])

  const league = getLeague(currentLeague ?? readLastLeague() ?? undefined)

  return (
    <nav
      data-mobile-nav
      aria-label={t('mobileNavigation')}
      className="surface-panel fixed bottom-[calc(var(--fg-shell-gutter)+env(safe-area-inset-bottom,0px))] left-shell-gutter right-shell-gutter z-nav grid h-tabbar grid-cols-5 gap-1 rounded-xl p-1 md:hidden"
    >
      <NavLink to={`/${league.id}`} className={({ isActive }) => tabClass(isActive || Boolean(currentLeague))}>
        <img src={league.logo} alt="" width={20} height={20} decoding="async" className="h-5 w-5 rounded-xs bg-white/90 object-contain p-px" />
        <span className="max-w-full truncate">{league.abbreviation}</span>
      </NavLink>
      <NavLink to="/live" className={({ isActive }) => tabClass(isActive, 'text-live')}>
        <RadioTower className="h-5 w-5" aria-hidden />
        <span>{t('live')}</span>
      </NavLink>
      <NavLink to="/world-cup-2026" className={({ isActive }) => tabClass(isActive, 'text-warning-fg')}>
        <Trophy className="h-5 w-5" aria-hidden />
        <span>{t('worldCupShort')}</span>
      </NavLink>
      <TabButton label={t('search')} icon={<Search className="h-5 w-5" aria-hidden />} onClick={onSearch} />
      <TabButton label={t('more')} icon={<Menu className="h-5 w-5" aria-hidden />} onClick={onMenu} pressed={menuOpen} />
    </nav>
  )
}
