import { Link, useParams } from 'react-router-dom'

import { Briefcase, Building2, Trophy } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/shared/BackButton'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { ErrorState, NotFoundState } from '@/components/shared/StatusStates'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useLeagueSummary, useTeam } from '@/hooks/queries/football'
import { isNotFoundError } from '@/services/errors'
import { isLeagueId } from '@/lib/leagues'

export default function CoachDetail() {
  const { t } = useLocale()
  const params = useParams()
  const leagueId = isLeagueId(params.leagueId) ? params.leagueId : undefined
  const teamId = params.teamId
  const enabled = Boolean(leagueId && teamId)
  const { data: team, isPending, error, refetch } = useTeam(leagueId, teamId)
  const notFound = isNotFoundError(error)
  const { data: leagueSummary } = useLeagueSummary(leagueId)

  if (!enabled || notFound) {
    return (
      <PageWrapper>
        <NotFoundState
          title={t('teamNotFound')}
          description={t('teamNotFoundDescription')}
          backTo={leagueId ? `/${leagueId}` : '/'}
          backLabel={t(leagueId ? 'backToLeague' : 'goHome')}
        />
      </PageWrapper>
    )
  }

  if (error && !team) {
    return (
      <PageWrapper>
        <ErrorState onRetry={() => void refetch()} />
      </PageWrapper>
    )
  }

  if (isPending || !team) {
    return (
      <PageWrapper>
        <SkeletonCard />
      </PageWrapper>
    )
  }

  const standing = leagueSummary?.standings.find((item) => item.team.id === team.id)

  return (
    <PageWrapper>
      <div className="space-y-4">
        <BackButton fallbackTo={`/${team.leagueId}/team/${team.id}`} />
        <section className="stat-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('coachProfile')}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {team.manager ?? t('headCoachPending')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('currentContextFor', { name: team.name })}
              </p>
            </div>
            <Badge variant="outline">{team.shortName}</Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="surface-soft rounded-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-eyebrow">{t('club')}</span>
              </div>
              <Link
                to={`/${team.leagueId}/team/${team.id}`}
                className="mt-2 block text-base font-semibold hover:text-primary"
              >
                {team.name}
              </Link>
            </div>
            <div className="surface-soft rounded-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-xs uppercase tracking-eyebrow">{t('tableContext')}</span>
              </div>
              <p className="mt-2 text-base font-semibold">
                {standing ? t('standingShort', { position: standing.position, points: standing.points }) : t('standingsPending')}
              </p>
            </div>
            <div className="surface-soft rounded-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs uppercase tracking-eyebrow">{t('homeBase')}</span>
              </div>
              <p className="mt-2 text-base font-semibold">{team.stadium ?? t('venueDataPending')}</p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
