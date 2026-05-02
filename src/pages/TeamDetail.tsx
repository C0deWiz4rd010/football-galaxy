import { useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SquadTable } from '@/components/team/SquadTable'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { TeamRadarChart } from '@/components/team/RadarChart'
import { FormLineChart } from '@/components/team/FormLineChart'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AssetImage } from '@/components/shared/AssetImage'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useFootballData } from '@/hooks/useFootballData'
import { useFavorites } from '@/hooks/useFavorites'
import { formatMarketValue } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Match, Squad, Team } from '@/services/types'

export default function TeamDetail() {
  const { leagueId, teamId } = useParams()
  const { data: team, isLoading } = useFootballData<Team>('getTeam', { leagueId: leagueId as never, teamId })
  const { data: squad } = useFootballData<Squad>('getSquad', { leagueId: leagueId as never, teamId })
  const { data: matches } = useFootballData<Match[]>('getMatches', { leagueId: leagueId as never })
  const favorites = useFavorites()
  if (isLoading || !team) {
    return <SkeletonCard />
  }
  const players = squad?.players ?? team.squad ?? []
  const chartData = ['0-15', '16-30', '31-45+', '46-60', '61-75', '76-90+'].map((slot, index) => ({ slot, goals: 3 + index * 2 }))
  return (
    <PageWrapper>
      <section className="mb-5 rounded-[28px] p-5 text-white shadow-[0_24px_50px_rgba(11,29,34,0.28)] sm:p-6" style={{ background: `linear-gradient(135deg, ${team.primaryColor ?? '#0f766e'}, ${team.secondaryColor ?? '#0f172a'})` }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <AssetImage src={team.crest} fallbackSrc={createTeamCrest(team.shortName, team.primaryColor ?? '#0f766e', team.secondaryColor ?? '#f8fafc', 0)} alt={team.name} className="h-24 w-24 rounded-2xl object-cover ring-1 ring-white/20" loading="lazy" />
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{team.name}</h1>
            <p className="mt-1 text-white/80">{team.manager} | {team.stadium} | {team.capacity?.toLocaleString()} seats</p>
            <p className="mt-2 text-sm text-white/70">Squad value {formatMarketValue(players.reduce((sum, player) => sum + player.marketValueEurCents, 0))}</p>
          </div>
          <motion.div whileTap={{ scale: 1.14 }}>
            <Button variant="secondary" onClick={() => favorites.toggleTeam(team.id)}><Heart className={favorites.isTeamFavorite(team.id) ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4'} /> Follow</Button>
          </motion.div>
        </div>
      </section>
      <Tabs defaultValue="squad">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max"><TabsTrigger value="squad">Squad</TabsTrigger><TabsTrigger value="results">Results</TabsTrigger><TabsTrigger value="statistics">Statistics</TabsTrigger><TabsTrigger value="form">Form</TabsTrigger></TabsList>
        </div>
        <TabsContent value="squad" className="stat-card"><SquadTable players={players} /></TabsContent>
        <TabsContent value="results" className="stat-card"><ResultsTimeline matches={matches ?? []} team={team} /></TabsContent>
        <TabsContent value="statistics" className="grid gap-4"><div className="stat-card"><TeamRadarChart /></div><div className="stat-card"><ResponsiveContainer width="100%" height={260}><BarChart data={chartData}><XAxis dataKey="slot" /><YAxis /><Tooltip /><Bar dataKey="goals" fill="hsl(var(--primary))" animationDuration={600} /></BarChart></ResponsiveContainer></div></TabsContent>
        <TabsContent value="form" className="stat-card"><FormLineChart /></TabsContent>
      </Tabs>
    </PageWrapper>
  )
}
