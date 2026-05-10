import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ArrowUpDown, Search, Shield, Trophy, Users } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { getTeamExplorerEntries } from '@/lib/explorer-data'
import { leagues } from '@/lib/leagues'
import { createTeamCrest } from '@/lib/visualAssets'
import type { LeagueId } from '@/services/types'

export default function TeamsExplorer() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<LeagueId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'position' | 'points' | 'goalDifference'>('position')

  const teams = useMemo(
    () =>
      getTeamExplorerEntries(selectedLeagueId === 'all' ? undefined : selectedLeagueId)
        .filter(({ team, league }) => {
          const normalized = query.trim().toLowerCase()

          if (!normalized) {
            return true
          }

          return (
            team.name.toLowerCase().includes(normalized) ||
            team.shortName.toLowerCase().includes(normalized) ||
            league.name.toLowerCase().includes(normalized)
          )
        })
        .sort((left, right) => {
          if (sortBy === 'points') {
            return (right.standing?.points ?? -1) - (left.standing?.points ?? -1)
          }

          if (sortBy === 'goalDifference') {
            return (right.standing?.goalDifference ?? -999) - (left.standing?.goalDifference ?? -999)
          }

          return (left.standing?.position ?? 99) - (right.standing?.position ?? 99)
        }),
    [query, selectedLeagueId, sortBy],
  )

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section className="stat-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Team Explorer
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Browse all available clubs across the top 5 leagues
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Open club pages, scan current table position, and jump into squads from one place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto]">
              <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search clubs or leagues..."
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All leagues' },
                  ...leagues.map((league) => ({ key: league.id, label: league.abbreviation })),
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedLeagueId(item.key as LeagueId | 'all')}
                    className={`app-pill cursor-pointer px-3 py-2 text-sm ${selectedLeagueId === item.key ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="surface-soft rounded-[1.2rem] px-4 py-3 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{teams.length}</span> clubs
            {selectedLeagueId !== 'all' ? ' in the selected league' : ' across all leagues'}.
          </div>
          <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort by</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="bg-transparent font-medium text-foreground outline-none"
            >
              <option value="position">Position</option>
              <option value="points">Points</option>
              <option value="goalDifference">Goal difference</option>
            </select>
          </label>
        </section>

        <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {teams.length === 0 ? (
            <div className="lg:col-span-2 xl:col-span-3">
              <EmptyState
                title="No teams found"
                description="Try another club name or change the league filter."
              />
            </div>
          ) : null}
          {teams.map(({ league, standing, team }) => (
            <Link
              key={team.id}
              to={`/${team.leagueId}/team/${team.id}`}
              className="stat-card interactive-card cursor-pointer p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetImage
                    src={team.crest}
                    fallbackSrc={createTeamCrest(
                      team.shortName,
                      team.primaryColor ?? league.color,
                      team.secondaryColor ?? '#f8fafc',
                      0,
                    )}
                    alt={team.name}
                    className="h-14 w-14 rounded-[1rem] object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{team.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{league.name}</p>
                  </div>
                </div>
                {standing ? (
                  <div className="rounded-2xl border border-border/60 bg-background/40 px-3 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Pos
                    </p>
                    <p className="text-xl font-black">{standing.position}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">{team.shortName}</Badge>
                {standing ? <Badge>#{standing.position} in table</Badge> : null}
                <Badge variant="outline">{(team.squad ?? []).length} players</Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Points
                  </p>
                  <p className="mt-1 font-semibold">{standing?.points ?? '-'}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Goals
                  </p>
                  <p className="mt-1 font-semibold">{standing?.goalsFor ?? '-'}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    GD
                  </p>
                  <p className="mt-1 font-semibold">{standing?.goalDifference ?? '-'}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="stat-card p-4">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">League context first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Each team card keeps the table position visible so the explorer remains tied to the league narrative.
            </p>
          </div>
          <div className="stat-card p-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">Squad jump-off</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Club detail pages remain the richer destination for squad, form, and spotlight-player context.
            </p>
          </div>
          <div className="stat-card p-4">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">More filters next</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This surface is ready for future filters such as manager, stadium, table zone, and mode-aware ranking.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
