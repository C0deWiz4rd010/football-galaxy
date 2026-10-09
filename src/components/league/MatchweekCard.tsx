import { useMemo, useState } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AssetImage } from '@/components/shared/AssetImage'
import { EmptyState } from '@/components/shared/EmptyState'
import { useLocale } from '@/contexts/LocaleContext'
import { getCrestSources } from '@/lib/assetSources'
import { currentMatchweekIndex, groupMatchweeks } from '@/lib/matchweeks'
import { cn } from '@/lib/utils'
import { createTeamCrest } from '@/lib/visualAssets'
import type { Match, Team } from '@/services/types'

function TeamCell({ team, align, emphasis }: { team: Team; align: 'left' | 'right'; emphasis: boolean }) {
  return (
    <Link
      to={`/${team.leagueId}/team/${team.id}`}
      className={cn(
        'flex min-h-10 min-w-0 items-center gap-2 rounded-xs hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        align === 'right' && 'flex-row-reverse text-right',
        emphasis ? 'font-semibold' : 'text-muted-foreground',
      )}
    >
      <AssetImage
        src={team.crest}
        fallbackSrc={[...getCrestSources(team), createTeamCrest(team.shortName, team.primaryColor, team.secondaryColor)]}
        alt=""
        width={22}
        height={22}
        style={{ width: 22, height: 22 }}
        className="shrink-0 object-contain"
        loading="lazy"
      />
      <span className="truncate">{team.shortName || team.name}</span>
    </Link>
  )
}

function MatchRow({ match, timeFormat }: { match: Match; timeFormat: Intl.DateTimeFormat }) {
  const { t } = useLocale()
  const played = typeof match.homeScore === 'number' && typeof match.awayScore === 'number' && match.status !== 'SCHEDULED'
  const homeWon = played && match.homeScore! > match.awayScore!
  const awayWon = played && match.awayScore! > match.homeScore!
  return (
    <li className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 py-2 text-sm">
      <TeamCell team={match.homeTeam} align="right" emphasis={!played || homeWon || !awayWon} />
      <span
        className={cn(
          'min-w-[4.5rem] rounded-sm px-2 py-1 text-center font-mono tabular-nums',
          match.status === 'LIVE' ? 'bg-live/12 font-bold text-live' : played ? 'bg-foreground/5 font-bold' : 'text-xs text-muted-foreground',
        )}
      >
        {played ? `${match.homeScore}:${match.awayScore}` : timeFormat.format(new Date(match.utcDate))}
        {match.status === 'LIVE' ? <span className="sr-only"> ({t('liveShort')})</span> : null}
      </span>
      <TeamCell team={match.awayTeam} align="left" emphasis={!played || awayWon || !homeWon} />
    </li>
  )
}

/**
 * Fixtures and results by round, built from the clubs' season schedules.
 * Rounds are time clusters (the feeds carry no matchday numbers), labelled
 * by their dates; arrows step through the season.
 */
export function MatchweekCard({ matches }: { matches?: Match[] }) {
  const { t, locale } = useLocale()
  const weeks = useMemo(() => groupMatchweeks(matches ?? []), [matches])
  const [picked, setPicked] = useState<number | null>(null)
  const index = Math.min(picked ?? currentMatchweekIndex(weeks), weeks.length - 1)
  const week = weeks[index]

  const intlLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const dayFormat = useMemo(() => new Intl.DateTimeFormat(intlLocale, { weekday: 'short', day: 'numeric', month: 'short' }), [intlLocale])
  const timeFormat = useMemo(() => new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', minute: '2-digit' }), [intlLocale])
  const rangeFormat = useMemo(() => new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short' }), [intlLocale])

  const days = useMemo(() => {
    const byDay = new Map<string, Match[]>()
    for (const match of week?.matches ?? []) {
      const key = match.utcDate.slice(0, 10)
      byDay.set(key, [...(byDay.get(key) ?? []), match])
    }
    return [...byDay.entries()]
  }, [week])

  return (
    <section className="stat-card" aria-labelledby="fixtures-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('fixturesEyebrow')}</p>
          <h2 id="fixtures-heading" className="mt-1 text-lg font-semibold tracking-tight">
            {t('fixturesResults')}
          </h2>
        </div>
        {week ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPicked(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label={t('previousRound')}
              className="flex size-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-foreground/5 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <p className="min-w-[8.5rem] text-center text-sm" aria-live="polite">
              <span className="block font-semibold">
                {rangeFormat.formatRange(new Date(week.start), new Date(week.end))}
              </span>
              <span className="block text-xs text-muted-foreground">{t('roundOf', { index: index + 1, total: weeks.length })}</span>
            </p>
            <button
              type="button"
              onClick={() => setPicked(Math.min(weeks.length - 1, index + 1))}
              disabled={index >= weeks.length - 1}
              aria-label={t('nextRound')}
              className="flex size-11 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-foreground/5 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {!week ? (
        <EmptyState title={t('noFixtures')} description={t('noFixturesHint')} className="min-h-0 border-0 p-0" />
      ) : (
        <div className="grid gap-x-8 gap-y-3 lg:grid-cols-2">
          {days.map(([day, dayMatches]) => (
            <div key={day}>
              <h3 className="border-b border-border/60 pb-1 text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                {dayFormat.format(new Date(`${day}T12:00:00Z`))}
              </h3>
              <ul className="divide-y divide-border/40">
                {dayMatches.map((match) => (
                  <MatchRow key={match.id} match={match} timeFormat={timeFormat} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
