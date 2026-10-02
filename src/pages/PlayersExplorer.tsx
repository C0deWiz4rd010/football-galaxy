import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ArrowUpDown, Search } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/StatusStates'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueSummaries } from '@/hooks/queries/football'
import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { League, LeagueId, LeaguePlayer } from '@/services/types'

type SortKey = 'goals' | 'assists' | 'contributions' | 'appearances'

const PAGE_SIZE = 48
const ALL_LEAGUE_IDS = leagues.map((league) => league.id)

const sorters: Record<SortKey, (a: LeaguePlayer, b: LeaguePlayer) => number> = {
  goals: (a, b) => b.player.goals - a.player.goals || b.player.assists - a.player.assists,
  assists: (a, b) => b.player.assists - a.player.assists || b.player.goals - a.player.goals,
  contributions: (a, b) => b.player.goals + b.player.assists - (a.player.goals + a.player.assists) || b.player.goals - a.player.goals,
  appearances: (a, b) => b.player.appearances - a.player.appearances || b.player.goals - a.player.goals,
}

function PlayerCard({ entry, league, rank }: { entry: LeaguePlayer; league: League; rank: number }) {
  const { t } = useLocale()
  const { player, team } = entry
  return (
    <Link to={`/${player.leagueId}/player/${player.id}`} className="stat-card interactive-card group flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{rank}</span>
        <AssetImage
          src={player.photo}
          fallbackSrc={[...(player.photoSources ?? []), createPlayerAvatar(initialsFromName(player.name), team.primaryColor ?? league.color)]}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full bg-muted object-cover ring-2 ring-border/40"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{player.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.primaryColor ?? league.color }} />
            {team.shortName}
            <span aria-hidden>·</span>
            {league.abbreviation}
          </p>
        </div>
      </div>
      <dl className="mt-auto grid grid-cols-3 gap-1.5">
        {[
          [t('goals'), player.goals],
          [t('assists'), player.assists],
          [t('appearances'), player.appearances],
        ].map(([label, value]) => (
          <div key={label} className="surface-soft rounded-fg-sm p-2 text-center">
            <dd className="font-mono text-base font-bold leading-tight tabular-nums">{value}</dd>
            <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
          </div>
        ))}
      </dl>
    </Link>
  )
}

export default function PlayersExplorer() {
  const { t } = useLocale()
  const [selectedLeagueId, setSelectedLeagueId] = useState<LeagueId | 'all'>('all')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [sortBy, setSortBy] = useState<SortKey>('goals')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const leagueIds = selectedLeagueId === 'all' ? ALL_LEAGUE_IDS : [selectedLeagueId]
  const { summaries, isPending, isError, failedCount, refetch } = useLeagueSummaries(leagueIds)

  const players = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    return summaries
      .flatMap((summary) => summary.playerPool)
      .filter(
        ({ player, team }) =>
          !normalized || player.name.toLowerCase().includes(normalized) || team.name.toLowerCase().includes(normalized),
      )
      .sort(sorters[sortBy])
  }, [deferredQuery, sortBy, summaries])

  const leagueById = useMemo(() => new Map(leagues.map((league) => [league.id, league])), [])

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section className="stat-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('playerExplorerEyebrow')}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('playerExplorerTitle')}</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t('playerExplorerLiveSubtitle')}</p>
            </div>
            <label className="surface-soft flex items-center gap-2 rounded-fg-lg px-3 py-3 focus-within:ring-2 focus-within:ring-ring sm:min-w-[260px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">{t('searchPlayersPlaceholder')}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setVisible(PAGE_SIZE)
                }}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder={t('searchPlayersPlaceholder')}
              />
            </label>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-2" aria-label={t('filters')}>
          {[{ key: 'all' as const, label: t('allLeagues') }, ...leagues.map((league) => ({ key: league.id, label: league.abbreviation }))].map(
            (item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={selectedLeagueId === item.key}
                onClick={() => {
                  setSelectedLeagueId(item.key)
                  setVisible(PAGE_SIZE)
                }}
                className={`app-pill min-h-9 cursor-pointer px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedLeagueId === item.key ? 'border-primary bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ),
          )}
          <label className="surface-soft ml-auto flex items-center gap-2 rounded-fg-lg px-3 py-2 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="sr-only">{t('sortBy')}</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} className="bg-transparent font-medium text-foreground outline-none">
              <option value="goals">{t('sortGoals')}</option>
              <option value="assists">{t('sortAssists')}</option>
              <option value="contributions">{t('sortContributions')}</option>
              <option value="appearances">{t('sortAppearances')}</option>
            </select>
          </label>
        </section>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <p className="surface-soft rounded-fg-lg px-4 py-2.5 text-sm text-muted-foreground" aria-live="polite">
              {isPending && !players.length
                ? t('loading')
                : selectedLeagueId !== 'all'
                  ? t('showingPlayersInLeague', { count: players.length })
                  : t('showingPlayersAll', { count: players.length })}
              {failedCount > 0 && !isPending ? <span className="ml-2">· {t('someLeaguesUnavailable', { count: failedCount })}</span> : null}
            </p>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-busy={isPending}>
              {isPending && !players.length
                ? Array.from({ length: 9 }, (_, index) => <Skeleton key={index} className="h-40 rounded-fg-lg" />)
                : null}
              {!isPending && players.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <EmptyState title={t('noPlayersFound')} description={t('noPlayersHint')} />
                </div>
              ) : null}
              {players.slice(0, visible).map((entry, index) => (
                <PlayerCard key={entry.player.id} entry={entry} league={leagueById.get(entry.player.leagueId)!} rank={index + 1} />
              ))}
            </section>

            {players.length > visible ? (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                  {t('showMore', { count: Math.min(PAGE_SIZE, players.length - visible) })}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
