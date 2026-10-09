import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import { getCrestSources } from '@/lib/assetSources'
import { formatDate } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Match, Team } from '@/services/types'

const resultTone = {
  W: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300',
  D: 'bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-300',
  L: 'bg-red-600 text-white dark:bg-red-500/20 dark:text-red-300',
} as const

export function ResultsTimeline({ matches, team }: { matches: Match[]; team?: Team }) {
  const { t } = useLocale()

  if (!matches.length) {
    return <EmptyState title={t('noMatchContext')} description={t('noMatchContextHint')} className="min-h-0 border-0 p-0" />
  }

  return (
    <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-border">
      {matches.map((match) => {
        const isHome = team?.id === match.homeTeam.id
        const opponent = isHome ? match.awayTeam : match.homeTeam
        const goalsFor = isHome ? match.homeScore : match.awayScore
        const goalsAgainst = isHome ? match.awayScore : match.homeScore
        const hasScore = match.status !== 'SCHEDULED' && typeof goalsFor === 'number' && typeof goalsAgainst === 'number'
        const result = !hasScore || match.status !== 'FINISHED'
          ? null
          : goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
        return (
          <li key={match.id} className="relative pl-10">
            <span className="absolute left-2 top-4 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {formatDate(match.utcDate)}
                  {match.matchday > 0 ? ` · ${t('matchday')} ${match.matchday}` : ''}
                </p>
                {result ? (
                  <Badge className={resultTone[result]}>{t(`result${result}`)}</Badge>
                ) : match.status === 'LIVE' ? (
                  <Badge className="bg-red-600 text-white">LIVE</Badge>
                ) : (
                  <Badge variant="outline">{t('upcoming')}</Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to={`/${opponent.leagueId}/team/${opponent.id}`}
                  className="flex min-w-0 items-center gap-3 hover:text-primary"
                >
                  <AssetImage src={opponent.crest} fallbackSrc={[...getCrestSources(opponent), createTeamCrest(opponent.shortName, opponent.primaryColor, opponent.secondaryColor, 0)]} alt={opponent.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
                  <span className="min-w-0 truncate">{isHome ? '' : '@ '}{opponent.name}</span>
                </Link>
                <span className="ml-auto font-mono text-lg tabular-nums">
                  {hasScore ? `${goalsFor}-${goalsAgainst}` : '–:–'}
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
