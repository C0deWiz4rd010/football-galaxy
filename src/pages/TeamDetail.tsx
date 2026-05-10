import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Heart, Shield, Sparkles, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { FormLineChart } from '@/components/team/FormLineChart'
import { TeamRadarChart } from '@/components/team/RadarChart'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { SquadTable } from '@/components/team/SquadTable'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { BackButton } from '@/components/shared/BackButton'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/hooks/useFavorites'
import { useFootballData } from '@/hooks/useFootballData'
import { getPlayerCardProfile } from '@/lib/player-ratings'
import { formatMarketValue } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { LeagueSummary, Match, Squad, Team } from '@/services/types'

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
    <div className="surface-soft rounded-[1.3rem] p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

export default function TeamDetail() {
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
  const { data: leagueSummary } = useFootballData<LeagueSummary>('getLeagueSummary', {
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
    return <SkeletonCard />
  }

  const players = squad?.players ?? team.squad ?? []
  const standing = leagueSummary?.standings.find((item) => item.team.id === team.id)
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
        getPlayerCardProfile(right).overall - getPlayerCardProfile(left).overall,
    )[0]
  const chartData = ['0-15', '16-30', '31-45+', '46-60', '61-75', '76-90+'].map(
    (slot, index) => ({ slot, goals: 3 + index * 2, conceded: 1 + (index % 3) + index }),
  )

  return (
    <PageWrapper>
      <div className="space-y-5">
        <BackButton />
        <section
          className="stat-card overflow-hidden p-5 text-white shadow-[0_24px_50px_rgba(11,29,34,0.28)] sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${team.primaryColor ?? '#0f766e'}, ${team.secondaryColor ?? '#0f172a'})`,
          }}
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <AssetImage
                  src={team.crest}
                  fallbackSrc={createTeamCrest(
                    team.shortName,
                    team.primaryColor ?? '#0f766e',
                    team.secondaryColor ?? '#f8fafc',
                    0,
                  )}
                  alt={team.name}
                  className="h-24 w-24 rounded-[1.8rem] object-cover ring-1 ring-white/20"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/20 bg-white/12 text-white">{team.shortName}</Badge>
                    <Badge className="border-white/20 bg-black/15 text-white">Galaxy Live Club View</Badge>
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight">{team.name}</h1>
                  <p className="mt-1 text-white/80">
                    {team.manager} · {team.stadium} · {team.capacity?.toLocaleString()} seats
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
                    Follow
                  </Button>
                </motion.div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <TeamMetric
                  label="League position"
                  value={standing ? `#${standing.position}` : '-'}
                  helper={standing ? `${standing.points} points` : 'No table context'}
                />
                <TeamMetric
                  label="Squad size"
                  value={String(players.length)}
                  helper={`Average age ${averageAge}`}
                />
                <TeamMetric
                  label="Squad value"
                  value={formatMarketValue(squadValue)}
                  helper="Mock/live blended estimate"
                />
                <TeamMetric
                  label="Goal difference"
                  value={standing ? `${standing.goalDifference}` : '-'}
                  helper={standing ? `${standing.goalsFor} scored / ${standing.goalsAgainst} conceded` : 'Waiting for data'}
                />
              </div>
            </div>

            <section className="rounded-[1.8rem] border border-white/12 bg-black/18 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    Team spotlight
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {topRatedPlayer ? topRatedPlayer.name : 'No standout yet'}
                  </h2>
                </div>
                <Sparkles className="h-5 w-5 text-white/60" />
              </div>
              {topRatedPlayer ? (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <AssetImage
                      src={topRatedPlayer.photo}
                      fallbackSrc={createTeamCrest(team.shortName, team.primaryColor ?? '#0f766e', team.secondaryColor ?? '#f8fafc', 0)}
                      alt={topRatedPlayer.name}
                      className="h-16 w-16 rounded-[1.4rem] object-cover ring-1 ring-white/15"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-lg font-semibold">{topRatedPlayer.name}</p>
                      <p className="text-sm text-white/75">
                        {topRatedPlayer.position} · OVR {getPlayerCardProfile(topRatedPlayer).overall}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Goals</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.goals}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Assists</p>
                      <p className="mt-1 text-xl font-semibold">{topRatedPlayer.stats.assists}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Archetype</p>
                      <p className="mt-1 text-sm font-semibold">{getPlayerCardProfile(topRatedPlayer).archetype}</p>
                    </div>
                  </div>
                  <Link
                    to={`/${topRatedPlayer.leagueId}/player/${topRatedPlayer.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80"
                  >
                    Open player profile
                    <Zap className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </section>
          </div>
        </section>

        <Tabs defaultValue="overview">
          <div className="overflow-x-auto pb-1">
            <TabsList className="min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="squad">Squad</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="form">Form</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
            <section className="stat-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Club identity</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">At a glance</h2>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Manager</p>
                  <p className="mt-2 text-lg font-semibold">{team.manager}</p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Home ground</p>
                  <p className="mt-2 text-lg font-semibold">{team.stadium}</p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Momentum</p>
                  <p className="mt-2 text-lg font-semibold">
                    {standing ? `${standing.form.filter((item) => item.result === 'W').length} wins in last five` : 'No trend yet'}
                  </p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Best current edge</p>
                  <p className="mt-2 text-lg font-semibold">
                    {standing && standing.goalsFor >= standing.goalsAgainst ? 'Attacking output' : 'Defensive recovery'}
                  </p>
                </div>
              </div>
            </section>

            <section className="stat-card">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Shot map proxy</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Scoring windows</h2>
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
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Shape profile</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Team Radar</h2>
              </div>
              <TeamRadarChart />
            </div>
            <div className="stat-card">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Goal timeline</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Game-state pressure</h2>
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
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Trend line</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Recent Form</h2>
            </div>
            <FormLineChart />
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  )
}
