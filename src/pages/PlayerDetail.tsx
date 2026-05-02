import { useParams } from 'react-router-dom'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { StatBar } from '@/components/player/StatBar'
import { PlayerRadarChart } from '@/components/player/RadarChart'
import { PerformanceChart } from '@/components/player/PerformanceChart'
import { CompareButton } from '@/components/player/CompareButton'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useFootballData } from '@/hooks/useFootballData'
import type { Match, Player, Team } from '@/services/types'

export default function PlayerDetail() {
  const { leagueId, playerId } = useParams()
  const { data: player, isLoading } = useFootballData<Player>('getPlayer', { leagueId: leagueId as never, playerId })
  const { data: matches } = useFootballData<Match[]>('getMatches', { leagueId: leagueId as never })
  const { data: team } = useFootballData<Team>('getTeam', { leagueId: leagueId as never, teamId: player?.teamId })
  if (isLoading || !player) {
    return <SkeletonCard />
  }
  return (
    <PageWrapper>
      <div className="space-y-5">
        <PlayerHeader player={player} team={team ?? undefined} action={<CompareButton playerId={player.id} />} />
        <StatBar player={player} />
        <div className="grid gap-4 lg:grid-cols-2"><PlayerRadarChart player={player} /><PerformanceChart player={player} /></div>
        <section className="stat-card"><h2 className="mb-4 text-lg font-semibold tracking-tight">Recent Matches</h2><ResultsTimeline matches={matches ?? []} team={team ?? undefined} /></section>
      </div>
    </PageWrapper>
  )
}
