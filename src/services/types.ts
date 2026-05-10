export type LeagueId = 'premier-league' | 'bundesliga' | 'la-liga' | 'serie-a' | 'ligue-1'

export type ResultCode = 'W' | 'D' | 'L'

export interface League {
  id: LeagueId
  name: string
  country: string
  apiCode: string
  abbreviation: string
  theSportsDbLeagueId: string
  theSportsDbLeagueName: string
  color: string
  accentClass: string
  logo: string
}

export interface Season {
  id: string
  label: string
  startDate: string
  endDate: string
  currentMatchday?: number
}

export interface MatchEvent {
  id: string
  minute: number
  type: 'goal' | 'yellow' | 'red' | 'substitution'
  teamId: string
  playerId?: string
  playerName: string
  detail?: string
}

export interface Match {
  id: string
  leagueId: LeagueId
  season: string
  matchday: number
  utcDate: string
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED'
  homeTeam: Team
  awayTeam: Team
  homeScore?: number
  awayScore?: number
  venue?: string
  events: MatchEvent[]
}

export interface PlayerStats {
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutes: number
  trend: number[]
  attributes: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
  }
}

export interface Player {
  id: string
  teamId: string
  leagueId: LeagueId
  name: string
  number: number
  position: 'GK' | 'DF' | 'MF' | 'FW'
  nationality: string
  flag: string
  age: number
  heightCm: number
  weightKg: number
  photo: string
  marketValueEurCents: number
  contractUntil: string
  stats: PlayerStats
}

export interface Squad {
  teamId: string
  players: Player[]
}

export interface Team {
  id: string
  espnId?: string
  theSportsDbId?: string
  leagueId: LeagueId
  name: string
  shortName: string
  crest: string
  manager?: string
  stadium?: string
  capacity?: number
  primaryColor?: string
  secondaryColor?: string
  squad?: Player[]
}

export interface FormResult {
  result: ResultCode
  opponent: string
  score: string
  date: string
}

export interface Standing {
  id: string
  leagueId: LeagueId
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: FormResult[]
  avgPossession: number
}

export interface Scorer {
  id: string
  player: Player
  team: Team
  goals: number
  assists: number
}

export interface Assist {
  id: string
  player: Player
  team: Team
  assists: number
  goals: number
}

export interface LeagueSummary {
  league: League
  season: Season
  standings: Standing[]
  topScorers: Scorer[]
  topAssists: Assist[]
  recentMatches: Match[]
  teams: Team[]
  lastUpdated?: string
}

export type FootballQueryName =
  | 'getStandings'
  | 'getTopScorers'
  | 'getTopAssists'
  | 'getMatches'
  | 'getTeam'
  | 'getSquad'
  | 'getPlayer'
  | 'getLeagueSummary'

export interface FootballQueryParams {
  leagueId?: LeagueId
  teamId?: string
  playerId?: string
  season?: string
  matchday?: number
}
