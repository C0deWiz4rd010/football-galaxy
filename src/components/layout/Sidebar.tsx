import { Link, NavLink } from 'react-router-dom'
import { BarChart3, Star } from 'lucide-react'
import { AssetImage } from '@/components/shared/AssetImage'
import { leagues } from '@/lib/leagues'
import { useFavorites } from '@/hooks/useFavorites'
import { useLeagueLogos } from '@/hooks/useLeagueLogos'
import { mockData } from '@/data/mock'
import { cn } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'
import { LayoutGrid, Shield, Users } from 'lucide-react'

export function Sidebar() {
  const favorites = useFavorites()
  const leagueLogos = useLeagueLogos()
  const teams = Object.values(mockData).flatMap((league) => league.teams)
  const players = teams.flatMap((team) => team.squad ?? [])

  return (
    <aside data-sidebar className="surface-panel fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 flex-col overflow-hidden rounded-[2rem] md:flex">
      <Link to="/premier-league" className="app-grid-lines relative flex h-20 items-center gap-3 border-b border-white/5 px-5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-zinc-950 shadow-[0_12px_24px_rgba(255,255,255,0.12)]">FG</span>
        <div>
          <p className="font-semibold text-foreground">Football Galaxy</p>
          <p className="text-xs text-muted-foreground">Modern matchday intelligence</p>
        </div>
      </Link>
      <nav className="flex-1 py-4">
        <div className="mb-3 px-3">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Explore
          </p>
        </div>
        <NavLink
          to="/players"
          className={({ isActive }) =>
            cn(
              'group mx-3 mb-1 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
              isActive ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <Users className="h-4 w-4" />
          Players
        </NavLink>
        <NavLink
          to="/teams"
          className={({ isActive }) =>
            cn(
              'group mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
              isActive ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]' : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          <Shield className="h-4 w-4" />
          Teams
        </NavLink>
        <div className="mb-3 px-3">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Leagues
          </p>
        </div>
        {leagues.map((league) => (
          <NavLink
            key={league.id}
            to={`/${league.id}`}
            className={({ isActive }) =>
              cn(
                'group mx-3 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-muted-foreground transition duration-150 hover:border-border/70 hover:bg-background/50 hover:text-foreground',
                isActive && 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]',
              )
            }
            style={({ isActive }) => ({
              borderColor: isActive ? `${league.color}55` : undefined,
              boxShadow: isActive
                ? `0 0 0 1px ${league.color}22 inset`
                : undefined,
            })}
          >
            <AssetImage src={leagueLogos[league.id] ?? league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt="" className="h-9 w-9 rounded-xl object-cover transition group-hover:scale-[1.03]" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="truncate">{league.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{league.country}</p>
            </div>
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: league.color }}
            />
          </NavLink>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/5 p-4 text-sm">
        <Link to="/compare" className="surface-soft flex items-center gap-2 rounded-2xl px-3 py-3 text-muted-foreground transition hover:bg-background/55 hover:text-foreground"><BarChart3 className="h-4 w-4" /> Compare Players</Link>
        <div className="surface-soft rounded-2xl px-3 py-3 text-muted-foreground">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="font-medium text-foreground">Current focus</span>
          </div>
          <p className="mt-2 text-xs">Standings first. Deep views open from table, search, and explorer pages.</p>
        </div>
        <div className="surface-soft rounded-2xl p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Star className="h-3.5 w-3.5" /> Favorites</p>
          {[...favorites.teams.map((id) => teams.find((team) => team.id === id)), ...favorites.players.map((id) => players.find((player) => player.id === id))]
            .filter(Boolean)
            .slice(0, 5)
            .map((item) => (
              <Link key={item!.id} to={'leagueId' in item! ? `/${item!.leagueId}/team/${item!.id}` : `/${item!.leagueId}/player/${item!.id}`} className="block truncate py-1 text-xs text-muted-foreground hover:text-foreground">
                {item!.name}
              </Link>
            ))}
        </div>
      </div>
    </aside>
  )
}
