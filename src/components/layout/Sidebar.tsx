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
    <aside data-sidebar className="surface-panel fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 flex-col overflow-hidden rounded-[2rem] md:flex">
      <Link to="/premier-league" className="app-grid-lines relative flex h-20 items-center gap-3 border-b border-white/5 px-5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-zinc-950 shadow-[0_12px_24px_rgba(255,255,255,0.12)]">FG</span>
        <div>
          <p className="font-semibold text-white">Football Galaxy</p>
          <p className="text-xs text-zinc-400">Modern matchday intelligence</p>
        </div>
      </Link>
      <nav className="flex-1 py-4">
        {leagues.map((league) => (
          <NavLink
            key={league.id}
            to={`/${league.id}`}
            className={({ isActive }) =>
              cn(
                'group mx-3 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-zinc-300 transition duration-150 hover:border-white/10 hover:bg-white/6 hover:text-white',
                isActive && 'bg-white/8 text-white shadow-[0_14px_32px_rgba(0,0,0,0.22)]',
              )
            }
            style={({ isActive }) => ({
              borderColor: isActive ? `${league.color}55` : undefined,
              boxShadow: isActive
                ? `0 0 0 1px ${league.color}22 inset`
                : undefined,
            })}
          >
            <AssetImage src={league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt="" className="h-9 w-9 rounded-xl object-cover grayscale transition group-hover:grayscale-0" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="truncate">{league.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{league.country}</p>
            </div>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: league.color }}
            />
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/5 p-4 text-sm">
        <Link to="/compare" className="surface-soft flex items-center gap-2 rounded-2xl px-3 py-3 text-zinc-300 transition hover:bg-white/10 hover:text-white"><BarChart3 className="h-4 w-4" /> Compare Players</Link>
        <div className="surface-soft rounded-2xl p-3">
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
