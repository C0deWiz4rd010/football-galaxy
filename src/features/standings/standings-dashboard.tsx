import { useSearchParams } from 'react-router-dom'

import {
  LEAGUES,
  leagueIdSchema,
  type LeagueId,
  type StandingsProvider,
} from '../../services'
import type { LanguageCode } from '../../shared/i18n/dashboard-locale'
import { getLeagueTheme } from './league-theme'
import { StandingsFeature } from './standings-feature'

const DEFAULT_LEAGUE_ID: LeagueId = 'premier-league'
const LEAGUE_QUERY_PARAM = 'league'
const MATCHDAY_QUERY_PARAM = 'matchday'

type StandingsDashboardProps = {
  provider?: StandingsProvider
  language: LanguageCode
}

function parseLeagueId(value: string | null): LeagueId {
  const parsed = leagueIdSchema.safeParse(value)

  return parsed.success ? parsed.data : DEFAULT_LEAGUE_ID
}

function parseMatchday(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function StandingsDashboard({
  provider,
  language,
}: StandingsDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedLeagueId = parseLeagueId(searchParams.get(LEAGUE_QUERY_PARAM))
  const selectedMatchday = parseMatchday(searchParams.get(MATCHDAY_QUERY_PARAM))
  const theme = getLeagueTheme(selectedLeagueId)

  function handleLeagueSelect(leagueId: LeagueId) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(LEAGUE_QUERY_PARAM, leagueId)
    nextParams.delete(MATCHDAY_QUERY_PARAM)
    setSearchParams(nextParams, { replace: true })
  }

  function handleMatchdaySelect(matchday: number) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(MATCHDAY_QUERY_PARAM, String(matchday))
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-5 sm:space-y-6" style={theme.style}>
      <StandingsFeature
        leagueId={selectedLeagueId}
        provider={provider}
        language={language}
        leagues={LEAGUES}
        selectedMatchday={selectedMatchday}
        onLeagueSelect={handleLeagueSelect}
        onMatchdaySelect={handleMatchdaySelect}
      />
    </div>
  )
}
