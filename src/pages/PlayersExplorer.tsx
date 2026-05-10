import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Search, Sparkles, Target } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { Badge } from '@/components/ui/badge'
import { getPlayerExplorerEntries } from '@/lib/explorer-data'
import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { LeagueId } from '@/services/types'

export default function PlayersExplorer() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<LeagueId | 'all'>('all')
  const [query, setQuery] = useState('')

  const players = useMemo(
    () =>
      getPlayerExplorerEntries(selectedLeagueId === 'all' ? undefined : selectedLeagueId)
        .filter(({ player, team, archetype }) => {
          const normalized = query.trim().toLowerCase()

          if (!normalized) {
            return true
          }

          return (
            player.name.toLowerCase().includes(normalized) ||
            team.name.toLowerCase().includes(normalized) ||
            archetype.toLowerCase().includes(normalized) ||
            player.position.toLowerCase().includes(normalized)
          )
        })
        .sort((left, right) => right.overall - left.overall),
    [query, selectedLeagueId],
  )

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section className="stat-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Player Explorer
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Browse the available player pool
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Search by player, role, team, or archetype and jump directly into profiles.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto]">
              <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search players, clubs, roles..."
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeagueId('all')}
                  className={`app-pill px-3 py-2 text-sm ${selectedLeagueId === 'all' ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground'}`}
                >
                  All leagues
                </button>
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => setSelectedLeagueId(league.id)}
                    className={`app-pill px-3 py-2 text-sm ${selectedLeagueId === league.id ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground'}`}
                  >
                    {league.abbreviation}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {players.slice(0, 48).map(({ league, player, team, overall, archetype, standing }) => (
            <Link
              key={player.id}
              to={`/${player.leagueId}/player/${player.id}`}
              className="stat-card interactive-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetImage
                    src={player.photo}
                    fallbackSrc={createPlayerAvatar(
                      initialsFromName(player.name),
                      team.primaryColor ?? league.color,
                    )}
                    alt={player.name}
                    className="h-14 w-14 rounded-[1.1rem] object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{player.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {team.name} · {league.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    OVR
                  </p>
                  <p className="text-xl font-black">{overall}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">{player.position}</Badge>
                <Badge>{archetype}</Badge>
                {standing ? <Badge variant="outline">#{standing.position} in league</Badge> : null}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Goals
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.goals}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Assists
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.assists}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Minutes
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.minutes}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="stat-card p-4">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Scouting lanes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this page as the quick directory for breakout players, high-OVR cards, or role-based browsing.
            </p>
          </div>
          <div className="stat-card p-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Shortlist ready</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The next refinement can add favorites, compare shortcuts, and stronger stat filters directly here.
            </p>
          </div>
          <div className="stat-card p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Fast navigation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This view mirrors the command palette so player discovery feels consistent across the app.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
