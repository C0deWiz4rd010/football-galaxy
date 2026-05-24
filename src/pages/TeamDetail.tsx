import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ArrowLeft, Heart, Shield, Sparkles, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { FormLineChart } from '@/components/team/FormLineChart'
import { TeamRadarChart } from '@/components/team/RadarChart'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { SquadTable } from '@/components/team/SquadTable'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useFootballData } from '@/hooks/useFootballData'
import { FormBadge } from '@/components/shared/FormBadge'
import { getCrestSources, getPlayerPhotoSources } from '@/lib/assetSources'
import { getFormScore } from '@/lib/player-ratings'
import { formatMarketValue } from '@/lib/utils'
import { createPlayerAvatar, createTeamCrest, initialsFromName } from '@/lib/visualAssets'
import type { Match, Squad, Standing, Team } from '@/services/types'

function TeamMetric({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="surface-soft rounded-[1rem] p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}
export default function TeamDetail() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { leagueId, teamId } = useParams()
  const { data: team, isLoading } = useFootballData<Team>('getTeam', {
    leagueId: leagueId as never,
    teamId,
  })
  const { data: squad } = useFootballData<Squad>('getSquad', {
    leagueId: leagueId as never,
    teamId,
  })
  const { data: matches } = useFootballData<Match[]>('getMatches', {
    leagueId: leagueId as never,
  })
  const { data: standings } = useFootballData<Standing[]>('getStandings', {
    leagueId: leagueId as never,
  })
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

  if (isLoading || !team) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    )
  }

  const players = squad?.players ?? team.squad ?? []
  const standing = standings?.find((item) => item.team.id === team.id)
  const squadValue = players.reduce(
    (sum, player) => sum + player.marketValueEurCents,
    0,
  )
  const averageAge =
    players.length > 0
      ? (players.reduce((sum, player) => sum + player.age, 0) / players.length).toFixed(1)
      : '0.0'
  const topRatedPlayer = players
    .slice()
    .sort(
      (left, right) =>
        getFormScore(right).score - getFormScore(left).score,
    )[0]
  const chartData = ['0-15', '16-30', '31-45+', '46-60', '61-75', '76-90+'].map(
    (slot, index) => ({ slot, goals: 3 + index * 2, conceded: 1 + (index % 3) + index }),
  )

  return (
    <PageWrapper>
      <StaggerGrid className="space-y-4">
        <StaggerGridItem as="section"
          className="stat-card overflow-hidden rounded-fg-xl p-5 text-white shadow-fg-4 sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor ?? '#0f766e'}, ${team.secondaryColor ?? '#0f172a'})`,
          }}
        >
          {/* Back button — sits in the top-left of the coloured hero card */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1.5 text-xs text-white/80 transition hover:bg-black/30 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('back')}
            </button>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.72fr)]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <AssetImage
                  src={team.crest}
                  fallbackSrc={[
                    ...getCrestSources(team),
                    createTeamCrest(
                      team.shortName,
                      team.primaryColor ?? '#0f766e',
                      team.secondaryColor ?? '#f8fafc',
                      0,
                    ),
                  ]}
                  alt={team.name}
                  className="h-20 w-20 rounded-[1.3rem] object-cover ring-1 ring-white/20"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/20 bg-white/12 text-white">{team.shortName}</Badge>
                    <Badge className="border-white/20 bg-black/15 text-white">{t('clubView')}</Badge>
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight">{team.name}</h1>
                  <p className="mt-1 text-sm text-white/80">
                    <Link
                      to={`/${team.leagueId}/team/${team.id}/coach`}
                      className="font-medium text-white hover:text-white/80"
                    >
                      {team.manager ?? t('coachPending')}
                    </Link>{' '}
                    {' / '}
                    {team.stadium}
                    {' / '}
                    {team.capacity?.toLocaleString()} {t('seats')}
                  </p>
                </div>
                <motion.div whileTap={{ scale: 1.14 }}>
                  <Button
                    variant="secondary"
                    onClick={() => favorites.toggleTeam(team.id)}
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

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric
                  label={t('leaguePosition')}
                  value={standing ? `#${standing.position}` : '-'}
                  helper={standing ? t('pointsLabel', { count: standing.points }) : t('noTableContext')}
                />
                <TeamMetric
                  label={t('squadSize')}
                  value={String(players.length)}
                  helper={t('averageAgeLabel', { age: averageAge })}
                />
                <TeamMetric
                  label={t('squadValue')}
                  value={formatMarketValue(squadValue)}
                  helper={t('blendedEstimate')}
                />
                <TeamMetric
                  label={t('goalDifference')}
                  value={standing ? `${standing.goalDifference}` : '-'}
                  helper={standing ? t('goalsForAgainst', { forCount: standing.goalsFor, against: standing.goalsAgainst }) : t('waitingForData')}
                />
              </div>
            </div>

            <section className="rounded-[1.2rem] border border-white/12 bg-black/18 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
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
                        createPlayerAvatar(initialsFromName(topRatedPlayer.name), team.primaryColor ?? '#0f766e'),
                      ]}
                      alt={topRatedPlayer.name}
                      className="h-14 w-14 rounded-[1rem] object-cover ring-1 ring-white/15"
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
                    <div className="rounded-xl border border-white/10 bg-white/6 p-2.5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{t('goals')}</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.goals}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-2.5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{t('assists')}</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.assists}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-2.5">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">{t('formShort')}</p>
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
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('clubIdentity')}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('atAGlance')}</h2>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('manager')}</p>
                  <Link
                    to={`/${team.leagueId}/team/${team.id}/coach`}
                    className="mt-2 inline-block text-lg font-semibold hover:text-primary"
                  >
                    {team.manager ?? t('coachPending')}
                  </Link>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('homeGround')}</p>
                  <p className="mt-2 text-lg font-semibold">{team.stadium}</p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('momentum')}</p>
                  <p className="mt-2 text-lg font-semibold">
                    {standing ? t('winsInLastFive', { count: standing.form.filter((item) => item.result === 'W').length }) : t('noTrendYet')}
                  </p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{t('bestCurrentEdge')}</p>
                  <p className="mt-2 text-lg font-semibold">
                    {standing && standing.goalsFor >= standing.goalsAgainst ? t('attackingOutput') : t('defensiveRecovery')}
                  </p>
                </div>
              </div>
            </section>

            <section className="stat-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('shotMapProxy')}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('scoringWindows')}</h2>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="slot" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="goals" fill="hsl(var(--primary))" animationDuration={600} />
                  <Bar dataKey="conceded" fill="hsl(var(--destructive))" animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </TabsContent>

          <TabsContent value="squad" className="stat-card">
            <SquadTable players={players} />
          </TabsContent>

          <TabsContent value="results" className="stat-card">
            <ResultsTimeline matches={teamMatches} team={team} />
          </TabsContent>

          <TabsContent value="statistics" className="grid gap-4">
            <div className="stat-card">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('shapeProfile')}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('teamRadar')}</h2>
              </div>
              <TeamRadarChart />
            </div>
            <div className="stat-card">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('goalTimeline')}</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('gameStatePressure')}</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="slot" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="goals" fill="hsl(var(--primary))" animationDuration={600} />
                  <Bar dataKey="conceded" fill="#f87171" animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="form" className="stat-card">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('trendLine')}</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{t('recentForm')}</h2>
            </div>
            <FormLineChart />
          </TabsContent>
        </Tabs>
        </StaggerGridItem>
      </StaggerGrid>
    </PageWrapper>
  )
}
