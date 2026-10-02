/** Maps ESPN roster athletes and stat leaders to the app's player types. */
import { createFlag, createPlayerAvatar } from '@/lib/visualAssets'
import type { Player, PlayerRef, Team } from '@/services/types'

import type { EspnLeader } from './schemas'

type ApiRecord = Record<string, unknown>

function text(record: ApiRecord | undefined, key: string): string | undefined {
  const raw = record?.[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
}

function toNumber(raw: unknown): number {
  const parsed = typeof raw === 'number' ? raw : Number(raw ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function child(record: ApiRecord | undefined, key: string): ApiRecord | undefined {
  const raw = record?.[key]
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as ApiRecord) : undefined
}

export const espnPlayerId = (athleteId: string) => `espn-${athleteId}`
export const espnAthleteId = (playerId: string) => playerId.replace(/^espn-/, '')

/** ESPN's CDN serves headshots by athlete id; AssetImage falls back on 404. */
export const espnHeadshot = (athleteId: string) => `https://a.espncdn.com/i/headshots/soccer/players/full/${athleteId}.png`

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  return `${parts[0]?.[0] ?? 'P'}${parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''}`.toUpperCase()
}

function statByName(record: ApiRecord, name: string): number {
  const categories = child(child(record, 'statistics'), 'splits')?.categories
  if (!Array.isArray(categories)) return 0
  for (const category of categories as ApiRecord[]) {
    const stats = category.stats
    if (!Array.isArray(stats)) continue
    const stat = (stats as ApiRecord[]).find((item) => text(item, 'name') === name)
    if (stat) return toNumber(stat.value)
  }
  return 0
}

export function normalizePosition(position: string | undefined): Player['position'] {
  const normalized = position?.toLowerCase() ?? ''
  if (normalized.includes('goal') || normalized === 'g' || normalized === 'gk') return 'GK'
  if (normalized.includes('def') || normalized === 'd') return 'DF'
  if (normalized.includes('mid') || normalized === 'm') return 'MF'
  return 'FW'
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

/**
 * Indicative 0–100 attribute profile derived from real season output. It is a
 * visual summary of the stats below it, not scouting data.
 */
export function derivePlayerAttributes(position: Player['position'], stats: Player['stats']): Player['stats']['attributes'] {
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

export function mapRosterAthlete(record: ApiRecord, team: Team): Player | null {
  const athleteId = text(record, 'id')
  const name = text(record, 'displayName') ?? text(record, 'fullName')
  if (!athleteId || !name) return null

  const position = child(record, 'position')
  const appearances = statByName(record, 'appearances')
  const subIns = statByName(record, 'subIns')
  const goals = statByName(record, 'totalGoals')
  const assists = statByName(record, 'goalAssists')
  const starts = Math.max(0, appearances - subIns)
  const stats: Player['stats'] = {
    appearances,
    goals,
    assists,
    yellowCards: statByName(record, 'yellowCards'),
    redCards: statByName(record, 'redCards'),
    // ESPN rosters carry starts/sub appearances but no minutes; this is an
    // estimate (full games for starts, a typical cameo for subs).
    minutes: appearances > 0 ? Math.max(1, starts * 86 + subIns * 24) : 0,
    trend: [goals, assists, statByName(record, 'totalShots'), statByName(record, 'shotsOnTarget'), statByName(record, 'saves')].map(
      (item) => Math.round(item),
    ),
    attributes: { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 },
  }
  const mappedPosition = normalizePosition(text(position, 'abbreviation') ?? text(position, 'displayName') ?? text(position, 'name'))
  stats.attributes = derivePlayerAttributes(mappedPosition, stats)

  const flag = child(record, 'flag')
  const nationality = text(record, 'citizenship') ?? text(flag, 'alt') ?? ''
  const headshot = text(child(record, 'headshot'), 'href')
  const height = toNumber(record.height)
  const weight = toNumber(record.weight)
  const photoSources = [headshot, espnHeadshot(athleteId)].filter((item): item is string => Boolean(item))

  return {
    id: espnPlayerId(athleteId),
    teamId: team.id,
    leagueId: team.leagueId,
    name,
    number: toNumber(record.jersey),
    position: mappedPosition,
    nationality,
    flag: text(flag, 'href') ?? nationalityFlag(nationality),
    age: toNumber(record.age) || undefined,
    heightCm: height > 0 ? Math.round(height * 2.54) : undefined,
    weightKg: weight > 0 ? Math.round(weight * 0.453592) : undefined,
    photo: photoSources[0] ?? createPlayerAvatar(initials(name), team.primaryColor ?? '#18181b'),
    photoSources,
    stats,
  }
}

/** A stat-leader row (goals or assists) as a lightweight player reference. */
export function mapLeader(leader: EspnLeader, team: Team): PlayerRef | null {
  const athlete = leader.athlete
  if (!athlete?.id || !athlete.displayName) return null
  const statistic = (name: string) => athlete.statistics?.find((item) => item.name === name)?.value ?? 0
  return {
    id: espnPlayerId(athlete.id),
    teamId: team.id,
    leagueId: team.leagueId,
    name: athlete.displayName,
    number: Number(athlete.jersey) || undefined,
    photo: espnHeadshot(athlete.id),
    photoSources: [espnHeadshot(athlete.id)],
    appearances: statistic('appearances'),
    goals: statistic('totalGoals'),
    assists: statistic('goalAssists'),
  }
}
