import type { ReactNode } from 'react'

import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Flame,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
} from 'lucide-react'

import { FormTableCard } from '@/components/league/FormTableCard'
import { LeagueTable } from '@/components/league/LeagueTable'
import { MatchOfTheDay } from '@/components/league/MatchOfTheDay'
import { TeamStatsCard } from '@/components/league/TeamStatsCard'
import { TopAssistsCard } from '@/components/league/TopAssistsCard'
import { TopScorersCard } from '@/components/league/TopScorersCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { LeagueDashboardSkeleton } from '@/components/shared/LeagueDashboardSkeleton'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataSource } from '@/contexts/DataSourceContext'
import { useLocale } from '@/contexts/LocaleContext'
import { useFootballData } from '@/hooks/useFootballData'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { formatDateTime } from '@/lib/utils'
import { createLeagueLogo, createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { LeagueSummary, Standing } from '@/services/types'

function getFormPoints(standing: Standing) {
  return standing.form.reduce((total, item) => {
    if (item.result === 'W') {
      return total + 3
    }

    if (item.result === 'D') {
      return total + 1
    }

    return total
  }, 0)
}

function SummaryStat({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string
  value: string
  helper: string
  icon: ReactNode
  tone: string
}) {
  return (
    <div className="surface-soft rounded-[1rem] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-background/45" style={{ color: tone }}>
          {icon}
        </span>
        <p className="min-w-0 truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-lg font-semibold leading-none tracking-tight">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

export default function LeagueDashboard() {
  const { leagueId: routeLeagueId } = useParams()
  const [searchParams] = useSearchParams()
  const leagueId = isLeagueId(routeLeagueId) ? routeLeagueId : 'premier-league'
  const { source } = useDataSource()
  const { t } = useLocale()
  const matchday = Number(searchParams.get('matchday') ?? 0) || undefined
  const { data, isLoading, error, refetch } = useFootballData<LeagueSummary>(
    'getLeagueSummary',
    { leagueId, matchday },
  )
  const league = data?.league ?? getLeague(leagueId)

  if (isLoading && !data) {
    return (
      <PageWrapper>
        <LeagueDashboardSkeleton />
      </PageWrapper>
    )
  }

  if (error && !data) {
    return (
      <PageWrapper>
        <div className="stat-card flex items-start gap-3 rounded-fg-lg p-fg-6 shadow-fg-2">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div className="flex-1 space-y-fg-2">
            <h2 className="text-base font-semibold tracking-tight">{t('couldNotLoadLeague')}</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={refetch}>{t('retry')}</Button>
        </div>
      </PageWrapper>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title={t('noLeagueData')}
        description={t('noLeagueDataDescription')}
      />
    )
  }

  const standings = data.standings ?? []
  const topScorers = data.topScorers ?? []
  const topAssists = data.topAssists ?? []
  const recentMatches = data.recentMatches ?? []
  const liveUpdatedAt = source === 'live' ? data.lastUpdated : undefined
  const isLiveSummary = Boolean(liveUpdatedAt)
  const leader = standings[0]
  const topAttack = standings.length > 0
    ? [...standings].sort((left, right) => right.goalsFor - left.goalsFor)[0]
    : undefined
  const topDefense = standings.length > 0
    ? [...standings].sort((left, right) => left.goalsAgainst - right.goalsAgainst)[0]
    : undefined
  const formLeader = standings.length > 0
    ? [...standings].sort((left, right) => getFormPoints(right) - getFormPoints(left))[0]
    : undefined
  const playmaker = topAssists[0]
  const scorer = topScorers[0]
  const spotlightPlayer = scorer?.player ?? playmaker?.player
  const spotlightTeamLabel = scorer?.player.id === spotlightPlayer?.id
    ? scorer?.team.shortName
    : playmaker?.team.shortName

  return (
    <PageWrapper>
      <StaggerGrid className="space-y-4">
        <StaggerGridItem as="section"
          className="stat-card app-grid-lines overflow-hidden rounded-fg-xl p-4 shadow-fg-2 sm:p-5"
          style={{
            backgroundImage: `radial-gradient(circle at top right, ${league.color}18, transparent 26%)`,
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <AssetImage
                src={league.logo}
                fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)}
                alt={`${league.name} logo`}
                className="h-14 w-14 rounded-[1rem] bg-white/90 object-contain p-2 ring-1 ring-white/10"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{league.country}</Badge>
                  <Badge className={isLiveSummary ? 'bg-emerald-500/15 text-emerald-200' : 'bg-slate-500/15 text-slate-200'}>
                    {isLiveSummary ? t('liveProxy') : t('localFallback')}
                  </Badge>
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{league.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('tableFirstSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge>{data.season.label}</Badge>
              {typeof data.season.currentMatchday === 'number' ? (
                <Badge variant="outline">{t('matchday')} {data.season.currentMatchday}</Badge>
              ) : null}
              {liveUpdatedAt ? (
                <span>{t('updated')} {formatDateTime(liveUpdatedAt)}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStat
              label={t('leader')}
              value={leader ? leader.team.shortName : '-'}
              helper={leader ? `${leader.points} ${t('points')}` : t('noStandings')}
              icon={<Star className="h-4 w-4" />}
              tone={league.color}
            />
            <SummaryStat
              label={t('bestAttack')}
              value={topAttack ? String(topAttack.goalsFor) : '-'}
              helper={topAttack ? topAttack.team.shortName : t('noScoringData')}
              icon={<Target className="h-4 w-4" />}
              tone="#f97316"
            />
            <SummaryStat
              label={t('bestDefense')}
              value={topDefense ? String(topDefense.goalsAgainst) : '-'}
              helper={topDefense ? topDefense.team.shortName : t('noDefendingData')}
              icon={<Shield className="h-4 w-4" />}
              tone="#38bdf8"
            />
            <SummaryStat
              label={t('formMonster')}
              value={formLeader ? `${getFormPoints(formLeader)}/15` : '-'}
              helper={formLeader ? formLeader.team.shortName : t('waitingTrendData')}
              icon={<Flame className="h-4 w-4" />}
              tone="#14b8a6"
            />
          </div>
        </StaggerGridItem>

        <StaggerGridItem as="section" className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <LeagueTable standings={standings} />

          <aside className="grid gap-3 self-start">
            <div className="stat-card overflow-hidden p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t('spotlightPlayer')}
                  </p>
                  <h2 className="mt-1 truncate text-base font-semibold tracking-tight">
                    {spotlightPlayer ? spotlightPlayer.name : t('noFeaturedPlayer')}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {spotlightTeamLabel ?? league.abbreviation}
                  </p>
                </div>
                {spotlightPlayer ? (
                  <AssetImage
                    src={spotlightPlayer.photo}
                    fallbackSrc={[
                      ...getPlayerPhotoSources(spotlightPlayer),
                      createPlayerAvatar(initialsFromName(spotlightPlayer.name), league.color),
                    ]}
                    alt={spotlightPlayer.name}
                    className="h-20 w-20 rounded-[0.9rem] object-cover ring-1 ring-white/10"
                    loading="lazy"
                  />
                ) : (
                  <Star className="h-5 w-5 text-amber-400" />
                )}
              </div>
              {spotlightPlayer ? (
                <>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="surface-soft rounded-lg px-2 py-2">
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.stats.appearances}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('games')}</p>
                    </div>
                    <div className="surface-soft rounded-lg px-2 py-2">
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.stats.goals}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('goals')}</p>
                    </div>
                    <div className="surface-soft rounded-lg px-2 py-2">
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.stats.assists}</p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('assists')}</p>
                    </div>
                  </div>
                  <Link
                    to={`/${spotlightPlayer.leagueId}/player/${spotlightPlayer.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                  >
                    {t('openDetails')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('featuredPlayerHint')}
                </p>
              )}
            </div>

            <TopScorersCard title={t('topScorers')} items={topScorers} compact />
            <TopAssistsCard items={topAssists} compact />
            <MatchOfTheDay match={recentMatches[0]} />

            <div className="stat-card p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t('dataFreshness')}</p>
                  <h2 className="mt-1 text-sm font-semibold tracking-tight">
                    {isLiveSummary ? t('liveProxy') : t('localFallback')}
                  </h2>
                </div>
                <span className={isLiveSummary ? 'h-2.5 w-2.5 rounded-full bg-emerald-400' : 'h-2.5 w-2.5 rounded-full bg-slate-400'} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {liveUpdatedAt ? `${t('updated')} ${formatDateTime(liveUpdatedAt)}` : t('tableFirstSubtitle')}
              </p>
            </div>
          </aside>
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <FormTableCard standings={standings} />
          <TeamStatsCard standings={standings} />
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-2 sm:grid-cols-3">
          <Link to="/teams" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t('explore')}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('teamsExplorer')}</span>
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
          </Link>
          <Link to="/players" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t('explore')}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('playersExplorer')}</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
          </Link>
          <Link to="/compare" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t('teamMatchups')}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('playerMatchups')}</span>
              <ArrowRight className="h-4 w-4 text-violet-400" />
            </div>
          </Link>
        </StaggerGridItem>
      </StaggerGrid>
    </PageWrapper>
  )
}
