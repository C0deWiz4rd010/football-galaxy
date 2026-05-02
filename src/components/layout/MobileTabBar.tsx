import { MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { AssetImage } from '@/components/shared/AssetImage'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'

export function MobileTabBar() {
  return (
    <nav data-mobile-nav className="fixed bottom-0 left-0 z-40 grid h-14 w-full grid-cols-6 border-t border-border/20 bg-background/90 backdrop-blur-xl md:hidden">
      {leagues.map((league) => (
        <NavLink key={league.id} to={`/${league.id}`} className={({ isActive }) => cn('flex flex-col items-center justify-center text-[10px] text-muted-foreground transition duration-150', isActive && 'font-semibold')} style={({ isActive }) => ({ color: isActive ? league.color : undefined })}>
          <AssetImage src={league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt="" className="h-5 w-5 rounded" loading="lazy" />
          <span className="mt-0.5">{league.abbreviation}</span>
        </NavLink>
      ))}
      <NavLink to="/compare" className="flex flex-col items-center justify-center text-[10px] text-muted-foreground">
        <MoreHorizontal className="h-4 w-4" />
        <span>More</span>
      </NavLink>
    </nav>
  )
}
