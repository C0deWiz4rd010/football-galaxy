import { useSearchParams } from 'react-router-dom'

import {
  LEAGUES,
  leagueIdSchema,
  type LeagueId,
  type StandingsProvider,
} from '../../services'
import { LeagueSelector } from './league-selector'
import { StandingsFeature } from './standings-feature'

const DEFAULT_LEAGUE_ID: LeagueId = 'premier-league'
const LEAGUE_QUERY_PARAM = 'league'

type StandingsDashboardProps = {
  provider?: StandingsProvider
}

function parseLeagueId(value: string | null): LeagueId {
  const parsed = leagueIdSchema.safeParse(value)

  return parsed.success ? parsed.data : DEFAULT_LEAGUE_ID
}

export function StandingsDashboard({ provider }: StandingsDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedLeagueId = parseLeagueId(searchParams.get(LEAGUE_QUERY_PARAM))

  function handleLeagueSelect(leagueId: LeagueId) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(LEAGUE_QUERY_PARAM, leagueId)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-6">
      <LeagueSelector
        leagues={LEAGUES}
        selectedLeagueId={selectedLeagueId}
        onSelect={handleLeagueSelect}
      />

      <StandingsFeature leagueId={selectedLeagueId} provider={provider} />
    </div>
  )
}
