import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import type { Match } from '@/services/types'

export function MatchOfTheDay({ match }: { match: Match }) {
  const [open, setOpen] = useState(false)
  const isTodayLive = match.status === 'LIVE'
  return (
    <section className="stat-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Match of the Day</h2>
        {isTodayLive ? <Badge className="animate-pulse border-red-500/30 bg-red-500/15 text-red-500">LIVE</Badge> : null}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div><img src={match.homeTeam.crest} alt="" className="mx-auto h-16 w-16 rounded-lg" loading="lazy" /><p className="mt-2 text-sm font-medium">{match.homeTeam.shortName}</p></div>
        <div className="font-mono text-4xl font-bold">{match.homeScore}-{match.awayScore}</div>
        <div><img src={match.awayTeam.crest} alt="" className="mx-auto h-16 w-16 rounded-lg" loading="lazy" /><p className="mt-2 text-sm font-medium">{match.awayTeam.shortName}</p></div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{formatDateTime(match.utcDate)} · {match.venue}</p>
      <Button variant="outline" className="mt-4 w-full" onClick={() => setOpen((value) => !value)}>View Events</Button>
      <AnimatePresence>
        {open ? (
          <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="mt-4 space-y-2 overflow-hidden">
            {match.events.map((event) => <li key={event.id} className="rounded-md bg-muted p-2 text-sm"><span className="font-mono">{event.minute}'</span> {event.type} · {event.playerName}</li>)}
          </motion.ol>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
