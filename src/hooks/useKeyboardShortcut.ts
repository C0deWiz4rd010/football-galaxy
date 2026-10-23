import { useEffect, useRef } from 'react'

/**
 * Subscribes once per key set; the latest callback is read from a ref so
 * callers can pass inline functions and array literals without re-binding the
 * window listener on every render.
 */
export function useKeyboardShortcut(keys: string[], callback: (event: KeyboardEvent) => void) {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  const keySignature = keys.map((key) => key.toLowerCase()).join('|')

  useEffect(() => {
    const keySet = new Set(keySignature.split('|'))
    const handleKeyDown = (event: KeyboardEvent) => {
      if (keySet.has(event.key.toLowerCase())) callbackRef.current(event)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keySignature])
}
