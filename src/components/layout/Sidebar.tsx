import { Link, NavLink } from 'react-router-dom'
import { BarChart3, CalendarDays, Globe2, Grid3X3, Shield, Star, Trophy, Users, X } from 'lucide-react'

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
      <Link to="/premier-league" className="app-grid-lines relative flex h-16 items-center gap-3 border-b border-white/5 px-4">
        <BrandLogo subtitle="Live dashboard" />
      </Link>

      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <nav className="shrink-0 py-2.5">
          <div className="mb-1 px-3">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('explore')}
            </p>
          </div>
          <NavLink
            to="/players"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-1 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Users className="h-4 w-4 text-sky-400" />
            {t('playersExplorer')}
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-1 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-primary/10 text-foreground shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Shield className="h-4 w-4 text-emerald-400" />
            {t('teamsExplorer')}
          </NavLink>
          <NavLink
            to="/galaxy"
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-2 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition duration-150 hover:border-border/70 hover:bg-background/50',
                isActive
                  ? 'bg-amber-400/10 text-amber-300 shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Globe2 className="h-4 w-4" />
            {t('galaxyMap')}
          </NavLink>

          <div className="mb-1 px-3">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              WM 2026
            </p>
          </div>
          <NavLink
            to="/world-cup-2026"
            end
            className={({ isActive }) =>
              cn(
                'group mx-3 mb-1 flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition duration-150 hover:border-amber-300/40 hover:bg-amber-300/10',
                isActive
                  ? 'border-amber-300/40 bg-amber-300/12 text-amber-100 shadow-[0_14px_32px_rgba(0,0,0,0.12)]'
                  : 'text-muted-foreground hover:text-amber-100',
              )
            }
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            World Cup 2026
          </NavLink>
          <div className="mx-3 mb-2 grid grid-cols-2 gap-1">
            {[
              { to: '/world-cup-2026/matches', label: 'Matches', icon: CalendarDays },
              { to: '/world-cup-2026/groups', label: 'Groups', icon: Grid3X3 },
              { to: '/world-cup-2026/bracket', label: 'Bracket', icon: Trophy },
              { to: '/world-cup-2026/teams', label: 'Teams', icon: Users },
            ].map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[11px] text-muted-foreground transition hover:border-border/60 hover:bg-background/50 hover:text-foreground',
                      isActive && 'border-amber-300/30 bg-amber-300/10 text-amber-100',
                    )
                  }
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>

          <div className="mb-1 px-3">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('leagues')}
            </p>
          </div>
          {leagues.map((league) => (
            <NavLink
              key={league.id}
              to={`/${league.id}`}
              className={({ isActive }) =>
                cn(
                  'group mx-3 flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition duration-150 hover:border-border/70 hover:bg-background/50 hover:text-foreground',
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
                className="h-8 w-8 rounded-lg bg-white/90 object-contain p-1"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate">{league.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{league.country}</p>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/5 p-2.5 text-sm">
          <Link
            to="/compare"
            className="surface-soft flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-background/55 hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4 text-violet-400" /> {t('comparePlayers')}
          </Link>
          <div className="surface-soft rounded-xl p-2.5">
            <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-400" /> {t('favorites')}
              {favorites.teams.length + favorites.players.length > 0 ? (
                <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {favorites.teams.length + favorites.players.length}
                </span>
              ) : null}
            </p>
            {favorites.teams.length + favorites.players.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 px-2.5 py-2 text-[10px] text-muted-foreground">
                <p className="font-medium text-foreground/80">{t('favoritesEmpty')}</p>
                <p className="mt-0.5 line-clamp-2">{t('favoritesEmptyHint')}</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {favorites.teams
                  .map((id) => teams.find((team) => team.id === id))
                  .filter((item): item is NonNullable<typeof item> => Boolean(item))
                  .slice(0, 2)
                  .map((item) => (
                    <li key={`team-${item.id}`} className="group flex items-center gap-2">
                      <Link
                        to={favoriteHref(item)}
                        className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-md px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Shield className="h-3 w-3 shrink-0 opacity-70" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                      <button
                        type="button"
                        aria-label={t('removeFavorite')}
                        title={t('removeFavorite')}
                        onClick={() => favorites.toggleTeam(item.id)}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                {favorites.players
                  .map((id) => players.find((player) => player.id === id))
                  .filter((item): item is NonNullable<typeof item> => Boolean(item))
                  .slice(0, 2)
                  .map((item) => (
                    <li key={`player-${item.id}`} className="group flex items-center gap-2">
                      <Link
                        to={favoriteHref(item)}
                        className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-md px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Users className="h-3 w-3 shrink-0 opacity-70" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                      <button
                        type="button"
                        aria-label={t('removeFavorite')}
                        title={t('removeFavorite')}
                        onClick={() => favorites.togglePlayer(item.id)}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
