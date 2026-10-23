import { useState } from 'react'

import { Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/contexts/LocaleContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { WorldCupBracketMatch, WorldCupBracketRound, WorldCupTeam } from '@/services/worldCup/types'

import { PenaltyScore, TeamFlag } from './components'
import { useWorldCupLabels } from './labels'
import { winnerSide } from './utils'

function TeamLine({
  team,
  score,
  penalties,
  state,
}: {
  team?: WorldCupTeam
  score?: number
  penalties?: number
  state: 'winner' | 'loser' | 'open'
}) {
  const wc = useWorldCupLabels()
  return (
    <span className={cn('flex items-center justify-between gap-2 px-2 py-1.5', state === 'loser' && 'text-muted-foreground')}>
      <span className="flex min-w-0 items-center gap-2">
        {team && !team.placeholder ? (
          <>
            <TeamFlag team={team} className="h-3.5 w-5" />
            <span className={cn('truncate', state === 'winner' && 'font-semibold')}>{wc.team(team)}</span>
          </>
        ) : (
          <span className="truncate italic text-muted-foreground">{wc.team(team)}</span>
        )}
      </span>
      <PenaltyScore score={score} penalties={penalties} className={state === 'winner' ? undefined : 'font-medium'} />
    </span>
  )
}

function MatchCard({ match }: { match: WorldCupBracketMatch }) {
  const winner = winnerSide(match)
  const body = (
    <>
      <TeamLine team={match.homeTeam} score={match.homeScore} penalties={match.penalties?.home} state={winner ? (winner === 'home' ? 'winner' : 'loser') : 'open'} />
      <span aria-hidden className="block h-px bg-border/60" />
      <TeamLine team={match.awayTeam} score={match.awayScore} penalties={match.penalties?.away} state={winner ? (winner === 'away' ? 'winner' : 'loser') : 'open'} />
    </>
  )
  const className = 'block overflow-hidden rounded-md border border-border/60 bg-card text-xs'
  return match.placeholder ? (
    <div className={className}>{body}</div>
  ) : (
    <Link
      to={`/world-cup-2026/match/${match.id}`}
      className={cn(className, 'transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      {body}
    </Link>
  )
}

/**
 * Knockout bracket. Wide screens show every round side by side; smaller
 * screens switch rounds with tabs instead of a 960px horizontal scroller.
 */
export function WorldCupBracketBoard({ rounds }: { rounds: WorldCupBracketRound[] }) {
  const showAll = useMediaQuery('(min-width: 1440px)')
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const [activeId, setActiveId] = useState(rounds[0]?.id)

  if (!rounds.length) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-background/25 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-foreground/10 text-warning-fg">
          <Trophy className="size-5" aria-hidden />
        </div>
        <h2 className="mt-3 text-base font-semibold">{t('wcBracketPendingTitle')}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{t('wcBracketPendingBody')}</p>
      </div>
    )
  }

  const pending = rounds.reduce((total, round) => total + round.matches.filter((match) => match.placeholder).length, 0)
  const active = rounds.find((round) => round.id === activeId) ?? rounds[0]!

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline">{t('wcRoundsCount', { count: rounds.length })}</Badge>
        {pending > 0 ? (
          <Badge variant="outline" className="border-warning/30 text-warning-fg">
            {t('wcToBeDecided', { count: pending })}
          </Badge>
        ) : null}
      </div>

      {showAll ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))` }}>
          {rounds.map((round) => (
            <section key={round.id} aria-labelledby={`round-${round.id}`} className="flex flex-col">
              <h2 id={`round-${round.id}`} className="mb-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {wc.stage(round.stage)}
              </h2>
              {/* Later rounds have fewer matches: spread them to line up with their feeders. */}
              <div className="flex flex-1 flex-col justify-around gap-2">
                {round.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div role="tablist" aria-label={t('wcKnockoutRounds')} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
            {rounds.map((round) => (
              <button
                key={round.id}
                type="button"
                role="tab"
                id={`round-tab-${round.id}`}
                aria-selected={round.id === active.id}
                aria-controls="bracket-round-panel"
                onClick={() => setActiveId(round.id)}
                className={cn(
                  'min-h-11 shrink-0 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  round.id === active.id
                    ? 'border-warning/40 bg-warning/12 text-warning-fg'
                    : 'border-border/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {wc.stage(round.stage)}
                <span className="ml-1.5 text-xs opacity-70">{round.matches.length}</span>
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="bracket-round-panel"
            aria-labelledby={`round-tab-${active.id}`}
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {active.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
