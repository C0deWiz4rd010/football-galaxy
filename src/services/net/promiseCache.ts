/**
 * Short-lived in-flight + result cache for composite loaders. It deduplicates
 * concurrent calls and lets sibling queries (team, player, squad) reuse one
 * league load, but entries expire so a refetch from the query layer gets fresh
 * upstream data instead of the first result of the session. Rejected promises
 * are evicted immediately so a retry can recover.
 */
export function createPromiseCache<K, V>(ttlMs: number) {
  const entries = new Map<K, { promise: Promise<V>; expiresAt: number }>()

  return {
    get(key: K, load: () => Promise<V>): Promise<V> {
      const now = Date.now()
      const hit = entries.get(key)
      if (hit && hit.expiresAt > now) return hit.promise

      const promise = load().catch((error: unknown) => {
        if (entries.get(key)?.promise === promise) entries.delete(key)
        throw error
      })
      entries.set(key, { promise, expiresAt: now + ttlMs })
      return promise
    },
    clear() {
      entries.clear()
    },
  }
}
