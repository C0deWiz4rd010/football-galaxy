import { Link, NavLink } from 'react-router-dom'
import { BarChart3, Star } from 'lucide-react'
import { AssetImage } from '@/components/shared/AssetImage'
import { leagues } from '@/lib/leagues'
import { useFavorites } from '@/hooks/useFavorites'
import { mockData } from '@/data/mock'
import { cn } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'

export function Sidebar() {
  const favorites = useFavorites()
  const teams = Object.values(mockData).flatMap((league) => league.teams)
  const players = teams.flatMap((team) => team.squad ?? [])
  return (
    <aside data-sidebar className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/5 bg-gray-950/80 backdrop-blur-xl md:flex md:flex-col">
      <Link to="/premier-league" className="flex h-16 items-center gap-3 border-b border-white/5 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sm font-black text-zinc-950">FG</span>
        <div>
          <p className="font-semibold">Football Galaxy</p>
          <p className="text-xs text-zinc-400">Top 5 dashboard</p>
        </div>
      </Link>
      <nav className="flex-1 py-4">
        {leagues.map((league) => (
          <NavLink
            key={league.id}
            to={`/${league.id}`}
            className={({ isActive }) => cn('group flex items-center gap-3 border-l-2 border-transparent px-5 py-3 text-sm text-zinc-300 transition duration-150 hover:bg-white/5 hover:text-white', isActive && 'bg-white/5 text-white')}
            style={({ isActive }) => ({ borderLeftColor: isActive ? league.color : 'transparent' })}
          >
            <AssetImage src={league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt="" className="h-8 w-8 rounded-md object-cover grayscale transition group-hover:grayscale-0" loading="lazy" />
            {league.name}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/5 p-4 text-sm">
        <Link to="/compare" className="flex items-center gap-2 rounded-md px-2 py-2 text-zinc-300 hover:bg-white/5 hover:text-white"><BarChart3 className="h-4 w-4" /> Compare Players</Link>
        <div className="rounded-md bg-white/5 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400"><Star className="h-3.5 w-3.5" /> Favorites</p>
          {[...favorites.teams.map((id) => teams.find((team) => team.id === id)), ...favorites.players.map((id) => players.find((player) => player.id === id))]
            .filter(Boolean)
            .slice(0, 5)
            .map((item) => (
              <Link key={item!.id} to={'leagueId' in item! ? `/${item!.leagueId}/team/${item!.id}` : `/${item!.leagueId}/player/${item!.id}`} className="block truncate py-1 text-xs text-zinc-300 hover:text-white">
                {item!.name}
              </Link>
            ))}
        </div>
      </div>
    </aside>
  )
}
