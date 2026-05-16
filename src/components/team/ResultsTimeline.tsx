import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { AssetImage } from '@/components/shared/AssetImage'
import { getCrestSources } from '@/lib/assetSources'
import { formatDate } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Match, Team } from '@/services/types'

export function ResultsTimeline({ matches, team }: { matches: Match[]; team?: Team }) {
  return (
    <ol className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-border">
      {matches.map((match) => {
        const isHome = team?.id === match.homeTeam.id
        const opponent = isHome ? match.awayTeam : match.homeTeam
        const goalsFor = isHome ? match.homeScore ?? 0 : match.awayScore ?? 0
        const goalsAgainst = isHome ? match.awayScore ?? 0 : match.homeScore ?? 0
        const result = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
        return (
          <li key={match.id} className="relative pl-10">
            <span className="absolute left-2 top-4 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{formatDate(match.utcDate)} | Matchday {match.matchday}</p>
                <Badge className={result === 'W' ? 'bg-green-900 text-green-50' : result === 'D' ? 'bg-yellow-900 text-yellow-50' : 'bg-red-900 text-red-50'}>{result}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to={`/${opponent.leagueId}/team/${opponent.id}`}
                  className="flex min-w-0 items-center gap-3 hover:text-primary"
                >
                  <AssetImage src={opponent.crest} fallbackSrc={[...getCrestSources(opponent), createTeamCrest(opponent.shortName, opponent.primaryColor ?? '#0f766e', opponent.secondaryColor ?? '#f8fafc', match.matchday)]} alt={opponent.name} className="h-8 w-8 rounded object-cover" loading="lazy" />
                  <span className="min-w-0 truncate">{opponent.name}</span>
                </Link>
                <span className="ml-auto font-mono text-lg">{goalsFor}-{goalsAgainst}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
