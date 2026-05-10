import type { ReactNode } from 'react'

import { Link, useParams } from 'react-router-dom'

import { Activity, AlertCircle, ArrowRight, Shield, Sparkles, Target, Trophy, Zap } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormTableCard } from '@/components/league/FormTableCard'
import { LeagueTable } from '@/components/league/LeagueTable'
import { MatchOfTheDay } from '@/components/league/MatchOfTheDay'
import { TeamStatsCard } from '@/components/league/TeamStatsCard'
import { TopAssistsCard } from '@/components/league/TopAssistsCard'
import { TopScorersCard } from '@/components/league/TopScorersCard'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { AssetImage } from '@/components/shared/AssetImage'
import { useDataSource } from '@/contexts/DataSourceContext'
import { useAppMode } from '@/hooks/useAppMode'
import { useFavorites } from '@/hooks/useFavorites'
import { useFootballData } from '@/hooks/useFootballData'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { getPlayerCardProfile } from '@/lib/player-ratings'
import { formatDateTime } from '@/lib/utils'
import { createLeagueLogo, createPlayerAvatar, initialsFromName } from '@/lib/visualAssets'
import type { LeagueSummary, Player, Standing } from '@/services/types'

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

function DashboardMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="surface-soft rounded-[1.4rem] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-foreground">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function SpotlightPlayerCard({
  leagueColor,
  player,
}: {
  leagueColor: string
  player: Player
}) {
  const favorites = useFavorites()
  const { mode } = useAppMode()
  const card = getPlayerCardProfile(player)
  const fallback = createPlayerAvatar(initialsFromName(player.name), leagueColor)
  const accentStyle = {
    background:
      mode === 'ea-fc'
        ? `linear-gradient(135deg, ${leagueColor}40, rgba(244, 180, 56, 0.24))`
        : `linear-gradient(135deg, ${leagueColor}30, rgba(255,255,255,0.04))`,
  }

  return (
    <section className="stat-card relative overflow-hidden">
      <div className="absolute inset-0 opacity-90" style={accentStyle} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Spotlight Player
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {mode === 'ea-fc' ? 'EA FC Preview' : 'League Breakout'}
          </h2>
        </div>
        <FavoriteButton
          active={favorites.isPlayerFavorite(player.id)}
          label={`Toggle ${player.name} favorite`}
          onToggle={() => favorites.togglePlayer(player.id)}
        />
      </div>

      <div className="relative mt-5 flex items-center gap-4">
        <AssetImage
          src={player.photo}
          fallbackSrc={fallback}
          alt={player.name}
          className="h-20 w-20 rounded-[1.6rem] object-cover ring-2 ring-white/15"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/12 text-foreground">{player.position}</Badge>
            <Badge variant="outline">{card.tier}</Badge>
          </div>
          <h3 className="mt-2 truncate text-2xl font-semibold">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{card.archetype}</p>
        </div>
        <div className="shrink-0 rounded-[1.6rem] border border-white/10 bg-black/20 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">OVR</p>
          <p className="text-3xl font-black">{card.overall}</p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2">
        {Object.entries(card.attributes).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {key.slice(0, 3)}
            </p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <Link
        to={`/${player.leagueId}/player/${player.id}`}
        className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground/90 hover:text-foreground"
      >
        Open player profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export default function LeagueDashboard() {
  const { leagueId: routeLeagueId } = useParams()
  const leagueId = isLeagueId(routeLeagueId) ? routeLeagueId : 'premier-league'
  const { source } = useDataSource()
  const { mode } = useAppMode()
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

  if (error) {
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

  const leader = data.standings[0]
  const topAttack = [...data.standings].sort((left, right) => right.goalsFor - left.goalsFor)[0]
  const topDefense = [...data.standings].sort((left, right) => left.goalsAgainst - right.goalsAgainst)[0]
  const formLeader = [...data.standings].sort(
    (left, right) => getFormPoints(right) - getFormPoints(left),
  )[0]
  const spotlightPlayer = data.topScorers[0]?.player ?? data.topAssists[0]?.player

  return (
    <PageWrapper>
      <div className="space-y-5">
        <section
          className="stat-card app-grid-lines relative overflow-hidden p-5 sm:p-6 lg:p-7"
          style={{
            backgroundImage:
              mode === 'ea-fc'
                ? `radial-gradient(circle at top right, ${league.color}32, transparent 28%), linear-gradient(140deg, rgba(244,180,56,0.14), transparent 55%)`
                : `radial-gradient(circle at top right, ${league.color}28, transparent 28%)`,
          }}
        >
          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <AssetImage
                    src={league.logo}
                    fallbackSrc={createLeagueLogo(
                      league.abbreviation,
                      league.color,
                      league.name,
                    )}
                    alt={`${league.name} logo`}
                    className="h-20 w-20 rounded-[1.7rem] object-cover ring-1 ring-white/10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{league.country}</Badge>
                      <Badge className="bg-white/10 text-foreground">
                        {mode === 'ea-fc' ? 'EA FC Layer Active' : 'Galaxy Live'}
                      </Badge>
                    </div>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                      {league.name}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                      {mode === 'ea-fc'
                        ? 'Switching to card mode reveals derived ratings, archetypes, and collectible-style presentation on top of the live league story.'
                        : 'A premium league control room with standings, momentum, featured players, and match context built for quick scanning.'}
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

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardMetric
                  icon={<Trophy className="h-5 w-5" />}
                  label="Current Leader"
                  value={leader ? leader.team.shortName : '-'}
                  detail={leader ? `${leader.points} pts after ${leader.played} matches` : 'No leader yet'}
                />
                <DashboardMetric
                  icon={<Target className="h-5 w-5" />}
                  label="Best Attack"
                  value={topAttack ? String(topAttack.goalsFor) : '-'}
                  detail={topAttack ? `${topAttack.team.shortName} goals scored` : 'Waiting for data'}
                />
                <DashboardMetric
                  icon={<Shield className="h-5 w-5" />}
                  label="Best Defense"
                  value={topDefense ? String(topDefense.goalsAgainst) : '-'}
                  detail={topDefense ? `${topDefense.team.shortName} goals conceded` : 'Waiting for data'}
                />
                <DashboardMetric
                  icon={<Activity className="h-5 w-5" />}
                  label="Form Leader"
                  value={formLeader ? `${getFormPoints(formLeader)}/15` : '-'}
                  detail={formLeader ? `${formLeader.team.shortName} in the last five` : 'Waiting for data'}
                />
              </div>

              <div className="surface-soft grid gap-3 rounded-[1.5rem] p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Title Pulse
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {leader?.team.name ?? league.name} set the tempo
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Breakout Attack
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {data.topScorers[0]
                      ? `${data.topScorers[0].player.name} leads the goals race`
                      : 'Scoring race loading'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Creative Engine
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {data.topAssists[0]
                      ? `${data.topAssists[0].player.name} drives the final pass`
                      : 'Assist race loading'}
                  </p>
                </div>
              </div>
            </div>

            {spotlightPlayer ? (
              <SpotlightPlayerCard leagueColor={league.color} player={spotlightPlayer} />
            ) : null}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <LeagueTable standings={data.standings} />
          <div className="grid gap-4">
            <MatchOfTheDay match={data.recentMatches[0]!} />
            <FormTableCard standings={data.standings} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,0.9fr)]">
          <TopScorersCard title="Top Scorers" items={data.topScorers} />
          <TopAssistsCard items={data.topAssists} />
          <TeamStatsCard standings={data.standings} />
        </div>

        <section className="stat-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                New Idea
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                League storylines and smart tags
              </h2>
            </div>
            <Badge variant="outline" className="w-fit">
              Suggested next enhancement
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="surface-soft rounded-[1.4rem] p-4">
              <Zap className="h-5 w-5 text-foreground" />
              <h3 className="mt-3 font-semibold">Momentum tags</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add labels like Form Monster, Chance Creator, and Defensive Anchor to make tables and player cards more instantly readable.
              </p>
            </div>
            <div className="surface-soft rounded-[1.4rem] p-4">
              <Sparkles className="h-5 w-5 text-foreground" />
              <h3 className="mt-3 font-semibold">Hero moments</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Rotate one live storyline per league, such as title race pressure, breakout player, or clean-sheet run.
              </p>
            </div>
            <div className="surface-soft rounded-[1.4rem] p-4">
              <Trophy className="h-5 w-5 text-foreground" />
              <h3 className="mt-3 font-semibold">Mode-aware compare</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Let users jump from the spotlight card into a live-vs-card compare flow once the compare redesign lands.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
