import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ArrowRight, Award, Clock3, Heart, Shield, Sparkles, Target } from 'lucide-react'

import { CompareButton } from '@/components/player/CompareButton'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { BackButton } from '@/components/shared/BackButton'
import { PerformanceChart } from '@/components/player/PerformanceChart'
import { PlayerRadarChart } from '@/components/player/RadarChart'
import { StatBar } from '@/components/player/StatBar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { MetricTile } from '@/components/shared/MetricTile'
import { FormBadge } from '@/components/shared/FormBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorState, NotFoundState } from '@/components/shared/StatusStates'
import { StaggerGrid, StaggerGridItem } from '@/components/shared/StaggerGrid'
import { ResultsTimeline } from '@/components/team/ResultsTimeline'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueSummary, usePlayer, useTeam, useTeamMatches } from '@/hooks/queries/football'
import { isNotFoundError } from '@/services/errors'
import { useFavorites } from '@/hooks/useFavorites'
import { isLeagueId } from '@/lib/leagues'
import type { Player } from '@/services/types'
import { getFormScore } from '@/lib/player-ratings'

function FavoriteHeartButton({ player }: { player: Player }) {
  const { t } = useLocale()
  const favorites = useFavorites()
  const isFavorite = favorites.isPlayerFavorite(player.id)
  return (
    <button
      type="button"
      onClick={() => favorites.togglePlayer({ id: player.id, leagueId: player.leagueId, name: player.name, image: player.photo })}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('unfollowPlayer') : t('followPlayer')}
      title={isFavorite ? t('unfollowPlayer') : t('followPlayer')}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
        isFavorite
          ? 'border-danger/40 bg-danger/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
          : 'border-border/60 bg-background/40 text-muted-foreground hover:text-rose-400 hover:border-danger/40'
      }`}
    >
      <Heart className={`h-5 w-5 transition-transform group-active:scale-90 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  )
}

export default function PlayerDetail() {
  const { t } = useLocale()
  const params = useParams()
  const leagueId = isLeagueId(params.leagueId) ? params.leagueId : undefined
  const playerId = params.playerId
  const enabled = Boolean(leagueId && playerId)
  const { data: player, isPending, error, refetch } = usePlayer(leagueId, playerId)
  const notFound = isNotFoundError(error)
  const { data: leagueSummary } = useLeagueSummary(leagueId)
  const leaderPool = useMemo(() => leagueSummary?.playerPool.map((entry) => entry.player) ?? [], [leagueSummary])
  const { data: matches } = useTeamMatches(leagueId, player?.teamId)
  // Only resolves once the player (and therefore its team id) is known.
  const { data: team } = useTeam(leagueId, player?.teamId)

  const playerMatches = useMemo(() => {
    if (!player || !matches) {
      return []
    }

    // Next fixture first, then the latest results, newest first.
    const next = matches.filter((match) => match.status !== 'FINISHED').slice(0, 1)
    const recent = matches.filter((match) => match.status === 'FINISHED').reverse()
    return [...next, ...recent]
  }, [matches, player])

  if (!enabled || notFound) {
    return (
      <PageWrapper>
        <NotFoundState
          title={t('playerNotFound')}
          description={t('playerNotFoundDescription')}
          backTo={leagueId ? `/${leagueId}` : '/'}
          backLabel={t(leagueId ? 'backToLeague' : 'goHome')}
        />
      </PageWrapper>
    )
  }

  if (error && !player) {
    return (
      <PageWrapper>
        <ErrorState onRetry={() => void refetch()} />
      </PageWrapper>
    )
  }

  if (isPending || !player) {
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
            backButton={<BackButton variant="icon" fallbackTo={`/${player.leagueId}`} />}
            action={
              <div className="flex items-center gap-2">
                <FavoriteHeartButton player={player} />
                <CompareButton playerId={player.id} leagueId={player.leagueId} />
              </div>
            }
          />
        </StaggerGridItem>

        <StaggerGridItem className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.72fr)]">
          <div className="space-y-4">
            <section className="stat-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
                    {t('playerProfile')}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">{t('liveProfileOverview')}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{player.position}</Badge>
                  <FormBadge player={player} variant="full" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
                <MetricTile
                  label={t('formScore')}
                  value={String(card.score)}
                  helper={t('formDerivedFromResults', { label: card.label })}
                  icon={<Award className="h-4 w-4 text-amber-400" />}
                />
                <MetricTile
                  label={t('contribution')}
                  value={contributionRate}
                  helper={t('contributionHelper')}
                  icon={<Target className="h-4 w-4 text-orange-400" />}
                />
                <MetricTile
                  label={t('availability')}
                  value={availability}
                  helper={t('availabilityHelper')}
                  icon={<Clock3 className="h-4 w-4 text-sky-400" />}
                />
                <MetricTile
                  label={t('discipline')}
                  value={`${player.stats.yellowCards}/${player.stats.redCards}`}
                  helper={t('disciplineHelper')}
                  icon={<Shield className="h-4 w-4 text-emerald-400" />}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="surface-soft rounded-lg p-3">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
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
                <div className="surface-soft rounded-lg p-3">
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
                    {t('minutesPlayed')}
                  </p>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {player.stats.minutes.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {player.stats.appearances > 0
                      ? t('minutesPerAppearance', { value: Math.round(player.stats.minutes / player.stats.appearances) })
                      : t('noMinutesYet')}
                  </p>
                </div>
              </div>
            </section>

            <StatBar player={player} />
            <div className="grid gap-4 lg:grid-cols-2">
              <PlayerRadarChart player={player} pool={leaderPool} />
              <PerformanceChart player={player} />
            </div>
          </div>

          <div className="space-y-4">
            <section className="stat-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
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
                <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">
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
