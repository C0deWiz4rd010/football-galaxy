/**
 * Club metadata (stadium, capacity, manager, alternative badge) for ESPN teams,
 * which carry none of it. Two free sources are merged, best first:
 *
 * - football-data.org `/competitions/{code}/teams` (key held by the proxy):
 *   all clubs with coach and venue in one call;
 * - TheSportsDB (public test key `123`): stadium and badge, matched via its
 *   `idESPN` field; the free key returns only part of each league.
 *
 * Every failure degrades to "no metadata" — the UI simply hides those fields.
 */
import { z } from 'zod'

import { fetchLiveJson } from '@/services/net/liveClient'
import { createPromiseCache } from '@/services/net/promiseCache'
import type { League } from '@/services/types'

const SPORTSDB = 'https://www.thesportsdb.com/api/v1/json/123'
const FOOTBALL_DATA = 'https://api.football-data.org/v4'

const str = z.string().nullish()

const sportsDbSchema = z.object({
  teams: z
    .array(
      z.object({
        idTeam: str,
        idESPN: str,
        strTeam: str,
        strTeamAlternate: str,
        strStadium: str,
        intStadiumCapacity: z.union([z.string(), z.number()]).nullish(),
        strBadge: str,
      }),
    )
    .nullish(),
})

const footballDataSchema = z.object({
  teams: z
    .array(
      z.object({
        name: str,
        shortName: str,
        venue: str,
        coach: z.object({ name: str }).nullish(),
      }),
    )
    .nullish(),
})

export interface TeamMeta {
  theSportsDbId?: string
  stadium?: string
  capacity?: number
  manager?: string
  badge?: string
}

/** Lookup by ESPN id first, normalized club name second. */
export interface TeamMetaIndex {
  byEspnId: Map<string, TeamMeta>
  byName: Map<string, TeamMeta>
}

/** Lower-cases and strips club suffixes so "Arsenal FC" matches "Arsenal". */
export function normalizeTeamName(name: string | undefined | null): string {
  return (name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and')
    .replace(/\b(afc|fc|cf|ac|ssc|as|sc|vfl|vfb|tsg|fsv|rcd|ogc|losc|1\.)\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

const clean = (value: string | null | undefined) => (value && value.trim() ? value.trim() : undefined)

function merge(target: Map<string, TeamMeta>, key: string, meta: TeamMeta) {
  if (!key) return
  const existing = target.get(key)
  target.set(key, { ...meta, ...Object.fromEntries(Object.entries(existing ?? {}).filter(([, value]) => value !== undefined)) })
}

async function loadSportsDb(league: League, index: TeamMetaIndex) {
  const raw = await fetchLiveJson<unknown>(`${SPORTSDB}/search_all_teams.php?l=${encodeURIComponent(league.theSportsDbLeagueName)}`)
  for (const team of sportsDbSchema.safeParse(raw).data?.teams ?? []) {
    const meta: TeamMeta = {
      theSportsDbId: clean(team.idTeam),
      stadium: clean(team.strStadium),
      capacity: Number(team.intStadiumCapacity) || undefined,
      badge: clean(team.strBadge),
    }
    const espnId = clean(team.idESPN)
    if (espnId) merge(index.byEspnId, espnId, meta)
    for (const name of [team.strTeam, ...(team.strTeamAlternate?.split(',') ?? [])]) merge(index.byName, normalizeTeamName(name), meta)
  }
}

async function loadFootballData(league: League, index: TeamMetaIndex) {
  const raw = await fetchLiveJson<unknown>(`${FOOTBALL_DATA}/competitions/${league.apiCode}/teams`)
  for (const team of footballDataSchema.safeParse(raw).data?.teams ?? []) {
    const meta: TeamMeta = { stadium: clean(team.venue), manager: clean(team.coach?.name) }
    for (const name of [team.name, team.shortName]) {
      const key = normalizeTeamName(name)
      // football-data.org is the more complete source: it wins on conflicts.
      if (key) index.byName.set(key, { ...index.byName.get(key), ...Object.fromEntries(Object.entries(meta).filter(([, value]) => value)) })
    }
  }
}

const metaCache = createPromiseCache<string, TeamMetaIndex>(30 * 60_000)

export const emptyTeamMetaIndex = (): TeamMetaIndex => ({ byEspnId: new Map(), byName: new Map() })

/** Club metadata changes rarely: one load per league every 30 minutes. */
export function getTeamMetaIndex(league: League): Promise<TeamMetaIndex> {
  return metaCache.get(league.id, () => loadTeamMetaIndex(league))
}

async function loadTeamMetaIndex(league: League): Promise<TeamMetaIndex> {
  const index = emptyTeamMetaIndex()
  // Both load in parallel; the merge is order-independent: TheSportsDB only
  // fills gaps (merge keeps existing values), football-data.org overwrites.
  await Promise.all([loadSportsDb(league, index).catch(() => undefined), loadFootballData(league, index).catch(() => undefined)])
  return index
}

export function findTeamMeta(index: TeamMetaIndex, espnId: string | undefined, names: Array<string | undefined>): TeamMeta | undefined {
  const byId = espnId ? index.byEspnId.get(espnId) : undefined
  const byName = names.map((name) => index.byName.get(normalizeTeamName(name))).find(Boolean)
  if (!byId && !byName) return undefined
  return { ...byId, ...Object.fromEntries(Object.entries(byName ?? {}).filter(([, value]) => value !== undefined)) }
}
