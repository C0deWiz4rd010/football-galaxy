/** Group tables and the bracket preview. */
import { ChevronRight, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { type MessageKey, useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import type { WorldCupBracketRound, WorldCupGroupStanding, WorldCupTeam } from '@/services/worldCup/types'

import { useWorldCupLabels } from '../labels'
import { winnerSide } from '../utils'
import { PenaltyScore, TeamFlag } from './shared'

const hintKey: Record<WorldCupGroupStanding['qualificationHint'], MessageKey | undefined> = {
  'top-two': 'wcHintTop2',
  'best-third': 'wcHintBestThird',
  'best-third-watch': 'wcHintThird',
  pending: undefined,
  eliminated: undefined,
}

const isThirdHint = (hint: WorldCupGroupStanding['qualificationHint']) => hint === 'best-third' || hint === 'best-third-watch'

/**
 * One group's table. Fixed layout so long names truncate instead of pushing
 * the card wider than its grid column; whole rows are links.
 */
export function WorldCupGroupTable({ group, rows }: { group: string; rows: WorldCupGroupStanding[] }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  return (
    <div className="stat-card overflow-hidden rounded-lg p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <h2 className="text-sm font-semibold">{wc.group(group)}</h2>
        <div className="flex items-center gap-1.5" aria-hidden>
          <Badge variant="outline" className="border-info/30 text-info-fg">{t('wcTop2')}</Badge>
          <Badge variant="outline" className="border-warning/30 text-warning-fg">{t('wcThirdShort')}</Badge>
        </div>
      </div>
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">{t('wcGroupCaption', { group })}</caption>
        <colgroup>
          <col />
          <col className="w-9" />
          <col className="w-11" />
          <col className="w-12" />
        </colgroup>
        <thead className="text-2xs uppercase tracking-eyebrow text-muted-foreground">
          <tr className="border-b border-border/60">
            <th scope="col" className="px-3 py-2 text-left font-medium">{t('team')}</th>
            <th scope="col" className="px-1 py-2 text-right font-medium"><abbr title={t('matchesPlayed')}>{t('playedShort')}</abbr></th>
            <th scope="col" className="px-1 py-2 text-right font-medium"><abbr title={t('goalDifference')}>{t('gdShort')}</abbr></th>
            <th scope="col" className="px-3 py-2 text-right font-medium"><abbr title={t('points')}>{t('pointsShort')}</abbr></th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((row) => {
            const hint = hintKey[row.qualificationHint]
            return (
              <tr
                key={row.id}
                className={cn(
                  'relative border-b border-border/60 transition-colors last:border-0 focus-within:bg-foreground/5 hover:bg-foreground/5',
                  row.qualificationHint === 'top-two' && 'bg-info/5',
                  isThirdHint(row.qualificationHint) && 'bg-warning/5',
                )}
              >
                <td className="px-3 py-2">
                  <Link
                    to={`/world-cup-2026/team/${row.team.id}`}
                    className="flex min-w-0 items-center gap-2 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{row.rank}</span>
                    <TeamFlag team={row.team} className="h-4 w-6" />
                    <span className="truncate">{wc.team(row.team)}</span>
                    {hint ? (
                      <>
                        <span
                          aria-hidden
                          className={cn('size-1.5 shrink-0 rounded-full', row.qualificationHint === 'top-two' ? 'bg-info' : 'bg-warning')}
                        />
                        <span className="sr-only">({t(hint)})</span>
                      </>
                    ) : null}
                  </Link>
                </td>
                <td className="px-1 py-2 text-right font-mono">{row.played}</td>
                <td className="px-1 py-2 text-right font-mono">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{row.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function WorldCupGroupsPreview({ grouped }: { grouped: Record<string, WorldCupGroupStanding[]> }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const groups = Object.entries(grouped)

  return (
    <section className="stat-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcGroupStandings')}</p>
          <h2 className="text-base font-semibold tracking-tight">{t('wcAllGroupsGlance')}</h2>
        </div>
        <Link to="/world-cup-2026/groups" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary">
          {t('wcViewAllGroups')}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
      {groups.length ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map(([group, rows]) => (
            <div key={group} className="surface-soft rounded-md p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{wc.group(group)}</h3>
                <abbr title={t('points')} className="text-2xs uppercase tracking-eyebrow text-muted-foreground no-underline">
                  {t('pointsShort')}
                </abbr>
              </div>
              <div className="grid gap-1">
                {rows.slice(0, 4).map((row) => (
                  <Link
                    key={row.id}
                    to={`/world-cup-2026/team/${row.team.id}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-foreground/8"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'size-1.5 rounded-full',
                        row.qualificationHint === 'top-two'
                          ? 'bg-info'
                          : isThirdHint(row.qualificationHint)
                            ? 'bg-warning'
                            : 'bg-foreground/20',
                      )}
                    />
                    <TeamFlag team={row.team} className="h-3.5 w-5" />
                    <span className="min-w-0 flex-1 truncate">{wc.team(row.team)}</span>
                    <span className="font-mono font-bold">{row.points}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 p-5 text-sm text-muted-foreground">{t('wcGroupsPending')}</p>
      )}
    </section>
  )
}

function BracketTeamLine({
  placeholder,
  score,
  penalties,
  won,
  team,
}: {
  placeholder: boolean
  score?: number
  penalties?: number
  won: boolean
  team?: WorldCupTeam
}) {
  const wc = useWorldCupLabels()
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2 py-1.5">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {placeholder || !team ? (
          <span className="truncate italic">{wc.team(undefined)}</span>
        ) : (
          <>
            <TeamFlag team={team} className="h-3.5 w-5" />
            <span className={cn('truncate', won && 'font-semibold text-foreground')}>{wc.team(team)}</span>
          </>
        )}
      </span>
      <PenaltyScore score={score} penalties={penalties} />
    </div>
  )
}

export function WorldCupBracketPreview({ rounds }: { rounds: WorldCupBracketRound[] }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  return (
    <section className="stat-card flex h-full flex-col rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcKnockout')}</p>
          <h2 className="text-base font-semibold tracking-tight">{t('wcBracketPreview')}</h2>
        </div>
        <Link to="/world-cup-2026/bracket" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary">
          {t('open')}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="flex-1">
        {rounds.length ? (
          <div className="flex flex-col gap-3">
            {/* The latest rounds are the most interesting once the tournament is decided. */}
            {rounds.slice(-2).reverse().map((round) => (
              <div key={round.id} className="surface-soft rounded-md p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">{wc.stage(round.stage)}</h3>
                <div className="grid gap-2">
                  {round.matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="grid gap-1 rounded-lg border border-border/60 p-2 text-xs">
                      <BracketTeamLine team={match.homeTeam} score={match.homeScore} penalties={match.penalties?.home} won={winnerSide(match) === 'home'} placeholder={match.placeholder} />
                      <BracketTeamLine team={match.awayTeam} score={match.awayScore} penalties={match.penalties?.away} won={winnerSide(match) === 'away'} placeholder={match.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-border/60 p-5 text-center">
            <Trophy className="size-5 text-warning-fg" aria-hidden />
            <p className="mt-2 text-sm font-medium">{t('wcBracketPendingTitle')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('wcBracketPendingBody')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
