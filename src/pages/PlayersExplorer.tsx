import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ArrowUpDown, Search, Sparkles, Target, Zap } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormBadge } from '@/components/shared/FormBadge'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import { searchIndex } from '@/services/footballData'
import type { LeagueId } from '@/services/types'

type SortKey = 'goals' | 'assists' | 'form' | 'minutes'
type PositionFilter = 'all' | 'GK' | 'DF' | 'MF' | 'FW'

const POSITION_LABELS: Record<PositionFilter, string> = {
  all: 'Alle',
  GK: 'TW',
  DF: 'ABW',
  MF: 'MF',
  FW: 'ST',
}

export default function PlayersExplorer() {
  const { t } = useLocale()
  const [selectedLeagueId, setSelectedLeagueId] = useState<LeagueId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('goals')
  const [position, setPosition] = useState<PositionFilter>('all')

  const players = useMemo(
    () =>
      searchIndex
        .players(selectedLeagueId === 'all' ? undefined : selectedLeagueId)
        .filter(({ player, team, formLabel }) => {
          // position filter
          if (position !== 'all' && player.position !== position) return false

          // text search
          const normalized = query.trim().toLowerCase()
          if (!normalized) return true

          return (
            player.name.toLowerCase().includes(normalized) ||
            team.name.toLowerCase().includes(normalized) ||
            formLabel.toLowerCase().includes(normalized) ||
            player.position.toLowerCase().includes(normalized)
          )
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'goals':
              return b.player.stats.goals !== a.player.stats.goals
                ? b.player.stats.goals - a.player.stats.goals
                : b.player.stats.assists - a.player.stats.assists
            case 'assists':
              return b.player.stats.assists !== a.player.stats.assists
                ? b.player.stats.assists - a.player.stats.assists
                : b.player.stats.goals - a.player.stats.goals
            case 'minutes':
              return b.player.stats.minutes - a.player.stats.minutes
            case 'form':
            default:
              return b.formScore !== a.formScore
                ? b.formScore - a.formScore
                : b.player.stats.goals - a.player.stats.goals
          }
        }),
    [query, selectedLeagueId, sortBy, position],
  )

  return (
    <PageWrapper>
      <StaggerGrid className="space-y-5">

        {/* ── Header + search ─────────────────────────────────────── */}
        <StaggerGridItem as="section" className="stat-card p-5 sm:p-6">
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

            <label className="surface-soft flex items-center gap-2 rounded-[1.2rem] px-3 py-3 sm:min-w-[240px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t('searchPlayersPlaceholder')}
              />
            </label>
          </div>
        </StaggerGridItem>

        {/* ── Filter bar ──────────────────────────────────────────── */}
        <StaggerGridItem as="section" className="flex flex-wrap items-center gap-2">
          {/* League pills */}
          {[
            { key: 'all' as const, label: t('allLeagues') },
            ...leagues.map((l) => ({ key: l.id as LeagueId | 'all', label: l.abbreviation })),
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedLeagueId(item.key as LeagueId | 'all')}
              className={`app-pill cursor-pointer px-3 py-1.5 text-sm transition ${
                selectedLeagueId === item.key
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Divider */}
          <span className="mx-1 h-5 w-px bg-border/60" />

          {/* Position pills */}
          {(Object.entries(POSITION_LABELS) as [PositionFilter, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPosition(key)}
              className={`app-pill cursor-pointer px-3 py-1.5 text-sm transition ${
                position === key
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}

          {/* Sort — right-aligned */}
          <label className="surface-soft ml-auto flex items-center gap-2 rounded-[1.2rem] px-3 py-2 text-sm text-muted-foreground">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent font-medium text-foreground outline-none"
            >
              <option value="goals">{t('sortGoals')}</option>
              <option value="assists">{t('sortAssists')}</option>
              <option value="form">{t('sortForm')}</option>
              <option value="minutes">{t('sortMinutes')}</option>
            </select>
          </label>
        </StaggerGridItem>

        {/* ── Result count ────────────────────────────────────────── */}
        <StaggerGridItem>
          <div className="surface-soft rounded-[1.2rem] px-4 py-2.5 text-sm text-muted-foreground">
            {selectedLeagueId !== 'all'
              ? t('showingPlayersInLeague', { count: Math.min(players.length, 48) })
              : t('showingPlayersAll', { count: Math.min(players.length, 48) })}
            {position !== 'all' && (
              <span className="ml-2 font-medium text-foreground">· {POSITION_LABELS[position]}</span>
            )}
          </div>
        </StaggerGridItem>

        {/* ── Player grid ─────────────────────────────────────────── */}
        <StaggerGridItem as="section" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {players.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState title={t('noPlayersFound')} description={t('noPlayersHint')} />
            </div>
          ) : null}

          {players.slice(0, 48).map(({ league, player, team, formScore, standing }, rankIndex) => (
            <Link
              key={player.id}
              to={`/${player.leagueId}/player/${player.id}`}
              className="stat-card interactive-card group flex flex-col gap-3 p-4"
            >
              {/* Row 1: rank + photo + name + form score */}
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground/60">
                  {rankIndex + 1}
                </span>

                {/* Photo */}
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
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-border/40"
                  loading="lazy"
                />

                {/* Name + team */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{player.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: team.primaryColor ?? league.color }}
                    />
                    {team.shortName}
                    <span className="text-border/80">·</span>
                    {league.abbreviation}
                  </p>
                </div>

                {/* Form score chip */}
                <div className="shrink-0 rounded-xl border border-border/50 bg-background/40 px-2.5 py-1.5 text-center">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{t('formLabel')}</p>
                  <p className="font-mono text-lg font-black leading-none">{formScore}</p>
                </div>
              </div>

              {/* Row 2: position + form badge + standing */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-xs">{player.position}</Badge>
                <FormBadge player={player} variant="label" />
                {standing && (
                  <Badge variant="outline" className="text-xs">
                    #{standing.position}
                  </Badge>
                )}
              </div>

              {/* Row 3: stat trio */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="surface-soft rounded-[0.75rem] p-2 text-center">
                  <p className="font-mono text-base font-bold leading-tight">{player.stats.goals}</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('goals')}</p>
                </div>
                <div className="surface-soft rounded-[0.75rem] p-2 text-center">
                  <p className="font-mono text-base font-bold leading-tight">{player.stats.assists}</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('assists')}</p>
                </div>
                <div className="surface-soft rounded-[0.75rem] p-2 text-center">
                  <p className="font-mono text-base font-bold leading-tight">{player.stats.appearances}</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('appearances')}</p>
                </div>
              </div>
            </Link>
          ))}
        </StaggerGridItem>

        {/* ── Bottom promo cards ───────────────────────────────────── */}
        <StaggerGridItem as="section" className="grid gap-4 lg:grid-cols-3">
          <div className="stat-card p-4">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-base font-semibold">{t('scoutingLanes')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('scoutingLanesBody')}</p>
          </div>
          <div className="stat-card p-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-base font-semibold">{t('shortlistReady')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('shortlistReadyBody')}</p>
          </div>
          <div className="stat-card p-4">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h2 className="mt-3 text-base font-semibold">{t('fastNavigation')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('fastNavigationBody')}</p>
          </div>
        </StaggerGridItem>

      </StaggerGrid>
    </PageWrapper>
  )
}
