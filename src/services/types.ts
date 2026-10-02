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
  /** Bio fields are optional: never invent them when the source omits them. */
  age?: number
  heightCm?: number
  weightKg?: number
  photo: string
  /**
   * Optional ordered list of additional photo URLs to attempt before falling
   * back to the synthetic avatar. Consumers feed this list to `AssetImage`
   * so a single broken upstream URL never breaks the UI.
   */
  photoSources?: string[]
  /** No free source provides market values or contracts; only set when known. */
  marketValueEurCents?: number
  contractUntil?: string
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
  /**
   * Optional ordered list of additional crest URLs to attempt before falling
   * back to the synthetic SVG shield. Consumers feed this list to
   * `AssetImage`, which walks the chain on each `onError`.
   */
  crestSources?: string[]
  manager?: string
  stadium?: string
  capacity?: number
  primaryColor?: string
  secondaryColor?: string
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
  /** Last five results, oldest first. Empty until season results are loaded. */
  form: FormResult[]
}

/**
 * Lightweight player reference used by league-wide leader lists, which carry
 * season totals but no profile details (position, nationality, …).
 */
export interface PlayerRef {
  id: string
  teamId: string
  leagueId: LeagueId
  name: string
  number?: number
  photo: string
  photoSources?: string[]
  flag?: string
  nationality?: string
  appearances: number
  goals: number
  assists: number
}

export interface Scorer {
  id: string
  player: PlayerRef
  team: Team
  goals: number
  assists: number
}

export interface Assist {
  id: string
  player: PlayerRef
  team: Team
  assists: number
  goals: number
}

export interface LeaguePlayer {
  player: PlayerRef
  team: Team
}

export interface LeagueSummary {
  league: League
  season: Season
  standings: Standing[]
  topScorers: Scorer[]
  topAssists: Assist[]
  /** Every player in the league's goal and assist leader lists (deduped). */
  playerPool: LeaguePlayer[]
  recentMatches: Match[]
  teams: Team[]
  lastUpdated?: string
}

export interface FootballQueryParams {
  leagueId?: LeagueId
  teamId?: string
  playerId?: string
  season?: string
  matchday?: number
}
