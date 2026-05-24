import { mockData } from '@/data/mock'
import { leagues } from '@/lib/leagues'
import { createFlag, createPlayerAvatar, createTeamCrest } from '@/lib/visualAssets'
import { buildLiveRequestUrl } from '@/services/config/liveProxy'

import type { Assist, FootballQueryParams, LeagueId, LeagueSummary, Match, Player, ResultCode, Scorer, Squad, Standing, Team } from './types'

const apiBase = 'https://www.thesportsdb.com/api/v1/json/123'
const espnSiteApiBase = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
const espnWebApiBase = 'https://site.web.api.espn.com/apis/v2/sports/soccer'

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
const espnSquadCache = new Map<string, Promise<Squad>>()
const wikidataImageCache = new Map<string, Promise<string | undefined>>()

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

function isGeneratedPlayerImage(image: string | undefined) {
  return !image || image.startsWith('data:image/svg+xml')
}

function numberFromUnknown(raw: unknown) {
  const parsed = typeof raw === 'number' ? raw : Number(raw ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
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

function normalizePersonName(name: string | undefined) {
  return (name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function wikimediaFileUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=320`
}

async function getWikidataPlayerImage(name: string): Promise<string | undefined> {
  const cacheKey = normalizePersonName(name)
  if (!cacheKey) {
    return undefined
  }

  const cached = wikidataImageCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json&limit=5&origin=*`
    const searchPayload = await getJson(searchUrl)
    const searchRows = Array.isArray(searchPayload.search) ? (searchPayload.search as ApiRecord[]) : []
    const candidate =
      searchRows.find((item) => {
        const description = value(item, 'description')?.toLowerCase() ?? ''
        return description.includes('football') || description.includes('soccer') || description.includes('association football')
      }) ?? searchRows[0]

    const entityId = value(candidate ?? {}, 'id')
    if (!entityId) {
      return undefined
    }

    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(entityId)}&props=claims&format=json&origin=*`
    const entityPayload = await getJson(entityUrl)
    const entities = entityPayload.entities as ApiRecord | undefined
    const entity = entities?.[entityId] as ApiRecord | undefined
    const claims = entity?.claims as ApiRecord | undefined
    const p18Claims = Array.isArray(claims?.P18) ? (claims?.P18 as ApiRecord[]) : []
    const mainsnak = p18Claims[0]?.mainsnak as ApiRecord | undefined
    const datavalue = mainsnak?.datavalue as ApiRecord | undefined
    const fileName = typeof datavalue?.value === 'string' ? datavalue.value : undefined

    return fileName ? wikimediaFileUrl(fileName) : undefined
  })().catch(() => undefined)

  wikidataImageCache.set(cacheKey, promise)
  return promise
}

async function hydratePlayerImage(player: Player): Promise<Player> {
  if (!isGeneratedPlayerImage(player.photo)) {
    return player
  }

  const wikimediaImage = await getWikidataPlayerImage(player.name)
  if (!wikimediaImage) {
    return player
  }

  return {
    ...player,
    photo: wikimediaImage,
    photoSources: [wikimediaImage, ...(player.photoSources ?? [])],
  }
}

async function hydratePlayerImages(players: Player[], limit = 6): Promise<Player[]> {
  const selected = [...players]
    .sort((a, b) =>
      (b.stats.goals + b.stats.assists) - (a.stats.goals + a.stats.assists)
      || b.stats.appearances - a.stats.appearances,
    )
    .slice(0, limit)

  const hydrated = await Promise.all(selected.map((player) => hydratePlayerImage(player)))
  const hydratedById = new Map(hydrated.map((player) => [player.id, player]))

  return players.map((player) => hydratedById.get(player.id) ?? player)
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

function statByName(record: ApiRecord, name: string) {
  const categories = ((record.statistics as ApiRecord | undefined)?.splits as ApiRecord | undefined)?.categories
  if (!Array.isArray(categories)) {
    return 0
  }

  for (const category of categories as ApiRecord[]) {
    const stats = category.stats
    if (!Array.isArray(stats)) {
      continue
    }

    const stat = (stats as ApiRecord[]).find((item) => value(item, 'name') === name)
    if (stat) {
      return numberFromUnknown(stat.value)
    }
  }

  return 0
}

function inchesToCm(inches: unknown) {
  const value = numberFromUnknown(inches)
  return value > 0 ? Math.round(value * 2.54) : undefined
}

function poundsToKg(pounds: unknown) {
  const value = numberFromUnknown(pounds)
  return value > 0 ? Math.round(value * 0.453592) : undefined
}

function derivePlayerAttributes(
  position: Player['position'],
  stats: Player['stats'],
): Player['stats']['attributes'] {
  const output = stats.goals + stats.assists
  const shotSignal = Math.min(18, stats.trend[2] ?? 0)
  const cardPenalty = Math.min(10, stats.yellowCards + stats.redCards * 3)

  return {
    pace: Math.min(95, 64 + (position === 'FW' ? 10 : position === 'DF' ? 3 : 6) + Math.min(12, stats.appearances)),
    shooting: Math.min(96, 46 + stats.goals * 3 + shotSignal + (position === 'FW' ? 12 : 0)),
    passing: Math.min(96, 50 + stats.assists * 4 + (position === 'MF' ? 14 : 4)),
    dribbling: Math.min(94, 56 + output * 2 + (position === 'FW' || position === 'MF' ? 8 : 0)),
    defending: Math.min(94, 45 + (position === 'DF' ? 25 : position === 'GK' ? 18 : 4) - cardPenalty),
    physical: Math.min(94, 58 + Math.min(16, Math.round(stats.minutes / 180)) + (position === 'DF' ? 8 : 0)),
  }
}

function mapEspnPlayer(
  record: ApiRecord,
  team: Team,
  sportsDbRecord: ApiRecord | undefined,
  index: number,
): Player {
  const name =
    value(record, 'displayName') ??
    value(record, 'fullName') ??
    `${value(record, 'firstName') ?? 'Player'} ${value(record, 'lastName') ?? index + 1}`
  const positionRecord = typeof record.position === 'object' ? (record.position as ApiRecord) : {}
  const position = normalizePosition(
    value(positionRecord, 'displayName') ??
    value(positionRecord, 'name') ??
    value(positionRecord, 'abbreviation'),
  )
  const appearances = statByName(record, 'appearances')
  const subIns = statByName(record, 'subIns')
  const goals = statByName(record, 'totalGoals')
  const assists = statByName(record, 'goalAssists')
  const yellowCards = statByName(record, 'yellowCards')
  const redCards = statByName(record, 'redCards')
  const totalShots = statByName(record, 'totalShots')
  const shotsOnTarget = statByName(record, 'shotsOnTarget')
  const saves = statByName(record, 'saves')
  const starts = Math.max(0, appearances - subIns)
  const stats: Player['stats'] = {
    appearances,
    goals,
    assists,
    yellowCards,
    redCards,
    minutes: appearances > 0 ? Math.max(1, starts * 86 + subIns * 24) : 0,
    trend: [goals, assists, totalShots, shotsOnTarget, saves].map((item) => Math.round(item)),
    attributes: {
      pace: 70,
      shooting: 70,
      passing: 70,
      dribbling: 70,
      defending: 70,
      physical: 70,
    },
  }
  stats.attributes = derivePlayerAttributes(position, stats)

  const flag = typeof record.flag === 'object' ? (record.flag as ApiRecord) : {}
  const headshot = typeof record.headshot === 'object' ? (record.headshot as ApiRecord) : {}
  const nationality =
    value(record, 'citizenship') ??
    value(flag, 'alt') ??
    'International'
  const firstName = value(record, 'firstName') ?? name.split(' ')[0] ?? 'P'
  const lastName = value(record, 'lastName') ?? name.split(' ').slice(1).join(' ')
  const fallbackAvatar = createPlayerAvatar(
    `${firstName[0] ?? 'P'}${lastName[0] ?? ''}`,
    team.primaryColor ?? '#18181b',
  )
  const photoSources = [
    value(headshot, 'href'),
    value(sportsDbRecord ?? {}, 'strCutout'),
    value(sportsDbRecord ?? {}, 'strThumb'),
    value(sportsDbRecord ?? {}, 'strRender'),
    value(sportsDbRecord ?? {}, 'strFanart1'),
  ].filter((item): item is string => Boolean(item))

  return {
    id: value(record, 'id') ? `espn-${value(record, 'id')}` : `${team.id}-espn-player-${index + 1}`,
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    number: numberValue(record, 'jersey') ?? index + 1,
    position,
    nationality,
    flag: compactImage(value(flag, 'href'), nationalityFlag(nationality)) ?? nationalityFlag(nationality),
    age: numberFromUnknown(record.age) || 24,
    heightCm: inchesToCm(record.height) ?? 178,
    weightKg: poundsToKg(record.weight) ?? 74,
    photo: photoSources[0] ?? fallbackAvatar,
    photoSources: photoSources.length ? photoSources : undefined,
    marketValueEurCents: (5_000_000 + (goals + assists) * 1_500_000 + appearances * 250_000) * 100,
    contractUntil: `${2027 + (index % 4)}-06-30`,
    stats,
  }
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
    crestSources: [
      value(record, 'strBadge'),
      value(record, 'strTeamBadge'),
      value(record, 'strLogo'),
      ...(fallback.crestSources ?? []),
      fallback.crest,
    ].filter((item): item is string => Boolean(item)),
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
    crestSources: [
      value((Array.isArray(record.logos) ? (record.logos as ApiRecord[])[0] : undefined) ?? {}, 'href'),
      value(sportsDbRecord ?? {}, 'strBadge'),
      value(sportsDbRecord ?? {}, 'strLogo'),
      ...(fallback?.crestSources ?? []),
      fallback?.crest,
    ].filter((item): item is string => Boolean(item)),
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
      getJson(`${espnWebApiBase}/${espnLeagueSlug}/standings`),
      getJson(`${espnSiteApiBase}/${espnLeagueSlug}/teams`),
      getJson(`${espnSiteApiBase}/${espnLeagueSlug}/scoreboard`).catch((): ApiRecord => ({})),
    ])
    const leagueRecords = Array.isArray(leaguePayload.leagues) ? (leaguePayload.leagues as ApiRecord[]) : []
    const leagueLogo = compactImage(value(leagueRecords[0] ?? {}, 'strBadge'), value(leagueRecords[0] ?? {}, 'strLogo'), value(leagueRecords[0] ?? {}, 'strPoster'))
    const teamRecords = Array.isArray(teamPayload.teams) ? (teamPayload.teams as ApiRecord[]) : []
    const sportsDbByName = new Map(teamRecords.map((team) => [normalizeTeamName(value(team, 'strTeam')), team]))
    const fallbackByName = new Map(fallback.teams.map((team) => [normalizeTeamName(team.name), team]))
    const espnTeamRecords = Array.isArray((espnTeamsPayload.sports as ApiRecord[] | undefined)?.[0]?.leagues)
      ? (((espnTeamsPayload.sports as ApiRecord[])[0]?.leagues as ApiRecord[])[0]?.teams as ApiRecord[] | undefined) ?? []
      : []
    const espnTeams = espnTeamRecords
      .map((entry) => (typeof entry.team === 'object' ? entry.team as ApiRecord : undefined))
      .filter((team): team is ApiRecord => Boolean(team))
    const teams = espnTeams.length
      ? espnTeams.map((team, index) => {
          const teamName = value(team, 'displayName') ?? value(team, 'name')
          const teamKey = normalizeTeamName(teamName)
          return mapEspnTeam(
            team,
            leagueId,
            index,
            fallbackByName.get(teamKey) ?? fallback.teams[index],
            sportsDbByName.get(teamKey),
          )
        })
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

  const cachedPromise = promise.catch((error) => {
    leagueCache.delete(leagueId)
    throw error
  })
  leagueCache.set(leagueId, cachedPromise)
  return cachedPromise
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
    photoSources: [
      value(record, 'strCutout'),
      value(record, 'strThumb'),
      value(record, 'strRender'),
    ].filter((item): item is string => Boolean(item)),
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

async function loadEspnSquad(team: Team): Promise<Squad> {
  if (!team.espnId) {
    throw new Error('Team has no ESPN id for roster lookup.')
  }

  const cacheKey = `${team.leagueId}:${team.espnId}`
  const cached = espnSquadCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    const leagueSlug = espnLeagueSlugByLeagueId[team.leagueId]
    const rosterPayload = await getJson(`${espnSiteApiBase}/${leagueSlug}/teams/${team.espnId}/roster`)
    const athletes = Array.isArray(rosterPayload.athletes)
      ? (rosterPayload.athletes as ApiRecord[])
      : []

    if (!athletes.length) {
      throw new Error('ESPN returned no roster athletes.')
    }

    return {
      teamId: team.id,
      players: athletes.map((athlete, index) =>
        mapEspnPlayer(
          athlete,
          team,
          undefined,
          index,
        ),
      ),
    }
  })()

  const cachedPromise = promise.catch((error) => {
    espnSquadCache.delete(cacheKey)
    throw error
  })
  espnSquadCache.set(cacheKey, cachedPromise)
  return cachedPromise
}

export async function getStandings(params: FootballQueryParams = {}): Promise<Standing[]> {
  return (await loadLeague(leagueOrDefault(params.leagueId))).standings
}

export async function getMatches(params: FootballQueryParams = {}): Promise<Match[]> {
  const matches = (await loadLeague(leagueOrDefault(params.leagueId))).matches
  return matches.filter((match) => !params.matchday || match.matchday === params.matchday)
}

export async function getTeam(params: FootballQueryParams = {}): Promise<Team> {
  const leagueId = leagueOrDefault(params.leagueId)
  const teams = (await loadLeague(leagueId)).teams
  return teams.find((team) => team.id === params.teamId) ?? teams[0]!
}

export async function getSquad(params: FootballQueryParams = {}): Promise<Squad> {
  const team = await getTeam(params)
  const cached = squadCache.get(team.id)
  if (cached) {
    return cached
  }

  try {
    const promise = loadEspnSquad(team).then(async (squad) => ({
      ...squad,
      players: await hydratePlayerImages(squad.players, 8),
    }))

    const cachedPromise = promise.catch((error) => {
      squadCache.delete(team.id)
      throw error
    })
    squadCache.set(team.id, cachedPromise)
    return await cachedPromise
  } catch {
    // Fall through to TheSportsDB and local snapshots without caching the
    // fallback; a later retry should be able to recover once ESPN/proxy works.
  }

  try {
    if (!team.theSportsDbId) {
      return { teamId: team.id, players: team.squad ?? createSyntheticSquad(team).players }
    }

    const payload = await getJson(`${apiBase}/lookup_all_players.php?id=${team.theSportsDbId}`)
    const records = Array.isArray(payload.player) ? (payload.player as ApiRecord[]) : []
    const players = records.map((player, index) => mapApiPlayer(player, team, index)).slice(0, 28)
    return { teamId: team.id, players: players.length ? players : team.squad ?? createSyntheticSquad(team).players }
  } catch {
    return { teamId: team.id, players: team.squad ?? createSyntheticSquad(team).players }
  }
}

async function featuredPlayers(leagueId: LeagueId): Promise<Player[]> {
  const teams = (await loadLeague(leagueId)).teams
  const squadResults = await Promise.allSettled(teams.map((team) => loadEspnSquad(team)))
  const rejected = squadResults.filter((result) => result.status === 'rejected')

  if (rejected.length) {
    throw new Error('ESPN roster coverage is incomplete for this league.')
  }

  return squadResults.flatMap((result) =>
    result.status === 'fulfilled' ? result.value.players : [],
  )
}

export async function getTopScorers(params: FootballQueryParams = {}): Promise<Scorer[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const players = await featuredPlayers(leagueId)
  const teams = (await loadLeague(leagueId)).teams
  const leaders = players
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 15)
  const hydratedLeaders = await hydratePlayerImages(leaders, 5)
  return hydratedLeaders
    .map((player) => ({ id: `${player.id}-scorer`, player, team: teams.find((team) => team.id === player.teamId)!, goals: player.stats.goals, assists: player.stats.assists }))
}

export async function getTopAssists(params: FootballQueryParams = {}): Promise<Assist[]> {
  const leagueId = leagueOrDefault(params.leagueId)
  const players = await featuredPlayers(leagueId)
  const teams = (await loadLeague(leagueId)).teams
  const leaders = players
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 15)
  const hydratedLeaders = await hydratePlayerImages(leaders, 5)
  return hydratedLeaders
    .map((player) => ({ id: `${player.id}-assist`, player, team: teams.find((team) => team.id === player.teamId)!, assists: player.stats.assists, goals: player.stats.goals }))
}

export async function getPlayer(params: FootballQueryParams = {}): Promise<Player> {
  const leagueId = leagueOrDefault(params.leagueId)
  try {
    const teams = (await loadLeague(leagueId)).teams
    for (const team of teams) {
      try {
        const squad = await loadEspnSquad(team)
        const player = squad.players.find((item) => item.id === params.playerId)
        if (player) {
          return hydratePlayerImage(player)
        }
      } catch {
        const squad = await getSquad({ leagueId, teamId: team.id })
        const player = squad.players.find((item) => item.id === params.playerId)
        if (player) {
          return hydratePlayerImage(player)
        }
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
  const data = await loadLeague(leagueId)
  return {
    league,
    season: {
      id: estimateCurrentSeasonLabel(),
      label: estimateCurrentSeasonLabel().replace('-', '/'),
      startDate: `${estimateCurrentSeasonLabel().slice(0, 4)}-08-01T00:00:00Z`,
      endDate: `${Number(estimateCurrentSeasonLabel().slice(0, 4)) + 1}-05-31T23:59:59Z`,
      currentMatchday: data.currentMatchday,
    },
    standings: data.standings,
    topScorers: await getTopScorers(params),
    topAssists: await getTopAssists(params),
    recentMatches: data.matches,
    teams: data.teams,
    lastUpdated: new Date().toISOString(),
  }
}
