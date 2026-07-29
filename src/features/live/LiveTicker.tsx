import { motion } from 'framer-motion'
import { CircleDot, MapPin } from 'lucide-react'

import { AssetImage } from '@/components/shared/AssetImage'
import { createTeamCrest } from '@/lib/visualAssets'
import { cn } from '@/lib/utils'
import type { LiveMatch, LiveMatchEvent, LiveMatchTeam } from '@/services/espn/liveScores'

/** Small status pill: pulsing minute while live, FT/kickoff otherwise. */
function LiveStatusPill({ match }: { match: LiveMatch }) {
  if (match.state === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-fg-pill border border-live/50 bg-live/12 px-2 py-0.5 text-[11px] font-semibold text-live">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-live" />
        </span>
        {match.statusLabel}
      </span>
    )
  }

  const isFinished = match.state === 'ft'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-fg-pill border px-2 py-0.5 text-[11px] font-medium',
        isFinished
          ? 'border-border/60 bg-muted/40 text-muted-foreground'
          : 'border-sky-400/40 bg-sky-400/10 text-sky-200',
      )}
    >
      {match.statusLabel}
    </span>
  )
}

function TeamRow({
  team,
  isWinner,
  emphasise,
}: {
  team: LiveMatchTeam
  isWinner: boolean
  emphasise: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <AssetImage
        src={team.crest}
        fallbackSrc={createTeamCrest(team.abbreviation, team.color ?? '#334155', '#f4f4f5', 0)}
        alt={team.name}
        className="size-6 shrink-0 object-contain"
        loading="lazy"
      />
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-sm',
          emphasise && isWinner ? 'font-semibold text-foreground' : 'text-foreground/90',
        )}
      >
        {team.shortName}
      </span>
      <span
        className={cn(
          'tabular-nums text-base font-semibold',
          emphasise && isWinner ? 'text-foreground' : 'text-foreground/80',
        )}
      >
        {team.score ?? '–'}
      </span>
    </div>
  )
}

function EventChip({ event }: { event: LiveMatchEvent }) {
  const label = event.playerName || event.detail || 'Event'
  const minute = event.minute ? `${event.minute} ` : ''
  if (event.type === 'goal') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <CircleDot className="size-3 text-emerald-400" />
        {minute}
        {label}
      </span>
    )
  }
  if (event.type === 'red') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="inline-block h-3 w-2 rounded-[2px] bg-red-500" />
        {minute}
        {label}
      </span>
    )
  }
  if (event.type === 'yellow') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <span className="inline-block h-3 w-2 rounded-[2px] bg-amber-400" />
        {minute}
        {label}
      </span>
    )
  }
  return null
}

export function LiveMatchCard({ match }: { match: LiveMatch }) {
  const homeWins = (match.home.score ?? 0) > (match.away.score ?? 0)
  const awayWins = (match.away.score ?? 0) > (match.home.score ?? 0)
  const emphasise = match.state !== 'pre'
  const keyEvents = match.events.filter(
    (event) => event.type === 'goal' || event.type === 'red',
  )

  return (
    <motion.article
      layout
      className="stat-card flex flex-col gap-3 rounded-fg-lg p-fg-4 shadow-fg-1"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {match.leagueLabel}
        </span>
        <LiveStatusPill match={match} />
      </div>

      <div className="space-y-1.5">
        <TeamRow team={match.home} isWinner={homeWins} emphasise={emphasise} />
        <TeamRow team={match.away} isWinner={awayWins} emphasise={emphasise} />
      </div>

      {keyEvents.length > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border/50 pt-2">
          {keyEvents.slice(0, 6).map((event) => (
            <EventChip key={event.id} event={event} />
          ))}
        </div>
      ) : match.venue ? (
        <div className="flex items-center gap-1 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">{match.venue}</span>
        </div>
      ) : null}
    </motion.article>
  )
}

export function LiveMatchGrid({ matches }: { matches: LiveMatch[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {matches.map((match) => (
        <LiveMatchCard key={`${match.leagueId}-${match.id}`} match={match} />
      ))}
    </div>
  )
}

export function LiveMatchCardSkeleton() {
  return (
    <div className="stat-card flex animate-pulse flex-col gap-3 rounded-fg-lg p-fg-4">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-muted/60" />
        <div className="h-4 w-12 rounded bg-muted/60" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-muted/50" />
        <div className="h-5 w-full rounded bg-muted/50" />
      </div>
    </div>
  )
}
