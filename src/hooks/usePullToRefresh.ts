import { useCallback, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => void) {
  const startY = useRef(0)
  const [distance, setDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    if (window.scrollY === 0) {
      startY.current = event.touches[0]?.clientY ?? 0
    }
  }, [])

  const onTouchMove = useCallback((event: React.TouchEvent<HTMLElement>) => {
    const currentY = event.touches[0]?.clientY ?? 0
    const nextDistance = Math.max(0, currentY - startY.current)
    if (nextDistance > 0 && window.scrollY === 0) {
      setDistance(Math.min(nextDistance, 80))
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (distance >= 60) {
      setIsRefreshing(true)
      onRefresh()
      window.setTimeout(() => setIsRefreshing(false), 700)
    }
    setDistance(0)
  }, [distance, onRefresh])

  return {
    pullDistance: distance,
    isRefreshing,
    bind: { onTouchStart, onTouchMove, onTouchEnd },
  }
}
