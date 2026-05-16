import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ArrowUpDown, Search, Sparkles, Target } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormBadge } from '@/components/shared/FormBadge'
import { StaggerGrid } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import { searchIndex } from '@/services/footballData'
import type { LeagueId } from '@/services/types'

export default function PlayersExplorer() {
  const { t } = useLocale()
  const [selectedLeagueId, setSelectedLeagueId] = useState<LeagueId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'form' | 'goals' | 'assists'>('form')

  const players = useMemo(
    () =>
      searchIndex.players(selectedLeagueId === 'all' ? undefined : selectedLeagueId)
        .filter(({ player, team, formLabel }) => {
          const normalized = query.trim().toLowerCase()

          if (!normalized) {
            return true
          }

          return (
            player.name.toLowerCase().includes(normalized) ||
            team.name.toLowerCase().includes(normalized) ||
            formLabel.toLowerCase().includes(normalized) ||
            player.position.toLowerCase().includes(normalized)
          )
        })
        .sort((left, right) => {
          if (sortBy === 'goals') {
            return right.player.stats.goals - left.player.stats.goals
          }

          if (sortBy === 'assists') {
            return right.player.stats.assists - left.player.stats.assists
          }

          return right.formScore - left.formScore
        }),
    [query, selectedLeagueId, sortBy],
  )

  return (
    <PageWrapper>
      <StaggerGrid className="space-y-5">
        <StaggerGrid.Item as="section" className="stat-card rounded-fg-xl p-5 shadow-fg-2 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {t('playerExplorerEyebrow')}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {t('playerExplorerTitle')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {t('playerExplorerSubtitle')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_auto]">
              <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={t('searchPlayersPlaceholder')}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: t('allLeagues') },
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
        </StaggerGrid.Item>

        <StaggerGrid.Item as="section" className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="surface-soft rounded-[1.2rem] px-4 py-3 text-sm text-muted-foreground">
            {selectedLeagueId !== 'all'
              ? t('showingPlayersInLeague', { count: players.length })
              : t('showingPlayersAll', { count: players.length })}
          </div>
          <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            <span>{t('sortBy')}</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="bg-transparent font-medium text-foreground outline-none"
            >
              <option value="form">{t('sortForm')}</option>
              <option value="goals">{t('sortGoals')}</option>
              <option value="assists">{t('sortAssists')}</option>
            </select>
          </label>
        </StaggerGrid.Item>

        <StaggerGrid.Item as="section" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {players.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState
                title={t('noPlayersFound')}
                description={t('noPlayersHint')}
              />
            </div>
          ) : null}
          {players.slice(0, 48).map(({ league, player, team, formScore, formLabel, standing }) => (
            <Link
              key={player.id}
              to={`/${player.leagueId}/player/${player.id}`}
              className="stat-card interactive-card cursor-pointer p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetImage
                    src={player.photo}
                    fallbackSrc={[
                      ...getPlayerPhotoSources(player),
                      createPlayerAvatar(
                        initialsFromName(player.name),
                        team.primaryColor ?? league.color,
                      ),
                    ]}
                    alt={player.name}
                    className="h-14 w-14 rounded-fg-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{player.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {team.name} - {league.name}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t('formLabel')}
                  </p>
                  <p className="text-xl font-black">{formScore}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">{player.position}</Badge>
                <FormBadge player={player} variant="label" />
                {standing ? <Badge variant="outline">{t('positionInLeague', { position: standing.position })}</Badge> : null}
                <span className="sr-only">{formLabel}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t('goals')}
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.goals}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t('assists')}
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.assists}</p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t('minutes')}
                  </p>
                  <p className="mt-1 font-semibold">{player.stats.minutes}</p>
                </div>
              </div>
            </Link>
          ))}
        </StaggerGrid.Item>

        <StaggerGrid.Item as="section" className="grid gap-4 lg:grid-cols-3">
          <div className="stat-card p-4">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">{t('scoutingLanes')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('scoutingLanesBody')}
            </p>
          </div>
          <div className="stat-card p-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">{t('shortlistReady')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('shortlistReadyBody')}
            </p>
          </div>
          <div className="stat-card p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-semibold">{t('fastNavigation')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('fastNavigationBody')}
            </p>
          </div>
        </StaggerGrid.Item>
      </StaggerGrid>
    </PageWrapper>
  )
}
