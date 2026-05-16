import type { ReactNode } from 'react'

import { Link, useParams } from 'react-router-dom'

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
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataSource } from '@/contexts/DataSourceContext'
import { useFootballData } from '@/hooks/useFootballData'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { formatDateTime } from '@/lib/utils'
import { createLeagueLogo } from '@/lib/visualAssets'
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
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="surface-soft rounded-[1rem] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight">{value}</p>
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
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  text: string
  href?: string
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
          Open details
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
  const { runtimeLabel, source } = useDataSource()
  const { data, isLoading, error, refetch } = useFootballData<LeagueSummary>(
    'getLeagueSummary',
    { leagueId },
  )
  const league = data?.league ?? getLeague(leagueId)

  if (isLoading && !data) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="stat-card flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span>{error}</span>
        <Button onClick={refetch}>Try again</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="No league data"
        description="This league has no standings yet."
      />
    )
  }

  const standings = data.standings ?? []
  const topScorers = data.topScorers ?? []
  const topAssists = data.topAssists ?? []
  const recentMatches = data.recentMatches ?? []
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
      <div className="space-y-4">
        <section
          className="stat-card app-grid-lines overflow-hidden p-4 sm:p-5"
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
                      <Badge className="bg-white/10 text-foreground">{runtimeLabel}</Badge>
                    </div>
                    <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">{league.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Table first, fast context second.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{data.season.label}</Badge>
                  {typeof data.season.currentMatchday === 'number' ? (
                    <Badge variant="outline">Matchday {data.season.currentMatchday}</Badge>
                  ) : null}
                  {source === 'live' && data.lastUpdated ? (
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDateTime(data.lastUpdated)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryStat
                  label="Leader"
                  value={leader ? leader.team.shortName : '-'}
                  helper={leader ? `${leader.points} points` : 'No standings yet'}
                />
                <SummaryStat
                  label="Best attack"
                  value={topAttack ? String(topAttack.goalsFor) : '-'}
                  helper={topAttack ? topAttack.team.shortName : 'No scoring data'}
                />
                <SummaryStat
                  label="Best defense"
                  value={topDefense ? String(topDefense.goalsAgainst) : '-'}
                  helper={topDefense ? topDefense.team.shortName : 'No defending data'}
                />
                <SummaryStat
                  label="Form monster"
                  value={formLeader ? `${getFormPoints(formLeader)}/15` : '-'}
                  helper={formLeader ? formLeader.team.shortName : 'Waiting for trend data'}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Link to="/teams" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Explore</span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Teams Explorer</span>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link to="/players" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Explore</span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Players Explorer</span>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link to="/compare" className="interactive-card surface-soft rounded-[1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Compare</span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Player Matchups</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div className="surface-soft rounded-[1rem] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Title pulse
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold tracking-tight">
                      {leader?.team.name ?? league.name} set the pace
                    </h2>
                  </div>
                  <Flame className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {leader
                    ? `${leader.team.name} lead the table after ${leader.played} matches with a goal difference of ${leader.goalDifference}.`
                    : 'The title race will appear here as soon as standings are available.'}
                </p>
              </div>

              <div className="surface-soft rounded-[1rem] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Spotlight player
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold tracking-tight">
                      {spotlightPlayer ? spotlightPlayer.name : 'No featured player yet'}
                    </h2>
                  </div>
                  <Star className="h-5 w-5 text-muted-foreground" />
                </div>
                {spotlightPlayer ? (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{spotlightPlayer.position}</Badge>
                      {spotlightTeamLabel ? <Badge variant="outline">{spotlightTeamLabel}</Badge> : null}
                      <Badge>{scorer?.player.id === spotlightPlayer.id ? `${scorer.goals} goals` : `${playmaker?.assists ?? 0} assists`}</Badge>
                    </div>
                    <Link
                      to={`/${spotlightPlayer.leagueId}/player/${spotlightPlayer.id}`}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      Open player profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    A featured player card will appear here once scoring or creative leaders are available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <LeagueTable standings={standings} />

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="grid gap-3 lg:grid-cols-2">
            <StorylineCard
              icon={<Flame className="h-5 w-5" />}
              eyebrow="Rising Team"
              title={risingTeam ? risingTeam.team.name : 'No breakout yet'}
              text={
                risingTeam
                  ? `${risingTeam.team.shortName} own the strongest goal difference trend in the league right now and look built for a sustained push.`
                  : 'A breakout club story will appear here as the data fills in.'
              }
              href={risingTeam ? `/${risingTeam.leagueId}/team/${risingTeam.team.id}` : undefined}
            />
            <StorylineCard
              icon={<Target className="h-5 w-5" />}
              eyebrow="Playmaker Of The Week"
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
              icon={<Shield className="h-5 w-5" />}
              eyebrow="Defensive Anchor"
              title={topDefense ? topDefense.team.name : 'No wall yet'}
              text={
                topDefense
                  ? `${topDefense.team.shortName} have conceded only ${topDefense.goalsAgainst} goals, setting the defensive standard for the league.`
                  : 'The best defensive side will appear here once enough matches are logged.'
              }
              href={topDefense ? `/${topDefense.leagueId}/team/${topDefense.team.id}` : undefined}
            />
            <StorylineCard
              icon={<Sparkles className="h-5 w-5" />}
              eyebrow="Explore More"
              title="Jump into clubs and players"
              text="Use the explorer views to browse every available team and player instead of relying only on the league dashboard."
            />
          </div>

          <div className="grid gap-3">
            <MatchOfTheDay match={recentMatches[0]} />
            <FormTableCard standings={standings} />
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,0.8fr)]">
          <TopScorersCard title="Top Scorers" items={topScorers} />
          <TopAssistsCard items={topAssists} />
          <TeamStatsCard standings={standings} />
        </div>
      </div>
    </PageWrapper>
  )
}
