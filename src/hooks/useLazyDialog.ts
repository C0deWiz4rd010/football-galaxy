import { useCallback, useState } from 'react'

/**
 * Open state for a dialog whose code is lazy-loaded: `mounted` turns true on
 * the first open and stays true, so the chunk loads once and the close
 * animation can still play.
 */
export function useLazyDialog() {
  const [open, setOpenState] = useState(false)
  const [mounted, setMounted] = useState(false)
  const setOpen = useCallback((next: boolean) => {
    if (next) setMounted(true)
    setOpenState(next)
  }, [])
  return { open, mounted, setOpen }
}
