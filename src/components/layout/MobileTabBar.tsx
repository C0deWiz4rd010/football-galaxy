import { MoreHorizontal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { AssetImage } from '@/components/shared/AssetImage'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'

export function MobileTabBar() {
  return (
    <nav data-mobile-nav className="surface-panel fixed bottom-3 left-3 right-3 z-40 grid h-16 grid-cols-6 rounded-[1.6rem] px-1 md:hidden">
      {leagues.map((league) => (
        <NavLink key={league.id} to={`/${league.id}`} className={({ isActive }) => cn('flex flex-col items-center justify-center rounded-[1.1rem] text-[10px] text-muted-foreground transition duration-150', isActive && 'bg-white/8 font-semibold')} style={({ isActive }) => ({ color: isActive ? league.color : undefined })}>
          <AssetImage src={league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt="" className="h-5 w-5 rounded" loading="lazy" />
          <span className="mt-0.5">{league.abbreviation}</span>
        </NavLink>
      ))}
      <NavLink to="/compare" className="flex flex-col items-center justify-center rounded-[1.1rem] text-[10px] text-muted-foreground transition duration-150 hover:bg-white/8">
        <MoreHorizontal className="h-4 w-4" />
        <span>More</span>
      </NavLink>
    </nav>
  )
}
