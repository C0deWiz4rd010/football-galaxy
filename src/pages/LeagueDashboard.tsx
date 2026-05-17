import type { ReactNode } from 'react'

import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

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
function StorylineCard({
  icon,
  eyebrow,
  title,
  text,
  href,
  cta,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  text: string
  href?: string
  cta: string
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h3 className="mt-1.5 text-base font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="rounded-2xl bg-background/30 p-2 text-muted-foreground">{icon}</div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {href ? (
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      ) : null}
    </>
  )

  if (!href) {
    return <div className="stat-card p-4">{content}</div>
  }

  return (
    <Link to={href} className="stat-card interactive-card block p-4">
      {content}
    </Link>
  )
}

export default function LeagueDashboard() {
  const { leagueId: routeLeagueId } = useParams()
  const leagueId = isLeagueId(routeLeagueId) ? routeLeagueId : 'premier-league'
  const { source } = useDataSource()
  const { t } = useLocale()
  const { data, isLoading, error, refetch } = useFootballData<LeagueSummary>(
    'getLeagueSummary',
    { leagueId },
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
  const risingTeam = standings.length > 0
    ? [...standings].sort((left, right) => right.goalDifference - left.goalDifference)[0]
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssetImage
                    src={league.logo}
                    fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)}
                    alt={`${league.name} logo`}
                    className="h-14 w-14 rounded-[1.2rem] bg-white/90 object-contain p-2 ring-1 ring-white/10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{league.country}</Badge>
                      <Badge className="bg-white/10 text-foreground">
                        {isLiveSummary ? t('liveProxy') : t('localFallback')}
                      </Badge>
                    </div>
                    <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">{league.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('tableFirstSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{data.season.label}</Badge>
                  {typeof data.season.currentMatchday === 'number' ? (
                    <Badge variant="outline">{t('matchday')} {data.season.currentMatchday}</Badge>
                  ) : null}
                  {liveUpdatedAt ? (
                    <span className="text-xs text-muted-foreground">
                      {t('updated')} {formatDateTime(liveUpdatedAt)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
                  tone="#a78bfa"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
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
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div className="surface-soft rounded-[1rem] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t('titlePulse')}
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold tracking-tight">
                      {(leader?.team.name ?? league.name)} {t('setThePace')}
                    </h2>
                  </div>
                  <motion.span
                    aria-hidden
                    className="inline-flex items-center justify-center text-amber-500 drop-shadow-[0_0_8px_rgba(251,146,60,0.55)]"
                    animate={{
                      scale: [1, 1.18, 0.92, 1.12, 1],
                      filter: [
                        'drop-shadow(0 0 0px rgba(251,146,60,0.3))',
                        'drop-shadow(0 0 10px rgba(251,146,60,0.75))',
                        'drop-shadow(0 0 4px rgba(251,146,60,0.45))',
                        'drop-shadow(0 0 12px rgba(251,146,60,0.8))',
                        'drop-shadow(0 0 0px rgba(251,146,60,0.3))',
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Flame className="h-5 w-5" />
                  </motion.span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {leader
                    ? t('leaderSummary', {
                        name: leader.team.name,
                        played: leader.played,
                        gd: leader.goalDifference,
                      })
                    : t('titleRacePending')}
                </p>
              </div>

              <div className="surface-soft rounded-[1rem] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t('spotlightPlayer')}
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold tracking-tight">
                      {spotlightPlayer ? spotlightPlayer.name : t('noFeaturedPlayer')}
                    </h2>
                  </div>
                  {spotlightPlayer ? (
                    <AssetImage
                      src={spotlightPlayer.photo}
                      fallbackSrc={[
                        ...getPlayerPhotoSources(spotlightPlayer),
                        createPlayerAvatar(initialsFromName(spotlightPlayer.name), league.color),
                      ]}
                      alt={spotlightPlayer.name}
                      className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                      loading="lazy"
                    />
                  ) : (
                    <Star className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                {spotlightPlayer ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{spotlightPlayer.position}</Badge>
                      {spotlightTeamLabel ? <Badge variant="outline">{spotlightTeamLabel}</Badge> : null}
                      <Badge>{scorer?.player.id === spotlightPlayer.id ? t('goalsCount', { count: scorer.goals }) : t('assistsCount', { count: playmaker?.assists ?? 0 })}</Badge>
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
            </div>
          </div>
        </StaggerGridItem>

        <StaggerGridItem>
          <LeagueTable standings={standings} />
        </StaggerGridItem>

        <StaggerGridItem as="section" className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="grid gap-3 lg:grid-cols-2">
            <StorylineCard
              cta={t('openDetails')}
              icon={<Flame className="h-5 w-5 text-orange-400" />}
              eyebrow={t('risingTeam')}
              title={risingTeam ? risingTeam.team.name : t('noBreakoutYet')}
              text={
                risingTeam
                  ? t('risingTeamSummary', { name: risingTeam.team.shortName })
                  : t('breakoutStoryPending')
              }
              href={risingTeam ? `/${risingTeam.leagueId}/team/${risingTeam.team.id}` : undefined}
            />
            <StorylineCard
              cta={t('openDetails')}
              icon={<Target className="h-5 w-5 text-amber-400" />}
              eyebrow={t('topAssists')}
              title={playmaker ? playmaker.player.name : 'No leader yet'}
              text={
                playmaker
                  ? `${playmaker.player.name} is driving the final ball for ${playmaker.team.shortName} with ${playmaker.assists} assists so far.`
                  : 'Creative leaders will appear here once assist data is available.'
              }
              href={
                playmaker ? `/${playmaker.player.leagueId}/player/${playmaker.player.id}` : undefined
              }
            />
            <StorylineCard
              cta={t('openDetails')}
              icon={<Shield className="h-5 w-5 text-sky-400" />}
              eyebrow={t('bestDefense')}
              title={topDefense ? topDefense.team.name : 'No wall yet'}
              text={
                topDefense
                  ? `${topDefense.team.shortName} have conceded only ${topDefense.goalsAgainst} goals, setting the defensive standard for the league.`
                  : 'The best defensive side will appear here once enough matches are logged.'
              }
              href={topDefense ? `/${topDefense.leagueId}/team/${topDefense.team.id}` : undefined}
            />
            <StorylineCard
              cta={t('openDetails')}
              icon={<Sparkles className="h-5 w-5 text-violet-400" />}
              eyebrow={t('explore')}
              title={t('teamsExplorer') + ' & ' + t('playersExplorer')}
              text={t('tableFirstSubtitle')}
            />
          </div>

          <div className="grid gap-3">
            <MatchOfTheDay match={recentMatches[0]} />
            <FormTableCard standings={standings} />
          </div>
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,0.8fr)]">
          <TopScorersCard title={t('topScorers')} items={topScorers} />
          <TopAssistsCard items={topAssists} />
          <TeamStatsCard standings={standings} />
        </StaggerGridItem>
      </StaggerGrid>
    </PageWrapper>
  )
}
