import { MoreHorizontal, Trophy } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { AssetImage } from '@/components/shared/AssetImage'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueLogos } from '@/hooks/useLeagueLogos'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'

export function MobileTabBar() {
  const { t } = useLocale()
  const leagueLogos = useLeagueLogos()

  return (
    <nav data-mobile-nav className="surface-panel fixed bottom-3 left-3 right-3 z-40 grid h-16 grid-cols-7 rounded-[1.6rem] px-1 md:hidden">
      <NavLink
        to="/world-cup-2026"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center rounded-[1.1rem] text-[10px] text-muted-foreground transition duration-150',
            isActive && 'bg-amber-300/10 font-semibold text-amber-100',
          )
        }
      >
        <Trophy className="h-4 w-4 text-amber-300" />
        <span>WM</span>
      </NavLink>
      {leagues.map((league) => (
        <NavLink
          key={league.id}
          to={`/${league.id}`}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center rounded-[1.1rem] text-[10px] text-muted-foreground transition duration-150',
              isActive && 'bg-primary/10 font-semibold',
            )
          }
          style={({ isActive }) => ({ color: isActive ? league.color : undefined })}
        >
          <AssetImage src={leagueLogos[league.id] ?? league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt={league.name} className="h-5 w-5 rounded bg-white/90 object-contain p-[1px]" loading="lazy" />
          <span className="mt-0.5">{league.abbreviation}</span>
        </NavLink>
      ))}
      <NavLink to="/compare" className="flex flex-col items-center justify-center rounded-[1.1rem] text-[10px] text-muted-foreground transition duration-150 hover:bg-background/55">
        <MoreHorizontal className="h-4 w-4" />
        <span>{t('more')}</span>
      </NavLink>
    </nav>
  )
}
