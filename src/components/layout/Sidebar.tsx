import { Link, NavLink } from 'react-router-dom'
import { BarChart3, Globe2, Shield, Star, Users } from 'lucide-react'

import { AssetImage } from '@/components/shared/AssetImage'
import { BrandLogo } from '@/shared/ui/brand-logo'
import { mockData } from '@/data/mock'
import { useFavorites } from '@/hooks/useFavorites'
import { useLeagueLogos } from '@/hooks/useLeagueLogos'
import { useLocale } from '@/contexts/LocaleContext'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'

function favoriteHref(item: { id: string; leagueId: string; teamId?: string }) {
  return item.teamId
    ? `/${item.leagueId}/player/${item.id}`
    : `/${item.leagueId}/team/${item.id}`
}

export function Sidebar() {
  const favorites = useFavorites()
  const leagueLogos = useLeagueLogos()
  const { t } = useLocale()
  const teams = Object.values(mockData).flatMap((league) => league.teams)
  const players = teams.flatMap((team) => team.squad ?? [])

  return (
    <aside
      data-sidebar
      className="surface-panel fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 overflow-hidden rounded-[2rem] md:flex md:flex-col"
    >
      <Link to="/premier-league" className="app-grid-lines relative flex h-20 items-center gap-3 border-b border-white/5 px-5">
        <BrandLogo subtitle="Live football dashboard" />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="min-h-0 flex-1 overflow-y-auto py-4">
          <div className="mb-3 px-3">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('explore')}
            </p>
          </div>
          <NavLink
            to="/players"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-1 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Users className="h-4 w-4" />
            {t('playersExplorer')}
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-1 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Shield className="h-4 w-4" />
            {t('teamsExplorer')}
          </NavLink>
          <NavLink
            to="/galaxy"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-amber-400/10 text-amber-300 shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Globe2 className="h-4 w-4" />
            {t('galaxyMap')}
          </NavLink>

          <div className="mb-3 px-3">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('leagues')}
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
                boxShadow: isActive ? `0 0 0 1px ${league.color}22 inset` : undefined,
              })}
            >
              <AssetImage
                src={leagueLogos[league.id] ?? league.logo}
                fallbackSrc={league.logo}
                alt={league.name}
                className="h-9 w-9 rounded-xl bg-white/90 object-contain p-1"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate">{league.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{league.country}</p>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/5 p-4 text-sm">
          <Link
            to="/compare"
            className="surface-soft flex items-center gap-2 rounded-2xl px-3 py-3 text-muted-foreground transition hover:bg-background/55 hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4" /> {t('comparePlayers')}
          </Link>
          <div className="surface-soft rounded-2xl p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Star className="h-3.5 w-3.5" /> {t('favorites')}
            </p>
            {[...favorites.teams.map((id) => teams.find((team) => team.id === id)), ...favorites.players.map((id) => players.find((player) => player.id === id))]
              .filter(Boolean)
              .slice(0, 5)
              .map((item) => (
                <Link
                  key={item!.id}
                  to={favoriteHref(item!)}
                  className="block truncate py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {item!.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
