import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import type { Standing } from '@/services/types'

function pickLeader(
  standings: Standing[],
  selector: (standing: Standing) => number,
  sortOrder: 'max' | 'min' = 'max',
) {
  return standings.slice().sort((left, right) => {
    const delta = selector(right) - selector(left)
    return sortOrder === 'max' ? delta : -delta
  })[0]
}

export function TeamStatsCard({ standings }: { standings: Standing[] }) {
  const { t } = useLocale()

  if (standings.length === 0) {
    return (
      <section className="stat-card">
        <EmptyState
          title={t('noTeamAnalytics')}
          description={t('noTeamAnalyticsHint')}
          className="min-h-0 border-0 p-0"
        />
      </section>
    )
  }

  const topAttack = pickLeader(standings, (standing) => standing.goalsFor)
  const topDefense = pickLeader(standings, (standing) => standing.goalsAgainst, 'min')
  const topControl = pickLeader(standings, (standing) => standing.avgPossession)
  const topDifference = pickLeader(standings, (standing) => standing.goalDifference)

  const leaders = [
    {
      key: 'attack',
      name: t('bestAttack'),
      team: topAttack,
      value: `${topAttack?.goalsFor ?? 0} GF`,
    },
    {
      key: 'defense',
      name: t('bestDefense'),
      team: topDefense,
      value: `${topDefense?.goalsAgainst ?? 0} GA`,
    },
    {
      key: 'possession',
      name: t('possession'),
      team: topControl,
      value: `${Math.round(topControl?.avgPossession ?? 0)}%`,
    },
    {
      key: 'gd',
      name: t('goalDifference'),
      team: topDifference,
      value: `${topDifference?.goalDifference ?? 0} ${t('gdShort')}`,
    },
  ]

  return (
    <section className="stat-card">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {t('teamAnalytics')}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">{t('leagueLeaders')}</h2>
      </div>
      <div className="grid gap-2">
        {leaders.map((item) => (
          <Link
            key={item.key}
            to={item.team ? `/${item.team.leagueId}/team/${item.team.team.id}` : '#'}
            className="interactive-card surface-soft flex items-center justify-between gap-3 rounded-fg-md px-3 py-2.5 hover:border-border/70 hover:bg-background/60"
          >
            <div className="min-w-0">
              <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {item.name}
              </span>
              <span className="block truncate text-sm font-medium">
                {item.team?.team.name ?? t('noTeamAvailable')}
              </span>
            </div>
            <span className="font-mono text-sm font-semibold">{item.value}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
