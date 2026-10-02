/**
 * Player portraits from Wikidata/Wikimedia Commons for players whose ESPN
 * headshot is missing. Lookups are cached for the session and failures resolve
 * to `undefined` so the UI just keeps its fallback avatar.
 */
import { fetchLiveJson } from '@/services/net/liveClient'
import type { Player } from '@/services/types'

type ApiRecord = Record<string, unknown>

const imageCache = new Map<string, Promise<string | undefined>>()

function normalizePersonName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function text(record: ApiRecord | undefined, key: string) {
  const raw = record?.[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
}

export function getWikidataPlayerImage(name: string): Promise<string | undefined> {
  const key = normalizePersonName(name)
  if (!key) return Promise.resolve(undefined)
  const cached = imageCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const search = await fetchLiveJson<ApiRecord>(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json&limit=5&origin=*`,
    )
    const rows = Array.isArray(search.search) ? (search.search as ApiRecord[]) : []
    const candidate =
      rows.find((item) => /football|soccer/i.test(text(item, 'description') ?? '')) ?? rows[0]
    const entityId = text(candidate, 'id')
    if (!entityId) return undefined

    const entityPayload = await fetchLiveJson<ApiRecord>(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(entityId)}&props=claims&format=json&origin=*`,
    )
    const entity = (entityPayload.entities as ApiRecord | undefined)?.[entityId] as ApiRecord | undefined
    const p18 = (entity?.claims as ApiRecord | undefined)?.P18
    const fileName = Array.isArray(p18)
      ? ((((p18[0] as ApiRecord)?.mainsnak as ApiRecord)?.datavalue as ApiRecord)?.value as unknown)
      : undefined
    return typeof fileName === 'string'
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=320`
      : undefined
  })().catch(() => undefined)

  imageCache.set(key, promise)
  return promise
}

/** Adds a Wikimedia portrait as an extra photo source (tried after ESPN's). */
export async function withWikidataPortrait(player: Player): Promise<Player> {
  const image = await getWikidataPlayerImage(player.name)
  if (!image) return player
  return { ...player, photoSources: [...(player.photoSources ?? []), image] }
}
