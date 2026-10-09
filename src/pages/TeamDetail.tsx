import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Heart, Shield, Sparkles, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { TeamMatchGoalsChart, TeamPointsTrendChart, TeamProfileRadar } from '@/components/team/TeamCharts'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { SquadTable } from '@/components/team/SquadTable'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { BackButton } from '@/components/shared/BackButton'
import { MetricTile } from '@/components/shared/MetricTile'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState, NotFoundState } from '@/components/shared/StatusStates'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useSquad, useStandings, useTeam, useTeamMatches } from '@/hooks/queries/football'
import { isNotFoundError } from '@/services/errors'
import { formFromMatches } from '@/services/footballData'
import { FormBadge } from '@/components/shared/FormBadge'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { getFormScore } from '@/lib/player-ratings'
import { createPlayerAvatar, createTeamCrest, FALLBACK_TEAM_COLORS, initialsFromName } from '@/lib/visualAssets'
import { isLeagueId } from '@/lib/leagues'

export default function TeamDetail() {
  const { t } = useLocale()
  const params = useParams()
  const leagueId = isLeagueId(params.leagueId) ? params.leagueId : undefined
  const teamId = params.teamId
  const enabled = Boolean(leagueId && teamId)
  const { data: team, isPending, error, refetch } = useTeam(leagueId, teamId)
  const notFound = isNotFoundError(error)
  const { data: squad } = useSquad(leagueId, teamId)
  const { data: matches } = useTeamMatches(leagueId, teamId)
  const { data: standings } = useStandings(leagueId)
  const favorites = useFavorites()
  const teamMatches = useMemo(
    () =>
      !team
        ? []
        : (matches ?? []).filter(
            (match) => match.homeTeam.id === team.id || match.awayTeam.id === team.id,
          ),
    [matches, team],
  )

  if (!enabled || notFound) {
    return (
      <PageWrapper>
        <NotFoundState
          title={t('teamNotFound')}
          description={t('teamNotFoundDescription')}
          backTo={leagueId ? `/${leagueId}` : '/'}
          backLabel={t(leagueId ? 'backToLeague' : 'goHome')}
        />
      </PageWrapper>
    )
  }

  if (error && !team) {
    return (
      <PageWrapper>
        <ErrorState onRetry={() => void refetch()} />
      </PageWrapper>
    )
  }

  if (isPending || !team) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    )
  }

  const players = squad?.players ?? []
  const standing = standings?.find((item) => item.team.id === team.id)
  const recentForm = formFromMatches(matches ?? [], team.id)
  const ages = players.map((player) => player.age).filter((age): age is number => typeof age === 'number')
  const averageAge = ages.length > 0 ? (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1) : '-'
  const topRatedPlayer = players
    .slice()
    .sort(
      (left, right) =>
        getFormScore(right).score - getFormScore(left).score,
    )[0]

  return (
    <PageWrapper>
      <StaggerGrid className="space-y-4">
        <StaggerGridItem as="section"
          className="stat-card relative overflow-hidden rounded-xl p-5 text-white shadow-fg-4 sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor ?? FALLBACK_TEAM_COLORS.primary}, ${team.secondaryColor ?? '#0f172a'})`,
          }}
        >
          {/* Scrim: keeps white text readable on any club colours (white kits included). */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/35 via-black/40 to-black/55" />
          <BackButton variant="icon" onMedia fallbackTo={`/${team.leagueId}`} className="relative mb-3" />
          <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.72fr)]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AssetImage
                  src={team.crest}
                  fallbackSrc={[
                    ...getCrestSources(team),
                    createTeamCrest(
                      team.shortName,
                      team.primaryColor,
                      team.secondaryColor,
                      0,
                    ),
                  ]}
                  alt={team.name}
                  className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/20"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/20 bg-white/12 text-white">{team.shortName}</Badge>
                    <Badge className="border-white/20 bg-black/15 text-white">{t('clubView')}</Badge>
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight">{team.name}</h1>
                  <p className="mt-1 text-sm text-white/80">
                    {[
                      team.manager ? (
                        <Link key="coach" to={`/${team.leagueId}/team/${team.id}/coach`} className="font-medium text-white hover:text-white/80">
                          {team.manager}
                        </Link>
                      ) : null,
                      team.stadium ? <span key="stadium">{team.stadium}</span> : null,
                      team.capacity ? <span key="capacity">{team.capacity.toLocaleString()} {t('seats')}</span> : null,
                    ]
                      .filter(Boolean)
                      .flatMap((item, index) => (index ? [<span key={`sep-${index}`} aria-hidden> · </span>, item] : [item]))}
                  </p>
                </div>
                <motion.div whileTap={{ scale: 1.14 }}>
                  <Button
                    variant="secondary"
                    onClick={() => favorites.toggleTeam({ id: team.id, leagueId: team.leagueId, name: team.name, image: team.crest })}
                  >
                    <Heart
                      className={
                        favorites.isTeamFavorite(team.id)
                          ? 'h-4 w-4 fill-red-500 text-red-500'
                          : 'h-4 w-4'
                      }
                    />
                    {t('follow')}
                  </Button>
                </motion.div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                <MetricTile
                  onMedia
                  label={t('leaguePosition')}
                  value={standing ? `#${standing.position}` : '-'}
                  helper={standing ? t('pointsLabel', { count: standing.points }) : t('noTableContext')}
                />
                <MetricTile
                  onMedia
                  label={t('squadSize')}
                  value={String(players.length)}
                  helper={t('averageAgeLabel', { age: averageAge })}
                />
                <MetricTile
                  onMedia
                  label={t('goalsPerGame')}
                  value={standing && standing.played > 0 ? (standing.goalsFor / standing.played).toFixed(2) : '-'}
                  helper={
                    standing && standing.played > 0
                      ? t('pointsPerGameLabel', { value: (standing.points / standing.played).toFixed(2) })
                      : t('waitingForData')
                  }
                />
                <MetricTile
                  onMedia
                  label={t('goalDifference')}
                  value={standing ? `${standing.goalDifference}` : '-'}
                  helper={standing ? t('goalsForAgainst', { forCount: standing.goalsFor, against: standing.goalsAgainst }) : t('waitingForData')}
                />
              </div>
            </div>

            <section className="rounded-lg border border-white/12 bg-black/18 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-white/60">
                    {t('teamSpotlight')}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    {topRatedPlayer ? topRatedPlayer.name : t('noStandoutYet')}
                  </h2>
                </div>
                <Sparkles className="h-5 w-5 text-white/60" />
              </div>
              {topRatedPlayer ? (
                <div className="mt-3 space-y-3">
                  <Link
                    to={`/${topRatedPlayer.leagueId}/player/${topRatedPlayer.id}`}
                    className="flex items-center gap-3 hover:text-white/80"
                  >
                    <AssetImage
                      src={topRatedPlayer.photo}
                      fallbackSrc={[
                        ...getPlayerPhotoSources(topRatedPlayer),
                        createPlayerAvatar(initialsFromName(topRatedPlayer.name), team.primaryColor),
                      ]}
                      alt={topRatedPlayer.name}
                      className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/15"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-base font-semibold">{topRatedPlayer.name}</p>
                      <p className="text-sm text-white/75 flex items-center gap-2">
                        {topRatedPlayer.position}
                        <FormBadge player={topRatedPlayer} variant="full" className="bg-white/15 border-white/20 text-white" />
                      </p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md border border-white/10 bg-white/6 p-2.5">
                      <p className="text-2xs uppercase tracking-eyebrow text-white/60">{t('goals')}</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.goals}</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-white/6 p-2.5">
                      <p className="text-2xs uppercase tracking-eyebrow text-white/60">{t('assists')}</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.assists}</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-white/6 p-2.5">
                      <p className="text-2xs uppercase tracking-eyebrow text-white/60">{t('formShort')}</p>
                      <p className="mt-1 text-sm font-semibold">{getFormScore(topRatedPlayer).label}</p>
                    </div>
                  </div>
                  <Link
                    to={`/${topRatedPlayer.leagueId}/player/${topRatedPlayer.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80"
                  >
                    {t('openPlayerProfile')}
                    <Zap className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </StaggerGridItem>

        <StaggerGridItem>
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto pb-1">
            <TabsList className="min-w-max">
              <TabsTrigger value="overview">{t('tabOverview')}</TabsTrigger>
              <TabsTrigger value="squad">{t('tabSquad')}</TabsTrigger>
              <TabsTrigger value="results">{t('tabResults')}</TabsTrigger>
              <TabsTrigger value="statistics">{t('tabStatistics')}</TabsTrigger>
              <TabsTrigger value="form">{t('tabForm')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
            <section className="stat-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('clubIdentity')}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('atAGlance')}</h2>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-lg p-4">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('manager')}</p>
                  {team.manager ? (
                    <Link
                      to={`/${team.leagueId}/team/${team.id}/coach`}
                      className="mt-2 inline-block text-lg font-semibold hover:text-primary"
                    >
                      {team.manager}
                    </Link>
                  ) : (
                    <p className="mt-2 text-lg font-semibold text-muted-foreground">{t('notAvailable')}</p>
                  )}
                </div>
                <div className="surface-soft rounded-lg p-4">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('homeGround')}</p>
                  <p className="mt-2 text-lg font-semibold">{team.stadium ?? '-'}</p>
                </div>
                <div className="surface-soft rounded-lg p-4">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('momentum')}</p>
                  <p className="mt-2 text-lg font-semibold">
                    {recentForm.length ? t('winsInLastFive', { count: recentForm.filter((item) => item.result === 'W').length }) : t('noTrendYet')}
                  </p>
                </div>
                <div className="surface-soft rounded-lg p-4">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('bestCurrentEdge')}</p>
                  <p className="mt-2 text-lg font-semibold">
                    {standing && standing.goalsFor >= standing.goalsAgainst ? t('attackingOutput') : t('defensiveRecovery')}
                  </p>
                </div>
              </div>
            </section>

            <section className="stat-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('recentForm')}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('goalsPerMatchTitle')}</h2>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <TeamMatchGoalsChart matches={matches ?? []} team={team} limit={6} />
            </section>
          </TabsContent>

          <TabsContent value="squad" className="stat-card">
            <SquadTable players={players} />
          </TabsContent>

          <TabsContent value="results" className="stat-card">
            <ResultsTimeline matches={[...teamMatches].reverse()} team={team} />
          </TabsContent>

          <TabsContent value="statistics" className="grid gap-4">
            <div className="stat-card">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('leagueProfile')}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('teamRadar')}</h2>
              </div>
              <TeamProfileRadar standing={standing} standings={standings ?? []} />
            </div>
            <div className="stat-card">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('seasonProgress')}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('goalsPerMatchTitle')}</h2>
              </div>
              <TeamMatchGoalsChart matches={matches ?? []} team={team} />
            </div>
          </TabsContent>

          <TabsContent value="form" className="stat-card">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('trendLine')}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('recentForm')}</h2>
            </div>
            <TeamPointsTrendChart matches={matches ?? []} team={team} />
          </TabsContent>
        </Tabs>
        </StaggerGridItem>
      </StaggerGrid>
    </PageWrapper>
  )
}
