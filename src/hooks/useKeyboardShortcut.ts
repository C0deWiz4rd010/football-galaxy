import { useEffect } from 'react'

export function useKeyboardShortcut(keys: string[], callback: (event: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const normalized = event.key.toLowerCase()
      if (keys.includes(normalized)) {
        callback(event)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [callback, keys])
}
