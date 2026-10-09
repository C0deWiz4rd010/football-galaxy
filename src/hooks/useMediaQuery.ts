import { useCallback, useSyncExternalStore } from 'react'

/** Live `matchMedia` result; `false` where matchMedia is unavailable (tests). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => undefined
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false),
    () => false,
  )
}

/** Tailwind `md` and up: sidebar layout, full tables. */
export const DESKTOP_QUERY = '(min-width: 768px)'
