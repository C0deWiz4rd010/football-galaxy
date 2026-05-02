import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useFootballData } from '@/hooks/useFootballData'
import { getLeague } from '@/lib/leagues'
import type { LeagueSummary } from '@/services/types'

export function MatchdaySwiper({ leagueId, matchday, onSelect }: { leagueId: string; matchday: number; onSelect: (matchday: number) => void }) {
  const [ref, api] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' })
  const league = getLeague(leagueId)
  const { data } = useFootballData<LeagueSummary>('getLeagueSummary', { leagueId: league.id })
  const activeMatchday = matchday > 0 ? matchday : data?.season.currentMatchday ?? 38

  useEffect(() => {
    if (matchday === 0 && data?.season.currentMatchday) {
      onSelect(data.season.currentMatchday)
    }
  }, [data?.season.currentMatchday, matchday, onSelect])

  useEffect(() => {
    api?.scrollTo(Math.max(0, activeMatchday - 3))
  }, [activeMatchday, api])

  return (
    <div className="sticky top-16 z-20 border-b bg-background/90 px-4 py-2 backdrop-blur md:hidden" ref={ref}>
      <div className="flex gap-2">
        {Array.from({ length: 38 }, (_, index) => index + 1).map((item) => (
          <Button key={item} size="sm" variant={item === activeMatchday ? 'default' : 'outline'} className="h-8 shrink-0 rounded-full px-3 text-xs" style={item === activeMatchday ? { backgroundColor: league.color } : undefined} onClick={() => onSelect(item)}>
            {item}
          </Button>
        ))}
      </div>
    </div>
  )
}
