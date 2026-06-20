/**
 * Shared runtime data-source preference.
 *
 * The DataSourceProvider writes the user's Live Proxy / Local Fallback choice
 * here so every data layer (leagues and World Cup) can decide whether to attempt
 * network loaders or go straight to local snapshots. Keeping it in one module
 * avoids circular imports between the league cascade and the World Cup cascade.
 */
export type SourcePreference = 'live' | 'fallback'

let sourcePreference: SourcePreference = 'live'

type Listener = (_preference: SourcePreference) => void
const listeners = new Set<Listener>()

export function setSourcePreference(next: SourcePreference) {
  if (next === sourcePreference) return
  sourcePreference = next
  for (const listener of listeners) {
    listener(next)
  }
}

export function getSourcePreference(): SourcePreference {
  return sourcePreference
}

export function subscribeToSourcePreference(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
