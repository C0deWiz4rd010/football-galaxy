import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArrowRight, Award, Clock3, Shield, Sparkles, Target } from 'lucide-react'

import { CompareButton } from '@/components/player/CompareButton'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { PerformanceChart } from '@/components/player/PerformanceChart'
import { PlayerRadarChart } from '@/components/player/RadarChart'
import { StatBar } from '@/components/player/StatBar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { BackButton } from '@/components/shared/BackButton'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { Badge } from '@/components/ui/badge'
import { useFootballData } from '@/hooks/useFootballData'
import { getPlayerCardProfile } from '@/lib/player-ratings'
import { formatMarketValue } from '@/lib/utils'
import type { LeagueSummary, Match, Player, Team } from '@/services/types'

function DetailMetric({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper: string
  icon: React.ReactNode
}) {
  return (
    <div className="surface-soft rounded-[1.3rem] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

export default function PlayerDetail() {
  const { leagueId, playerId } = useParams()
  const { data: player, isLoading } = useFootballData<Player>('getPlayer', {
    leagueId: leagueId as never,
    playerId,
  })
  const { data: leagueSummary } = useFootballData<LeagueSummary>('getLeagueSummary', {
    leagueId: leagueId as never,
  })
  const { data: matches } = useFootballData<Match[]>('getMatches', {
    leagueId: leagueId as never,
  })
  const { data: team } = useFootballData<Team>('getTeam', {
    leagueId: leagueId as never,
    teamId: player?.teamId,
  })

  const playerMatches = useMemo(() => {
    if (!player || !matches) {
      return []
    }

    return matches.filter(
      (match) => match.homeTeam.id === player.teamId || match.awayTeam.id === player.teamId,
    )
  }, [matches, player])

  if (isLoading || !player) {
    return <SkeletonCard />
  }

  const card = getPlayerCardProfile(player)
  const teamStanding = leagueSummary?.standings.find(
    (standing) => standing.team.id === player.teamId,
  )
  const contributionRate =
    player.stats.appearances > 0
      ? ((player.stats.goals + player.stats.assists) / player.stats.appearances).toFixed(2)
      : '0.00'
  const availability =
    player.stats.appearances > 0
      ? `${Math.round((player.stats.minutes / (player.stats.appearances * 90)) * 100)}%`
      : '0%'

  return (
    <PageWrapper>
      <div className="space-y-5">
        <BackButton />
        <PlayerHeader
          player={player}
          team={team ?? undefined}
          action={<CompareButton playerId={player.id} />}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <section className="stat-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Player profile
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">Live profile overview</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{player.position}</Badge>
                  <Badge>{card.archetype}</Badge>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <DetailMetric
                  label="Overall"
                  value={String(card.overall)}
                  helper="App-generated rating"
                  icon={<Award className="h-5 w-5" />}
                />
                <DetailMetric
                  label="Contribution"
                  value={contributionRate}
                  helper="Goals + assists per match"
                  icon={<Target className="h-5 w-5" />}
                />
                <DetailMetric
                  label="Availability"
                  value={availability}
                  helper="Minutes per appearance"
                  icon={<Clock3 className="h-5 w-5" />}
                />
                <DetailMetric
                  label="Discipline"
                  value={`${player.stats.yellowCards}/${player.stats.redCards}`}
                  helper="Yellow / red cards"
                  icon={<Shield className="h-5 w-5" />}
                />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Squad context
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {team ? team.name : 'Team loading'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {teamStanding
                      ? `Current league position ${teamStanding.position} with ${teamStanding.points} points`
                      : 'League standing context unavailable'}
                  </p>
                </div>
                <div className="surface-soft rounded-[1.3rem] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Contract and value
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatMarketValue(player.marketValueEurCents)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contract until {player.contractUntil}
                  </p>
                </div>
              </div>
            </section>

            <StatBar player={player} />
            <div className="grid gap-4 lg:grid-cols-2">
              <PlayerRadarChart player={player} />
              <PerformanceChart player={player} />
            </div>
          </div>

          <div className="space-y-4">
            <section className="stat-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Scouting notes
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    Football Galaxy read
                  </h2>
                </div>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  {player.name} projects as a <span className="font-medium text-foreground">{card.archetype}</span> with a strong {player.stats.attributes.passing >= player.stats.attributes.shooting ? 'build-up' : 'finishing'} profile.
                </p>
                <p>
                  The current internal scouting tier is <span className="font-medium text-foreground">{card.tier}</span>, based on age, production, and role-specific output.
                </p>
                {team ? (
                  <Link
                    to={`/${team.leagueId}/team/${team.id}`}
                    className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    Open full team context
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <section className="stat-card">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Match context
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Recent Team Matches</h2>
          </div>
          {team ? (
            <ResultsTimeline matches={playerMatches.slice(0, 8)} team={team} />
          ) : (
            <EmptyState
              title="No match context"
              description="Recent team matches are not available for this player yet."
            />
          )}
        </section>
      </div>
    </PageWrapper>
  )
}
