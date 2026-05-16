import { mockData } from '@/data/mock'
import { leagues } from '@/lib/leagues'
import { createFlag, createPlayerAvatar, createTeamCrest } from '@/lib/visualAssets'
import { buildLiveRequestUrl } from '@/services/config/liveProxy'

import type { Assist, FootballQueryParams, LeagueId, LeagueSummary, Match, Player, ResultCode, Scorer, Squad, Standing, Team } from './types'

const apiBase = 'https://www.thesportsdb.com/api/v1/json/123'
const espnApiBase = 'https://site.api.espn.com/apis/v2/sports/soccer'

const espnLeagueSlugByLeagueId: Record<LeagueId, string> = {
  'premier-league': 'eng.1',
  bundesliga: 'ger.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'ligue-1': 'fra.1',
}

type ApiRecord = Record<string, unknown>

interface LiveLeagueData {
  leagueLogo?: string
  teams: Team[]
  standings: Standing[]
  matches: Match[]
  currentMatchday: number
}

const leagueCache = new Map<LeagueId, Promise<LiveLeagueData>>()
const squadCache = new Map<string, Promise<Squad>>()

function leagueOrDefault(leagueId?: LeagueId) {
  return leagueId ?? 'premier-league'
}

function value(record: ApiRecord, key: string) {
  const raw = record[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
}

function numberValue(record: ApiRecord, key: string) {
  const raw = value(record, key)
  if (!raw) {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function compactImage(...images: Array<string | undefined>) {
  return images.find(Boolean)
}

async function getJson(url: string): Promise<ApiRecord> {
  const response = await fetch(buildLiveRequestUrl(url))
  if (!response.ok) {
    throw new Error(`Football data request failed (${response.status}).`)
  }
  return (await response.json()) as ApiRecord
}

function normalizeTeamName(name: string | undefined) {
  return (name ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\bafc\b/g, '')
    .replace(/\bfc\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function normalizeHexColor(color: string | undefined, fallback: string) {
  if (!color) {
    return fallback
  }

  return color.startsWith('#') ? color : `#${color}`
}

function syntheticManager(index: number) {
  const firstNames = ['Marco', 'Julian', 'Mikel', 'Roberto', 'Thomas', 'Enzo', 'Arne', 'Oliver']
  const lastNames = ['Silva', 'Meyer', 'Costa', 'Romero', 'Bauer', 'Martin', 'Rossi', 'Varela']
  return `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`
}

function syntheticStadium(teamName: string) {
  const base = teamName.replace(/\b(AFC|FC)\b/g, '').trim()
  return `${base} Stadium`
}

function nationalityFlag(nationality: string | undefined) {
  const normalized = nationality?.toLowerCase() ?? ''
  if (normalized.includes('german')) return createFlag('germany')
  if (normalized.includes('spain') || normalized.includes('spanish')) return createFlag('spain')
  if (normalized.includes('ital')) return createFlag('italy')
  if (normalized.includes('france') || normalized.includes('french')) return createFlag('france')
  if (normalized.includes('portugal') || normalized.includes('portuguese')) return createFlag('portugal')
  if (normalized.includes('netherlands') || normalized.includes('dutch')) return createFlag('netherlands')
  if (normalized.includes('brazil')) return createFlag('brazil')
  return createFlag('england')
}

function normalizePosition(position: string | undefined): Player['position'] {
  const normalized = position?.toLowerCase() ?? ''
  if (normalized.includes('goal')) return 'GK'
  if (normalized.includes('def')) return 'DF'
  if (normalized.includes('mid')) return 'MF'
  return 'FW'
}

function mapApiTeam(record: ApiRecord, leagueId: LeagueId, fallback: Team, index: number): Team {
  const league = leagues.find((item) => item.id === leagueId)!
  const name = value(record, 'strTeam') ?? fallback.name
  const shortName = value(record, 'strTeamShort') ?? name.split(' ').map((part) => part[0]).join('').slice(0, 3).toUpperCase()
  return {
    ...fallback,
    id: value(record, 'idTeam') ?? fallback.id,
    theSportsDbId: value(record, 'idTeam') ?? fallback.theSportsDbId,
    leagueId,
    name,
    shortName,
    crest: compactImage(value(record, 'strBadge'), value(record, 'strTeamBadge'), value(record, 'strLogo'), fallback.crest) ?? createTeamCrest(shortName, league.color, '#f4f4f5', index),
    manager: value(record, 'strManager') ?? fallback.manager,
    stadium: value(record, 'strStadium') ?? fallback.stadium,
    capacity: numberValue(record, 'intStadiumCapacity') ?? fallback.capacity,
    primaryColor: league.color,
    secondaryColor: fallback.secondaryColor,
    squad: fallback.squad,
  }
}

function createSyntheticPlayer(team: Team, index: number): Player {
  const firstNames = ['Luca', 'Noah', 'Theo', 'Milan', 'Elias', 'Jonas', 'Mateo', 'Oscar', 'Hugo', 'Leo']
  const lastNames = ['Silva', 'Martin', 'Keller', 'Moretti', 'Dubois', 'Costa', 'Hansen', 'Rossi', 'Garcia', 'Bauer']
  const firstName = firstNames[index % firstNames.length]!
  const lastName = lastNames[(index * 2) % lastNames.length]!
  const name = `${firstName} ${lastName}`
  const position = index === 0 ? 'GK' : index < 6 ? 'DF' : index < 12 ? 'MF' : 'FW'
  const goalsBase = position === 'FW' ? 7 : position === 'MF' ? 3 : 0
  const assistsBase = position === 'MF' ? 5 : position === 'FW' ? 3 : 1

  return {
    id: `${team.id}-player-${index + 1}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    number: index + 1,
    position,
    nationality: 'International',
    flag: createFlag('england'),
    age: 20 + (index % 12),
    heightCm: 174 + (index % 18),
    weightKg: 68 + (index % 16),
    photo: createPlayerAvatar(`${firstName[0] ?? 'P'}${lastName[0] ?? ''}`, team.primaryColor ?? '#18181b'),
    marketValueEurCents: (4_500_000 + index * 650_000) * 100,
    contractUntil: `${2027 + (index % 4)}-06-30`,
    stats: {
      appearances: 12 + (index % 20),
      goals: Math.max(0, goalsBase + (index % 6) - 1),
      assists: Math.max(0, assistsBase + (index % 5) - 1),
      yellowCards: index % 6,
      redCards: index % 19 === 0 ? 1 : 0,
      minutes: 720 + index * 85,
      trend: [0, 1, 2, 1, 3].map((item, trendIndex) => item + ((index + trendIndex) % 3)),
      attributes: {
        pace: 58 + ((index * 7) % 36),
        shooting: 50 + ((index * 5) % 40),
        passing: 54 + ((index * 4) % 38),
        dribbling: 55 + ((index * 3) % 39),
        defending: 44 + ((index * 2) % 42),
        physical: 56 + (index % 35),
      },
    },
  }
}

function createSyntheticSquad(team: Team): Squad {
  return {
    teamId: team.id,
    players: Array.from({ length: 22 }, (_, index) => createSyntheticPlayer(team, index)),
  }
}

function statValue(stats: ApiRecord[], name: string) {
  const stat = stats.find((item) => value(item, 'name') === name)
  const raw = stat?.value
  return typeof raw === 'number' ? raw : Number(raw ?? 0)
}

function appendForm(standing: Standing, goalsFor: number, goalsAgainst: number, opponent: string, date: string) {
  const result: ResultCode = goalsFor > goalsAgainst ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L'
  standing.form = [
    ...standing.form,
    {
      result,
      opponent,
      score: `${goalsFor}-${goalsAgainst}`,
      date,
    },
  ].slice(-5)
}

function mapEspnTeam(
  record: ApiRecord,
  leagueId: LeagueId,
  index: number,
  fallback: Team | undefined,
  sportsDbRecord: ApiRecord | undefined,
): Team {
  const league = leagues.find((item) => item.id === leagueId)!
  const name = value(record, 'displayName') ?? value(record, 'name') ?? fallback?.name ?? `Club ${index + 1}`
  const shortName = value(record, 'abbreviation')
    ?? value(record, 'shortDisplayName')
    ?? fallback?.shortName
    ?? name.split(' ').map((part) => part[0]).join('').slice(0, 3).toUpperCase()

  return {
    id: value(record, 'id') ?? fallback?.id ?? `${leagueId}-team-${index + 1}`,
    espnId: value(record, 'id'),
    theSportsDbId: value(sportsDbRecord ?? {}, 'idTeam') ?? fallback?.theSportsDbId,
    leagueId,
    name,
    shortName,
    crest:
      compactImage(
        value((Array.isArray(record.logos) ? (record.logos as ApiRecord[])[0] : undefined) ?? {}, 'href'),
        value(sportsDbRecord ?? {}, 'strBadge'),
        fallback?.crest,
      ) ?? createTeamCrest(shortName, league.color, '#f4f4f5', index),
    manager: value(sportsDbRecord ?? {}, 'strManager') ?? fallback?.manager ?? syntheticManager(index),
    stadium: value(sportsDbRecord ?? {}, 'strStadium') ?? fallback?.stadium ?? syntheticStadium(name),
    capacity: numberValue(sportsDbRecord ?? {}, 'intStadiumCapacity') ?? fallback?.capacity,
    primaryColor: normalizeHexColor(value(record, 'color'), league.color),
    secondaryColor: normalizeHexColor(value(record, 'alternateColor'), fallback?.secondaryColor ?? '#0f172a'),
    squad: fallback?.squad,
  }
}

function mapEspnStanding(record: ApiRecord, team: Team, leagueId: LeagueId): Standing {
  const stats = Array.isArray(record.stats) ? (record.stats as ApiRecord[]) : []
  return {
    id: `${team.id}-standing`,
    leagueId,
    position: statValue(stats, 'rank'),
    team,
    played: statValue(stats, 'gamesPlayed'),
    won: statValue(stats, 'wins'),
    drawn: statValue(stats, 'ties'),
    lost: statValue(stats, 'losses'),
    goalsFor: statValue(stats, 'pointsFor'),
    goalsAgainst: statValue(stats, 'pointsAgainst'),
    goalDifference: statValue(stats, 'pointDifferential'),
    points: statValue(stats, 'points'),
    avgPossession: 50,
    form: [],
  }
}

function mapEspnScoreboardMatch(record: ApiRecord, leagueId: LeagueId, teamsById: Map<string, Team>): Match | null {
  const competition = Array.isArray(record.competitions) ? (record.competitions as ApiRecord[])[0] : undefined
  const competitors = Array.isArray(competition?.competitors) ? (competition?.competitors as ApiRecord[]) : []
  const homeRecord = competitors.find((item) => value(item, 'homeAway') === 'home')
  const awayRecord = competitors.find((item) => value(item, 'homeAway') === 'away')
  const homeId = value(homeRecord ?? {}, 'id')
  const awayId = value(awayRecord ?? {}, 'id')
  const homeTeam = homeId ? teamsById.get(homeId) : undefined
  const awayTeam = awayId ? teamsById.get(awayId) : undefined

  if (!homeTeam || !awayTeam) {
    return null
  }

  const statusType = competition && typeof competition.status === 'object'
    ? value((competition.status as ApiRecord).type as ApiRecord, 'name')
    : value(record.status as ApiRecord, 'type')

  const details = Array.isArray(competition?.details) ? (competition?.details as ApiRecord[]) : []

  return {
    id: value(record, 'id') ?? `${homeTeam.id}-${awayTeam.id}-${value(record, 'date')}`,
    leagueId,
    season: estimateCurrentSeasonLabel(),
    matchday: numberValue(record, 'week') ?? currentMatchdayFromMatches([]),
    utcDate: value(record, 'date') ?? new Date().toISOString(),
    status:
      statusType === 'STATUS_SCHEDULED'
        ? 'SCHEDULED'
        : statusType?.includes('STATUS_') && !statusType.includes('FINAL')
          ? 'LIVE'
          : 'FINISHED',
    homeTeam,
    awayTeam,
    homeScore: numberValue(homeRecord ?? {}, 'score'),
    awayScore: numberValue(awayRecord ?? {}, 'score'),
    venue: value(record.venue as ApiRecord, 'displayName'),
    events: details.map((detail, index) => ({
      id: `${value(record, 'id') ?? 'match'}-event-${index}`,
      minute: Number(String(value(detail, 'clock') ?? '0').replace(/[^0-9]/g, '')) || 0,
      type: value(detail, 'scoringPlay') === 'True' || value(detail, 'scoringPlay') === 'true' ? 'goal' : value(detail, 'yellowCard') === 'True' || value(detail, 'yellowCard') === 'true' ? 'yellow' : value(detail, 'redCard') === 'True' || value(detail, 'redCard') === 'true' ? 'red' : 'substitution',
      teamId: value(detail, 'team') ?? '',
      playerName: 'Live event',
    })),
  }
}

function emptyStanding(team: Team, leagueId: LeagueId, index: number): Standing {
  return {
    id: `${team.id}-standing`,
    leagueId,
    position: index + 1,
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    avgPossession: 50,
    form: [],
  }
}

function mapMatch(record: ApiRecord, leagueId: LeagueId, teamsById: Map<string, Team>): Match | null {
  const homeKey = normalizeTeamName(value(record, 'strHomeTeam'))
  const awayKey = normalizeTeamName(value(record, 'strAwayTeam'))
  const homeTeam = teamsById.get(homeKey)
  const awayTeam = teamsById.get(awayKey)
  if (!homeTeam || !awayTeam) {
    return null
  }
  const homeScore = numberValue(record, 'intHomeScore')
  const awayScore = numberValue(record, 'intAwayScore')
  const date = value(record, 'strTimestamp') ?? `${value(record, 'dateEvent') ?? '2025-08-01'}T${value(record, 'strTime') ?? '15:00:00'}Z`
  return {
    id: value(record, 'idEvent') ?? `${homeTeam.id}-${awayTeam.id}-${date}`,
    leagueId,
    season: estimateCurrentSeasonLabel(),
    matchday: numberValue(record, 'intRound') ?? 38,
    utcDate: date,
    status: homeScore === undefined || awayScore === undefined ? 'SCHEDULED' : 'FINISHED',
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    venue: value(record, 'strVenue') ?? homeTeam.stadium,
    events: [],
  }
}

function estimateCurrentSeasonLabel(date = new Date()) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const startYear = month >= 7 ? year : year - 1
  return `${startYear}-${startYear + 1}`
}

function currentMatchdayFromMatches(matches: Match[]) {
  const rounds = matches
    .map((match) => match.matchday)
    .filter((round) => Number.isFinite(round) && round > 0)

  if (!rounds.length) {
    return 38
  }

  const scheduled = matches
    .filter((match) => match.status === 'SCHEDULED')
    .map((match) => match.matchday)
    .filter((round) => round > 0)
    .sort((a, b) => a - b)

  if (scheduled[0]) {
    return scheduled[0]
  }

  return Math.max(...rounds)
}

async function loadLeague(leagueId: LeagueId): Promise<LiveLeagueData> {
  const cached = leagueCache.get(leagueId)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    const league = leagues.find((item) => item.id === leagueId)!
    const fallback = mockData[leagueId]
    const espnLeagueSlug = espnLeagueSlugByLeagueId[leagueId]
    const [leaguePayload, teamPayload, standingsPayload, espnTeamsPayload, scoreboardPayload] = await Promise.all([
      getJson(`${apiBase}/lookupleague.php?id=${league.theSportsDbLeagueId}`).catch((): ApiRecord => ({})),
      getJson(`${apiBase}/search_all_teams.php?l=${encodeURIComponent(league.theSportsDbLeagueName)}`).catch((): ApiRecord => ({})),
      getJson(`${espnApiBase}/${espnLeagueSlug}/standings`),
      getJson(`${espnApiBase}/${espnLeagueSlug}/teams`),
      getJson(`${espnApiBase}/${espnLeagueSlug}/scoreboard`).catch((): ApiRecord => ({})),
    ])
    const leagueRecords = Array.isArray(leaguePayload.leagues) ? (leaguePayload.leagues as ApiRecord[]) : []
    const leagueLogo = compactImage(value(leagueRecords[0] ?? {}, 'strBadge'), value(leagueRecords[0] ?? {}, 'strLogo'), value(leagueRecords[0] ?? {}, 'strPoster'))
    const teamRecords = Array.isArray(teamPayload.teams) ? (teamPayload.teams as ApiRecord[]) : []
    const sportsDbByName = new Map(teamRecords.map((team) => [normalizeTeamName(value(team, 'strTeam')), team]))
    const espnTeamRecords = Array.isArray((espnTeamsPayload.sports as ApiRecord[] | undefined)?.[0]?.leagues)
      ? (((espnTeamsPayload.sports as ApiRecord[])[0]?.leagues as ApiRecord[])[0]?.teams as ApiRecord[] | undefined) ?? []
      : []
    const espnTeams = espnTeamRecords
      .map((entry) => (typeof entry.team === 'object' ? entry.team as ApiRecord : undefined))
      .filter((team): team is ApiRecord => Boolean(team))
    const teams = espnTeams.length
      ? espnTeams.map((team, index) =>
          mapEspnTeam(
            team,
            leagueId,
            index,
            fallback.teams[index],
            sportsDbByName.get(normalizeTeamName(value(team, 'displayName') ?? value(team, 'name'))),
          ),
        )
      : (teamRecords.length
          ? teamRecords.map((team, index) => mapApiTeam(team, leagueId, fallback.teams[index] ?? fallback.teams[0]!, index))
          : fallback.teams)

    const teamsByEspnId = new Map(teams.map((team) => [team.espnId ?? team.id, team]))
    const teamsByName = new Map(teams.map((team) => [normalizeTeamName(team.name), team]))
    const standingsEntries = Array.isArray((standingsPayload.children as ApiRecord[] | undefined)?.[0]?.standings)
      ? []
      : ((((standingsPayload.children as ApiRecord[] | undefined)?.[0] ?? {}) as ApiRecord).standings as ApiRecord | undefined)?.entries as ApiRecord[] | undefined ?? []

    const standings = standingsEntries.length
      ? standingsEntries
          .map((entry, index) => {
            const teamRecord = typeof entry.team === 'object' ? (entry.team as ApiRecord) : undefined
            const mappedTeam = teamRecord
              ? teamsByEspnId.get(value(teamRecord, 'id') ?? '')
              : undefined
            return mappedTeam ? mapEspnStanding(entry, mappedTeam, leagueId) : emptyStanding(teams[index]!, leagueId, index)
          })
          .sort((a, b) => a.position - b.position)
      : fallback.standings.map((standing, index) => ({ ...standing, team: teams[index] ?? standing.team }))

    const season = estimateCurrentSeasonLabel()
    const eventPayload = await getJson(`${apiBase}/eventsseason.php?id=${league.theSportsDbLeagueId}&s=${season}`).catch((): ApiRecord => ({}))
    const eventRecords = Array.isArray(eventPayload.events) ? (eventPayload.events as ApiRecord[]) : []
    const seasonMatches = eventRecords.map((event) => mapMatch(event, leagueId, teamsByName)).filter((match): match is Match => Boolean(match))
    const scoreboardEvents = Array.isArray(scoreboardPayload.events) ? (scoreboardPayload.events as ApiRecord[]) : []
    const liveMatches = scoreboardEvents.map((event) => mapEspnScoreboardMatch(event, leagueId, teamsByEspnId)).filter((match): match is Match => Boolean(match))

    const standingsById = new Map(standings.map((standing) => [standing.team.id, { ...standing }]))
    for (const match of seasonMatches) {
      if (match.homeScore === undefined || match.awayScore === undefined) {
        continue
      }
      const home = standingsById.get(match.homeTeam.id)
      const away = standingsById.get(match.awayTeam.id)
      if (home && away) {
        appendForm(home, match.homeScore, match.awayScore, match.awayTeam.shortName, match.utcDate)
        appendForm(away, match.awayScore, match.homeScore, match.homeTeam.shortName, match.utcDate)
      }
    }
    const standingsWithForm = Array.from(standingsById.values())
      .sort((a, b) => a.position - b.position)
      .map((standing, index) => ({ ...standing, avgPossession: fallback.standings[index]?.avgPossession ?? 50 }))

    const recentSeasonMatches = seasonMatches.slice(-10).reverse()
    const mergedMatches = liveMatches.length
      ? [...liveMatches, ...recentSeasonMatches.filter((match) => !liveMatches.some((liveMatch) => liveMatch.id === match.id))]
      : recentSeasonMatches

    return {
      leagueLogo,
      teams,
      standings: standingsWithForm.some((standing) => standing.played > 0) ? standingsWithForm : fallback.standings.map((standing, index) => ({ ...standing, team: teams[index] ?? standing.team })),
      matches: mergedMatches.length
        ? mergedMatches
        : fallback.recentMatches.map((match) => ({ ...match, homeTeam: teams.find((team) => normalizeTeamName(team.name) === normalizeTeamName(match.homeTeam.name)) ?? match.homeTeam, awayTeam: teams.find((team) => normalizeTeamName(team.name) === normalizeTeamName(match.awayTeam.name)) ?? match.awayTeam })),
      currentMatchday: currentMatchdayFromMatches(liveMatches.length ? liveMatches : seasonMatches),
    }
  })()

  leagueCache.set(leagueId, promise)
  return promise
}

function mapApiPlayer(record: ApiRecord, team: Team, index: number): Player {
  const name = value(record, 'strPlayer') ?? `Player ${index + 1}`
  const [firstName = 'P', lastName = String(index + 1)] = name.split(' ')
  const nationality = value(record, 'strNationality') ?? value(record, 'strBirthLocation') ?? 'England'
  const position = normalizePosition(value(record, 'strPosition'))
  const shirtNumber = numberValue(record, 'strNumber') ?? index + 1
  const goalsBase = position === 'FW' ? 8 : position === 'MF' ? 4 : 1
  const assistsBase = position === 'MF' ? 7 : position === 'FW' ? 4 : 2

  return {
    id: value(record, 'idPlayer') ?? `${team.id}-api-player-${index}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    number: shirtNumber,
    position,
    nationality,
    flag: nationalityFlag(nationality),
    age: 24 + (index % 10),
    heightCm: numberValue(record, 'strHeight') ?? 176 + (index % 16),
    weightKg: numberValue(record, 'strWeight') ?? 70 + (index % 18),
    photo: compactImage(value(record, 'strCutout'), value(record, 'strThumb'), value(record, 'strRender')) ?? createPlayerAvatar(`${firstName[0] ?? 'P'}${lastName[0] ?? ''}`, team.primaryColor ?? '#18181b'),
    marketValueEurCents: (5_000_000 + index * 750_000) * 100,
    contractUntil: `${2027 + (index % 4)}-06-30`,
    stats: {
      appearances: 14 + (index % 20),
      goals: Math.max(0, goalsBase + (index % 8) - 2),
      assists: Math.max(0, assistsBase + (index % 7) - 2),
      yellowCards: index % 7,
      redCards: index % 18 === 0 ? 1 : 0,
      minutes: 780 + index * 87,
      trend: [0, 1, 2, 1, 3].map((value, trendIndex) => value + ((index + trendIndex) % 3)),
      attributes: {
        pace: 58 + ((index * 7) % 38),
        shooting: 52 + ((index * 5) % 42),
        passing: 56 + ((index * 4) % 40),
        dribbling: 54 + ((index * 3) % 42),
        defending: 45 + ((index * 2) % 45),
        physical: 55 + (index % 40),
      },
    },
  }
}

export async function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  try {
    return (await loadLeague(leagueOrDefault(params.leagueId))).standings
  } catch {
    return mockData[leagueOrDefault(params.leagueId)].standings
  }
}

export async function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  try {
    const matches = (await loadLeague(leagueOrDefault(params.leagueId))).matches
    return matches.filter((match) => !params.matchday || match.matchday === params.matchday)
  } catch {
    return mockData[leagueOrDefault(params.leagueId)].recentMatches
  }
}

export async function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  const leagueId = leagueOrDefault(params.leagueId)
  try {
    const teams = (await loadLeague(leagueId)).teams
    return teams.find((team) => team.id === params.teamId) ?? teams[0]!
  } catch {
    return mockData[leagueId].teams.find((team) => team.id === params.teamId) ?? mockData[leagueId].teams[0]!
  }
}

export async function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  const team = await getTeam(params)
  const cached = squadCache.get(team.id)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    try {
      if (!team.theSportsDbId) {
        return createSyntheticSquad(team)
      }

      const payload = await getJson(`${apiBase}/lookup_all_players.php?id=${team.theSportsDbId}`)
      const records = Array.isArray(payload.player) ? (payload.player as ApiRecord[]) : []
      const players = records.map((player, index) => mapApiPlayer(player, team, index)).slice(0, 28)
      return { teamId: team.id, players: players.length ? players : team.squad ?? createSyntheticSquad(team).players }
    } catch {
      return { teamId: team.id, players: team.squad ?? createSyntheticSquad(team).players }
    }
  })()

  squadCache.set(team.id, promise)
  return promise
}

async function featuredPlayers(leagueId: LeagueId): Promise<Player[]> {
  const teams = (await loadLeague(leagueId)).teams.slice(0, 5)
  const squads = await Promise.all(teams.map((team) => getSquad({ leagueId, teamId: team.id })))
  return squads.flatMap((squad) => squad.players)
}

export async function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  try {
    const players = await featuredPlayers(leagueId)
    const teams = (await loadLeague(leagueId)).teams
    return players
      .sort((a, b) => b.stats.goals - a.stats.goals)
      .slice(0, 15)
      .map((player) => ({ id: `${player.id}-scorer`, player, team: teams.find((team) => team.id === player.teamId)!, goals: player.stats.goals, assists: player.stats.assists }))
  } catch {
    return mockData[leagueId].topScorers
  }
}

export async function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  try {
    const players = await featuredPlayers(leagueId)
    const teams = (await loadLeague(leagueId)).teams
    return players
      .sort((a, b) => b.stats.assists - a.stats.assists)
      .slice(0, 15)
      .map((player) => ({ id: `${player.id}-assist`, player, team: teams.find((team) => team.id === player.teamId)!, assists: player.stats.assists, goals: player.stats.goals }))
  } catch {
    return mockData[leagueId].topAssists
  }
}

export async function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  const leagueId = leagueOrDefault(params.leagueId)
  try {
    const teams = (await loadLeague(leagueId)).teams
    for (const team of teams) {
      const squad = await getSquad({ leagueId, teamId: team.id })
      const player = squad.players.find((item) => item.id === params.playerId)
      if (player) {
        return player
      }
    }
  } catch {
    // Fall through to local fallback.
  }
  return mockData[leagueId].teams.flatMap((team) => team.squad ?? []).find((player) => player.id === params.playerId) ?? mockData[leagueId].teams[0]!.squad![0]!
}

export async function getLeagueSummary(params: FootballQueryParams = {}): Promise<LeagueSummary> {
  const leagueId = leagueOrDefault(params.leagueId)
  const league = leagues.find((item) => item.id === leagueId)!
  const data = await loadLeague(leagueId).catch(() => null)
  return {
    league,
    season: {
      id: estimateCurrentSeasonLabel(),
      label: estimateCurrentSeasonLabel().replace('-', '/'),
      startDate: `${estimateCurrentSeasonLabel().slice(0, 4)}-08-01T00:00:00Z`,
      endDate: `${Number(estimateCurrentSeasonLabel().slice(0, 4)) + 1}-05-31T23:59:59Z`,
      currentMatchday: data?.currentMatchday ?? 38,
    },
    standings: data?.standings ?? mockData[leagueId].standings,
    topScorers: await getTopScorers(params),
    topAssists: await getTopAssists(params),
    recentMatches: data?.matches ?? mockData[leagueId].recentMatches,
    teams: data?.teams ?? mockData[leagueId].teams,
    lastUpdated: new Date().toISOString(),
  }
}
