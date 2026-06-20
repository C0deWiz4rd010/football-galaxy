export type WorldCupDataProvider = 'api-football' | 'football-data-org' | 'snapshot'

export type WorldCupMatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED'

export type WorldCupEventType = 'goal' | 'yellow' | 'red' | 'substitution' | 'var' | 'other'

export interface DataQualityMeta {
  provider: WorldCupDataProvider
  fetchedAt: string
  lastUpdated: string
  isLive: boolean
  confidence: 'official' | 'snapshot'
  note?: string
}

export interface WorldCupTeam {
  id: string
  apiFootballId?: number
  name: string
  code: string
  country: string
  flagUrl?: string
  group?: string
  coach?: string
  placeholder?: boolean
}

export interface WorldCupSquadPlayer {
  id: string
  name: string
  age?: number
  number?: number
  position?: string
  photoUrl?: string
}

export interface WorldCupSquad {
  teamId: string
  players: WorldCupSquadPlayer[]
  quality: DataQualityMeta
}

export interface WorldCupFixtureEvent {
  id: string
  minute: number
  extraMinute?: number
  type: WorldCupEventType
  detail: string
  teamId?: string
  teamName?: string
  playerName?: string
  assistName?: string
}

export interface WorldCupScore {
  home?: number
  away?: number
}

export interface WorldCupLineupPlayer {
  id: string
  name: string
  number?: number
  position?: string
  grid?: string
  captain?: boolean
  substitute?: boolean
}

export interface WorldCupLineup {
  teamId: string
  teamName: string
  formation?: string
  coach?: string
  starters: WorldCupLineupPlayer[]
  substitutes: WorldCupLineupPlayer[]
}

export interface WorldCupMatchStatistic {
  teamId: string
  teamName: string
  type: string
  value: string | number
}

export interface WorldCupFixture {
  id: string
  apiFootballId?: number
  round: string
  group?: string
  stage: 'group' | 'round-of-32' | 'round-of-16' | 'quarter-final' | 'semi-final' | 'third-place' | 'final' | 'unknown'
  utcDate: string
  status: WorldCupMatchStatus
  elapsed?: number
  referee?: string
  timezone?: string
  venue?: string
  city?: string
  homeTeam: WorldCupTeam
  awayTeam: WorldCupTeam
  homeScore?: number
  awayScore?: number
  scoreBreakdown?: {
    halftime?: WorldCupScore
    fulltime?: WorldCupScore
    extratime?: WorldCupScore
    penalty?: WorldCupScore
  }
  events: WorldCupFixtureEvent[]
  lineups?: WorldCupLineup[]
  statistics?: WorldCupMatchStatistic[]
  quality: DataQualityMeta
}

export interface WorldCupGroupStanding {
  id: string
  group: string
  rank: number
  team: WorldCupTeam
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: Array<'W' | 'D' | 'L'>
  qualificationHint: 'top-two' | 'best-third-watch' | 'pending'
  quality: DataQualityMeta
}

export interface WorldCupBracketMatch {
  id: string
  label: string
  utcDate?: string
  homeTeam?: WorldCupTeam
  awayTeam?: WorldCupTeam
  homeScore?: number
  awayScore?: number
  placeholder: boolean
}

export interface WorldCupBracketRound {
  id: string
  label: string
  matches: WorldCupBracketMatch[]
}

export interface WorldCupDashboard {
  tournament: {
    id: 'world-cup-2026'
    name: string
    season: string
    startsAt: string
    endsAt: string
    hostCountries: string[]
    hostCities: string[]
    teamCount: number
    groupCount: number
    matchCount: number
  }
  quality: DataQualityMeta
  liveMatches: WorldCupFixture[]
  upcomingMatches: WorldCupFixture[]
  recentMatches: WorldCupFixture[]
  groups: WorldCupGroupStanding[]
  teams: WorldCupTeam[]
  bracket: WorldCupBracketRound[]
}

export interface WorldCupProvider {
  getDashboard(): Promise<WorldCupDashboard>
  getFixtures(): Promise<WorldCupFixture[]>
  getGroups(): Promise<WorldCupGroupStanding[]>
  getTeams(): Promise<WorldCupTeam[]>
  getTeam(teamId: string): Promise<{ team: WorldCupTeam; squad: WorldCupSquad; fixtures: WorldCupFixture[] }>
  getFixture(matchId: string): Promise<WorldCupFixture>
  getFixtureLineups(matchId: string): Promise<WorldCupLineup[]>
  getFixtureStatistics(matchId: string): Promise<WorldCupMatchStatistic[]>
  getLiveFixtures(): Promise<WorldCupFixture[]>
  getBracket(): Promise<WorldCupBracketRound[]>
}

export type WorldCupQueryName =
  | 'getDashboard'
  | 'getFixtures'
  | 'getGroups'
  | 'getTeams'
  | 'getTeam'
  | 'getFixture'
  | 'getFixtureLineups'
  | 'getFixtureStatistics'
  | 'getLiveFixtures'
  | 'getBracket'

export interface WorldCupQueryParams {
  teamId?: string
  matchId?: string
}

export interface WorldCupFilterState {
  search: string
  status: 'all' | 'live' | 'scheduled' | 'finished'
  group: string
  round: string
  hostCity: string
  teamId: string
}
