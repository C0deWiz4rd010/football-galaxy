import { lazy, type ComponentType } from 'react'

const RELOAD_FLAG = 'fg-chunk-reload-at'
const RELOAD_WINDOW_MS = 10_000

/**
 * After a deploy, hashed chunk names change and an open tab can no longer load
 * the old ones. Reload once to pick up the new build; if a reload already
 * happened moments ago, give up so a genuinely broken chunk cannot loop.
 */
function reloadOnce(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_FLAG) ?? 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    window.sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
  } catch {
    // Storage blocked: still try a single reload.
  }
  window.location.reload()
  return true
}

if (typeof window !== 'undefined') {
  // Vite fires this when a dynamic import's preload fails.
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce()) event.preventDefault()
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mirrors React.lazy's own constraint
export function lazyWithReload<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((error: unknown) => {
      if (reloadOnce()) {
        // Keep Suspense pending while the page reloads.
        return new Promise<{ default: T }>(() => {})
      }
      throw error
    }),
  )
}
