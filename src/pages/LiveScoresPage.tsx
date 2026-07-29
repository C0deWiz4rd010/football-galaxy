import { useMemo, useState } from 'react'

import { AlertCircle, RadioTower, RefreshCw } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageSection } from '@/components/shared/PageSection'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import {
  LiveMatchCardSkeleton,
  LiveMatchGrid,
} from '@/features/live/LiveTicker'
import { useLiveScores } from '@/hooks/useLiveScores'
import { leagues } from '@/lib/leagues'
import { cn, formatRelativeTime } from '@/lib/utils'
import { hasLiveMatch, type LiveMatch } from '@/services/espn/liveScores'
import type { LeagueId } from '@/services/types'

type LeagueFilter = LeagueId | 'all'

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-fg-pill border px-3.5 py-1.5 text-xs font-medium transition',
        active
          ? 'border-primary/50 bg-primary/12 text-foreground'
          : 'border-border/60 bg-background/40 text-muted-foreground hover:text-foreground',
      )}
      style={active && color ? { borderColor: `${color}66`, color } : undefined}
    >
      {children}
    </button>
  )
}

export default function LiveScoresPage() {
  const { t } = useLocale()
  const [filter, setFilter] = useState<LeagueFilter>('all')
  const { data, isLoading, error, fetchedAt, refetch } = useLiveScores(
    filter === 'all' ? undefined : filter,
  )

  const matches: LiveMatch[] = useMemo(() => data ?? [], [data])
  const liveCount = useMemo(
    () => matches.filter((match) => match.state === 'live').length,
    [matches],
  )
  const anyLive = hasLiveMatch(matches)

  return (
    <PageWrapper>
      <div className="space-y-4">
        <section className="stat-card app-grid-lines overflow-hidden rounded-fg-xl p-4 shadow-fg-2 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 place-items-center rounded-fg-lg bg-live/12 text-live">
                <RadioTower className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DataSourceBadge
                    freshness={anyLive ? 'live' : 'official'}
                    label={anyLive ? `${liveCount} live` : 'ESPN'}
                  />
                  {fetchedAt ? (
                    <span className="text-xs text-muted-foreground">
                      {t('updated')} {formatRelativeTime(fetchedAt)}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  {t('liveScores')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('liveScoresSubtitle')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-1.5"
            >
              <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
              {t('refresh')}
            </Button>
          </div>

          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
              {t('allLeagues')}
            </FilterChip>
            {leagues.map((league) => (
              <FilterChip
                key={league.id}
                active={filter === league.id}
                color={league.color}
                onClick={() => setFilter(league.id)}
              >
                {league.abbreviation}
              </FilterChip>
            ))}
          </div>
        </section>

        <PageSection>
          {isLoading && matches.length === 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LiveMatchCardSkeleton key={index} />
              ))}
            </div>
          ) : error && matches.length === 0 ? (
            <div className="stat-card flex items-start gap-3 rounded-fg-lg p-fg-6 shadow-fg-2">
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
              <div className="flex-1 space-y-fg-2">
                <h2 className="text-base font-semibold tracking-tight">
                  {t('liveScoresError')}
                </h2>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={refetch}>{t('retry')}</Button>
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon={RadioTower}
              title={t('liveScoresEmpty')}
              description={t('liveScoresEmptyHint')}
            />
          ) : (
            <LiveMatchGrid matches={matches} />
          )}
        </PageSection>
      </div>
    </PageWrapper>
  )
}
