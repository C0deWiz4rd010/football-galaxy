import { useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeagueTable } from '@/components/league/LeagueTable'
import { TopScorersCard } from '@/components/league/TopScorersCard'
import { TopAssistsCard } from '@/components/league/TopAssistsCard'
import { FormTableCard } from '@/components/league/FormTableCard'
import { MatchOfTheDay } from '@/components/league/MatchOfTheDay'
import { TeamStatsCard } from '@/components/league/TeamStatsCard'
import { AssetImage } from '@/components/shared/AssetImage'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useFootballData } from '@/hooks/useFootballData'
import { useDataSource } from '@/contexts/DataSourceContext'
import { formatDateTime } from '@/lib/utils'
import { getLeague, isLeagueId } from '@/lib/leagues'
import { createLeagueLogo } from '@/lib/visualAssets'
import type { LeagueSummary } from '@/services/types'

export default function LeagueDashboard() {
  const { leagueId: routeLeagueId } = useParams()
  const leagueId = isLeagueId(routeLeagueId) ? routeLeagueId : 'premier-league'
  const { source } = useDataSource()
  const { data, isLoading, error, refetch } = useFootballData<LeagueSummary>('getLeagueSummary', { leagueId })
  const league = data?.league ?? getLeague(leagueId)

  if (isLoading && !data) {
    return <div className="grid gap-4 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
  }
  if (error) {
    return <div className="stat-card flex items-center gap-3"><AlertCircle className="h-5 w-5 text-destructive" /><span>{error}</span><Button onClick={refetch}>Try again</Button></div>
  }
  if (!data) {
    return <EmptyState title="No league data" description="This league has no standings yet." />
  }

  return (
    <PageWrapper>
      <section className="mb-5 flex flex-col gap-4 rounded-[28px] border bg-card/70 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <AssetImage src={league.logo} fallbackSrc={createLeagueLogo(league.abbreviation, league.color, league.name)} alt={`${league.name} logo`} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-black/10" loading="lazy" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{league.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>{data.season.label}</Badge>
              {source === 'live' && data.lastUpdated ? <span className="text-xs text-muted-foreground">Updated {formatDateTime(data.lastUpdated)}</span> : null}
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <LeagueTable standings={data.standings} />
        <TopScorersCard title="Top Scorers" items={data.topScorers} />
        <TopAssistsCard items={data.topAssists} />
        <FormTableCard standings={data.standings} />
        <MatchOfTheDay match={data.recentMatches[0]!} />
        <TeamStatsCard standings={data.standings} />
      </div>
    </PageWrapper>
  )
}
