import { Link, useParams } from 'react-router-dom'

import { Briefcase, Building2, Trophy } from 'lucide-react'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/shared/BackButton'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useFootballData } from '@/hooks/useFootballData'
import type { LeagueSummary, Team } from '@/services/types'

export default function CoachDetail() {
  const { t } = useLocale()
  const { leagueId, teamId } = useParams()
  const { data: team, isLoading } = useFootballData<Team>('getTeam', {
    leagueId: leagueId as never,
    teamId,
  })
  const { data: leagueSummary } = useFootballData<LeagueSummary>('getLeagueSummary', {
    leagueId: leagueId as never,
  })

  if (isLoading || !team) {
    return <SkeletonCard />
  }

  const standing = leagueSummary?.standings.find((item) => item.team.id === team.id)

  return (
    <PageWrapper>
      <div className="space-y-4">
        <BackButton />
        <section className="stat-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('coachProfile')}</p>
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
            <div className="surface-soft rounded-fg-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.16em]">{t('club')}</span>
              </div>
              <Link
                to={`/${team.leagueId}/team/${team.id}`}
                className="mt-2 block text-base font-semibold hover:text-primary"
              >
                {team.name}
              </Link>
            </div>
            <div className="surface-soft rounded-fg-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.16em]">{t('tableContext')}</span>
              </div>
              <p className="mt-2 text-base font-semibold">
                {standing ? t('standingShort', { position: standing.position, points: standing.points }) : t('standingsPending')}
              </p>
            </div>
            <div className="surface-soft rounded-fg-lg px-3 py-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.16em]">{t('homeBase')}</span>
              </div>
              <p className="mt-2 text-base font-semibold">{team.stadium ?? t('venueDataPending')}</p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
