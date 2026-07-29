/**
 * Persistent stale-while-revalidate cache.
 *
 * The in-memory module cache in `useFootballData` is fast but dies on reload,
 * which means every page refresh shows skeletons and fires fresh upstream calls
 * — painful on a 10 req/min free tier. This layer mirrors successful responses
 * into `localStorage` so that:
 *
 * - a reload paints the last-known data instantly (even if stale), then
 *   revalidates in the background;
 * - the UI can surface honest freshness ("updated 3 min ago");
 * - transient upstream outages fall back to the last good snapshot.
 *
 * Entries are namespaced and carry a timestamp; `ttlMs` decides when a value is
 * considered stale (still served, but a background refresh is triggered).
 */

const NAMESPACE = 'fg-cache:'
const SCHEMA_VERSION = 1

interface StoredEntry<T> {
  /** Schema version — bumping this invalidates old shapes safely. */
  v: number
  /** Epoch ms when the value was written. */
  t: number
  /** The cached payload. */
  d: T
}

export interface CacheHit<T> {
  value: T
  /** Epoch ms the value was stored. */
  fetchedAt: number
  /** True when older than the requested TTL — serve it, but revalidate. */
  isStale: boolean
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    // Access can throw in private-mode / sandboxed contexts.
    return null
  }
}

function keyFor(key: string): string {
  return `${NAMESPACE}${key}`
}

/** Read a cached value. Returns null on miss, corruption, or version mismatch. */
export function readCache<T>(key: string, ttlMs: number): CacheHit<T> | null {
  const store = storage()
  if (!store) return null

  const raw = store.getItem(keyFor(key))
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as StoredEntry<T>
    if (!parsed || parsed.v !== SCHEMA_VERSION || typeof parsed.t !== 'number') {
      store.removeItem(keyFor(key))
      return null
    }
    return {
      value: parsed.d,
      fetchedAt: parsed.t,
      isStale: Date.now() - parsed.t >= ttlMs,
    }
  } catch {
    store.removeItem(keyFor(key))
    return null
  }
}

/**
 * Persist a value. Silently no-ops when storage is unavailable, and evicts the
 * oldest entries when the quota is exceeded so a full disk never breaks fetches.
 */
export function writeCache<T>(key: string, value: T): void {
  const store = storage()
  if (!store) return

  const entry: StoredEntry<T> = { v: SCHEMA_VERSION, t: Date.now(), d: value }
  const payload = JSON.stringify(entry)

  try {
    store.setItem(keyFor(key), payload)
  } catch {
    // Quota exceeded — drop the oldest cache entries and retry once.
    if (evictOldest(store) > 0) {
      try {
        store.setItem(keyFor(key), payload)
      } catch {
        // Give up quietly; the in-memory cache still works this session.
      }
    }
  }
}

/** Remove all cached entries in our namespace. */
export function clearCache(): void {
  const store = storage()
  if (!store) return
  for (const key of ownKeys(store)) store.removeItem(key)
}

function ownKeys(store: Storage): string[] {
  const keys: string[] = []
  for (let i = 0; i < store.length; i += 1) {
    const key = store.key(i)
    if (key && key.startsWith(NAMESPACE)) keys.push(key)
  }
  return keys
}

/** Evict roughly the oldest quarter of our entries. Returns count removed. */
function evictOldest(store: Storage): number {
  const entries = ownKeys(store)
    .map((key) => {
      try {
        const parsed = JSON.parse(store.getItem(key) ?? '') as StoredEntry<unknown>
        return { key, t: typeof parsed?.t === 'number' ? parsed.t : 0 }
      } catch {
        return { key, t: 0 }
      }
    })
    .sort((a, b) => a.t - b.t)

  const removeCount = Math.max(1, Math.ceil(entries.length / 4))
  for (let i = 0; i < removeCount && i < entries.length; i += 1) {
    const entry = entries[i]
    if (entry) store.removeItem(entry.key)
  }
  return Math.min(removeCount, entries.length)
}
