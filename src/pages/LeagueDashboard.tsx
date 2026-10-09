import { type ReactNode, useMemo } from 'react'

import { Link, useParams } from 'react-router-dom'
import {
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
import { DataSourceBadge } from '@/components/shared/DataSourceBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState, NotFoundState } from '@/components/shared/StatusStates'
import { LeagueDashboardSkeleton } from '@/components/shared/LeagueDashboardSkeleton'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueSummary, useMatches } from '@/hooks/queries/football'
import { formFromMatches } from '@/services/footballData'
import { getPlayerPhotoSources } from '@/lib/assetSources'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { cn, formatRelativeTime } from '@/lib/utils'
import { createLeagueLogo, createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { Standing } from '@/services/types'

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

const statTone = {
  primary: { icon: 'bg-primary/12 text-primary', text: 'text-primary' },
  warning: { icon: 'bg-warning/12 text-warning-fg', text: 'text-warning-fg' },
  info: { icon: 'bg-info/12 text-info-fg', text: 'text-info-fg' },
  success: { icon: 'bg-success/12 text-success-fg', text: 'text-success-fg' },
} as const

function SummaryStat({
  label,
  team,
  stat,
  icon,
  tone,
}: {
  label: string
  team: string
  stat: string
  icon: ReactNode
  tone: keyof typeof statTone
}) {
  return (
    <div className="surface-soft flex items-center gap-3 rounded-lg p-3">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', statTone[tone].icon)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold leading-tight">{team}</p>
      </div>
      <p className={cn('shrink-0 font-mono text-lg font-bold tabular-nums', statTone[tone].text)}>
        {stat}
      </p>
    </div>
  )
}

export default function LeagueDashboard() {
  const { leagueId: routeLeagueId } = useParams()
  const validLeague = isLeagueId(routeLeagueId)
  const leagueId = validLeague ? routeLeagueId : 'premier-league'
  const { t } = useLocale()
  const { data, isPending, error, refetch, dataUpdatedAt } = useLeagueSummary(validLeague ? leagueId : undefined)
  const fetchedAt = dataUpdatedAt || null
  // Season results (one schedule per club) load after the table and only
  // enrich it with the form column, so they never delay the first paint.
  const { data: seasonMatches } = useMatches(validLeague ? leagueId : undefined)
  const standingsWithForm = useMemo(
    () =>
      (data?.standings ?? []).map((standing) =>
        standing.form.length || !seasonMatches ? standing : { ...standing, form: formFromMatches(seasonMatches, standing.team.id) },
      ),
    [data?.standings, seasonMatches],
  )
  const league = data?.league ?? getLeague(leagueId)

  if (!validLeague) {
    return (
      <PageWrapper>
        <NotFoundState />
      </PageWrapper>
    )
  }

  if (error && !data) {
    return (
      <PageWrapper>
        <ErrorState title={t('couldNotLoadLeague')} description={error.message} onRetry={() => void refetch()} />
      </PageWrapper>
    )
  }

  if (isPending) {
    return (
      <PageWrapper>
        <LeagueDashboardSkeleton />
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

  const standings = standingsWithForm
  const topScorers = data.topScorers ?? []
  const topAssists = data.topAssists ?? []
  const recentMatches = data.recentMatches ?? []
  const liveUpdatedAt = data.lastUpdated
  const isLiveSummary = Boolean(liveUpdatedAt)
  // Prefer the actual client fetch time (cache-aware) for the freshness label,
  // falling back to the payload's server timestamp.
  const freshnessAt: number | string | null = fetchedAt ?? liveUpdatedAt ?? null
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
          className="stat-card app-grid-lines overflow-hidden rounded-xl p-4 shadow-fg-2 sm:p-5"
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
                className="h-14 w-14 rounded-lg bg-white/90 object-contain p-2 ring-1 ring-border"
                loading="lazy"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{league.country}</Badge>
                  <DataSourceBadge
                    freshness={isLiveSummary ? 'live' : 'offline'}
                    label={t('liveProxy')}
                  />
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
              {freshnessAt ? (
                <span>{t('updated')} {formatRelativeTime(freshnessAt)}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStat
              label={t('leader')}
              team={leader ? leader.team.shortName : t('noStandings')}
              stat={leader ? `${leader.points} Pts` : '-'}
              icon={<Star className="h-4 w-4" />}
              tone="primary"
            />
            <SummaryStat
              label={t('bestAttack')}
              team={topAttack ? topAttack.team.shortName : t('noScoringData')}
              stat={topAttack ? String(topAttack.goalsFor) : '-'}
              icon={<Target className="h-4 w-4" />}
              tone="warning"
            />
            <SummaryStat
              label={t('bestDefense')}
              team={topDefense ? topDefense.team.shortName : t('noDefendingData')}
              stat={topDefense ? String(topDefense.goalsAgainst) : '-'}
              icon={<Shield className="h-4 w-4" />}
              tone="info"
            />
            <SummaryStat
              label={t('formMonster')}
              team={formLeader ? formLeader.team.shortName : t('waitingTrendData')}
              stat={formLeader ? `${getFormPoints(formLeader)}/15` : '-'}
              icon={<Flame className="h-4 w-4" />}
              tone="success"
            />
          </div>
        </StaggerGridItem>

        <StaggerGridItem as="section" className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <LeagueTable standings={standings} />

          <aside className="grid gap-3 self-start">
            <div className="stat-card overflow-hidden p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">
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
                    className="h-20 w-20 rounded-lg object-cover ring-1 ring-border"
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
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.appearances}</p>
                      <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('games')}</p>
                    </div>
                    <div className="surface-soft rounded-lg px-2 py-2">
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.goals}</p>
                      <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('goals')}</p>
                    </div>
                    <div className="surface-soft rounded-lg px-2 py-2">
                      <p className="font-mono text-lg font-bold">{spotlightPlayer.assists}</p>
                      <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('assists')}</p>
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
                  <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('dataFreshness')}</p>
                  <h2 className="mt-1 text-sm font-semibold tracking-tight">
                    {t('liveProxy')}
                  </h2>
                </div>
                <span className={isLiveSummary ? 'h-2.5 w-2.5 rounded-full bg-emerald-400' : 'h-2.5 w-2.5 rounded-full bg-slate-400'} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {freshnessAt ? `${t('updated')} ${formatRelativeTime(freshnessAt)}` : t('tableFirstSubtitle')}
              </p>
            </div>
          </aside>
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
          <FormTableCard standings={standings} />
          <TeamStatsCard standings={standings} />
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-2 sm:grid-cols-3">
          <Link to="/teams" className="interactive-card surface-soft rounded-md px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('explore')}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('teamsExplorer')}</span>
              <Sparkles className="h-4 w-4 text-sky-400" />
            </div>
          </Link>
          <Link to="/players" className="interactive-card surface-soft rounded-md px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('explore')}</span>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('playersExplorer')}</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
          </Link>
          <Link to="/compare" className="interactive-card surface-soft rounded-md px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
            <span className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('teamMatchups')}</span>
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
