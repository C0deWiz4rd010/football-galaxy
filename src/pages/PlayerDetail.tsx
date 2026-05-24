import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArrowLeft, ArrowRight, Award, Clock3, Heart, Shield, Sparkles, Target } from 'lucide-react'

import { CompareButton } from '@/components/player/CompareButton'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { PerformanceChart } from '@/components/player/PerformanceChart'
import { PlayerRadarChart } from '@/components/player/RadarChart'
import { StatBar } from '@/components/player/StatBar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormBadge } from '@/components/shared/FormBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useFootballData } from '@/hooks/useFootballData'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '@/hooks/useFavorites'
import { getFormScore } from '@/lib/player-ratings'
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
    <div className="surface-soft flex items-center gap-3 rounded-[1rem] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{helper}</p>
      </div>
      <p className="shrink-0 font-mono text-xl font-black leading-none tabular-nums">{value}</p>
    </div>
  )
}
function FavoriteHeartButton({ playerId }: { playerId: string }) {
  const { t } = useLocale()
  const favorites = useFavorites()
  const isFavorite = favorites.isPlayerFavorite(playerId)
  return (
    <button
      type="button"
      onClick={() => favorites.togglePlayer(playerId)}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('unfollowPlayer') : t('followPlayer')}
      title={isFavorite ? t('unfollowPlayer') : t('followPlayer')}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
        isFavorite
          ? 'border-rose-400/40 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
          : 'border-border/60 bg-background/40 text-muted-foreground hover:text-rose-400 hover:border-rose-400/40'
      }`}
    >
      <Heart className={`h-5 w-5 transition-transform group-active:scale-90 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  )
}

export default function PlayerDetail() {
  const { t } = useLocale()
  const navigate = useNavigate()
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
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    )
  }

  const card = getFormScore(player)
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
      <StaggerGrid className="space-y-4">
        <StaggerGridItem>
          <PlayerHeader
            player={player}
            team={team ?? undefined}
            backButton={
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label={t('back')}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm transition hover:bg-background hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            }
            action={
              <div className="flex items-center gap-2">
                <FavoriteHeartButton playerId={player.id} />
                <CompareButton playerId={player.id} />
              </div>
            }
          />
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.72fr)]">
          <div className="space-y-4">
            <section className="stat-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {t('playerProfile')}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{t('liveProfileOverview')}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{player.position}</Badge>
                  <FormBadge player={player} variant="full" />
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <DetailMetric
                  label={t('formScore')}
                  value={String(card.score)}
                  helper={t('formDerivedFromResults', { label: card.label })}
                  icon={<Award className="h-4 w-4 text-amber-400" />}
                />
                <DetailMetric
                  label={t('contribution')}
                  value={contributionRate}
                  helper={t('contributionHelper')}
                  icon={<Target className="h-4 w-4 text-orange-400" />}
                />
                <DetailMetric
                  label={t('availability')}
                  value={availability}
                  helper={t('availabilityHelper')}
                  icon={<Clock3 className="h-4 w-4 text-sky-400" />}
                />
                <DetailMetric
                  label={t('discipline')}
                  value={`${player.stats.yellowCards}/${player.stats.redCards}`}
                  helper={t('disciplineHelper')}
                  icon={<Shield className="h-4 w-4 text-emerald-400" />}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {t('squadContext')}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {team ? team.name : t('teamLoading')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {teamStanding
                      ? t('teamStandingContext', { position: teamStanding.position, points: teamStanding.points })
                      : t('leagueStandingUnavailable')}
                  </p>
                </div>
                <div className="surface-soft rounded-[1rem] p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {t('contractAndValue')}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formatMarketValue(player.marketValueEurCents)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('contractUntilLabel', { date: player.contractUntil })}
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
                    {t('scoutingNotes')}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {t('footballGalaxyRead')}
                  </h2>
                </div>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  {t('playerFormSummary', { name: player.name, label: card.label, score: card.score })}
                </p>
                {card.traits.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {card.traits.map((trait) => (
                      <Badge key={trait} variant="outline">{trait}</Badge>
                    ))}
                  </div>
                ) : null}
                {team ? (
                  <Link
                    to={`/${team.leagueId}/team/${team.id}`}
                    className="inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    {t('openFullTeamContext')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </section>

            <section className="stat-card">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t('matchContext')}
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight">{t('recentTeamMatches')}</h2>
              </div>
              {team ? (
                <ResultsTimeline matches={playerMatches.slice(0, 6)} team={team} />
              ) : (
                <EmptyState
                  title={t('noMatchContext')}
                  description={t('noMatchContextHint')}
                />
              )}
            </section>
          </div>
        </StaggerGridItem>
      </StaggerGrid>
    </PageWrapper>
  )
}
