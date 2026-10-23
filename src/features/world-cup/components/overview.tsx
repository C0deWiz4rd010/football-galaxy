/** Overview page: hero, tournament status, host cities, featured match, team spotlight. */
import { useState } from 'react'
import { CalendarDays, ChevronRight, Clock3, Goal, MapPin, Radio, Sparkles, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { type MessageKey, useLocale } from '@/contexts/LocaleContext'
import { countryName } from '@/lib/countries'
import { cn, formatDate, formatDateTime } from '@/lib/utils'
import type { DataQualityMeta, WorldCupFixture, WorldCupGroupStanding, WorldCupTeam } from '@/services/worldCup/types'

import { MatchStatePulse } from '../charts'
import { useWorldCupLabels } from '../labels'
import { hostCountryOf, matchPath } from '../utils'
import { TeamFlag } from './shared'

function useTournamentPhase(startsAt: string, endsAt: string, liveCount: number) {
  const { t } = useLocale()
  // Captured once per mount: the phase label does not need to tick.
  const [now] = useState(() => Date.now())
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  const dayMs = 86_400_000

  if (Number.isFinite(start) && now < start) {
    const days = Math.max(0, Math.ceil((start - now) / dayMs))
    return { label: days <= 1 ? t('wcKicksOffTomorrow') : t('wcKicksOffIn', { days }), active: false }
  }
  if (Number.isFinite(end) && now > end) {
    return { label: t('wcComplete'), active: false }
  }
  if (Number.isFinite(start)) {
    const day = Math.floor((now - start) / dayMs) + 1
    return { label: liveCount > 0 ? t('wcLiveDay', { day }) : t('wcUnderwayDay', { day }), active: true }
  }
  return { label: liveCount > 0 ? t('wcLiveNow') : t('wcScheduled'), active: liveCount > 0 }
}

export function WorldCupHero({
  endsAt,
  hostCitiesCount,
  hostCountries,
  liveCount,
  quality,
  startsAt,
}: {
  endsAt: string
  hostCitiesCount: number
  hostCountries: string[]
  liveCount: number
  quality: DataQualityMeta
  startsAt: string
}) {
  const { t, locale } = useLocale()
  return (
    <section className="stat-card app-grid-lines overflow-hidden rounded-xl p-4 shadow-fg-2 sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-amber-300/12 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-warning/30 bg-warning/12 text-warning-fg shadow-[0_0_42px_rgba(251,191,36,0.14)]">
            <Trophy className="size-7" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('worldCup2026')}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-warning-fg" aria-hidden />
                {formatDate(startsAt)} – {formatDate(endsAt)}
              </span>
              <span className="text-muted-foreground/50" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-info-fg" aria-hidden />
                {hostCountries.map((country) => countryName(country, locale)).join(', ')}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {liveCount > 0 ? (
            <Badge variant="soft" className="gap-1.5 border-success/50 bg-success/12 text-success-fg">
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/70" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              {liveCount === 1 ? t('wcLiveMatchOne') : t('wcLiveMatchMany', { count: liveCount })}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2 rounded-full bg-info" aria-hidden />
              {t('wcNoLiveMatches')}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {t('wcHostCitiesCount', { count: hostCitiesCount })}
          </Badge>
          <Badge variant="outline" className="hidden gap-1.5 lg:inline-flex">
            <Clock3 className="size-3.5" aria-hidden />
            {t('wcUpdatedAt', { time: formatDateTime(quality.lastUpdated) })}
          </Badge>
        </div>
      </div>
    </section>
  )
}

export function WorldCupTournamentStatus({
  endsAt,
  hostCitiesCount,
  hostCountries,
  liveCount,
  matchesCount,
  recentCount = 0,
  startsAt,
  teamsCount,
  upcomingCount = 0,
}: {
  endsAt: string
  hostCitiesCount: number
  hostCountries: string[]
  liveCount: number
  matchesCount: number
  recentCount?: number
  startsAt: string
  teamsCount: number
  upcomingCount?: number
}) {
  const { t, locale } = useLocale()
  const phase = useTournamentPhase(startsAt, endsAt, liveCount)
  const items = [
    { icon: <Users className="size-4" />, label: t('wcTeams'), value: `${teamsCount}`, helper: t('wcTeamsHelper') },
    { icon: <Goal className="size-4" />, label: t('wcMatches'), value: `${matchesCount}`, helper: t('wcMatchesHelper') },
    {
      icon: <MapPin className="size-4" />,
      label: t('wcHostCities'),
      value: `${hostCitiesCount}`,
      helper: hostCountries.map((country) => countryName(country, locale)).join(' · '),
    },
    { icon: <Radio className="size-4" />, label: t('wcLiveNow'), value: `${liveCount}`, helper: phase.label },
  ]

  return (
    <section className="stat-card flex h-full flex-col rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcTournamentStatus')}</p>
          <h2 className="text-base font-semibold tracking-tight">{t('wcAtAGlance')}</h2>
        </div>
        <Badge
          variant={phase.active ? 'soft' : 'outline'}
          className={cn('gap-1.5', phase.active && 'border-success/50 bg-success/12 text-success-fg')}
        >
          <span className={cn('size-1.5 rounded-full', phase.active ? 'bg-success' : 'bg-info')} aria-hidden />
          {phase.label}
        </Badge>
      </div>
      <div className="grid flex-1 gap-2">
        {[liveCount, upcomingCount, recentCount].filter((count) => count > 0).length > 1 ? (
          <div className="surface-soft rounded-md p-2">
            <MatchStatePulse live={liveCount} recent={recentCount} upcoming={upcomingCount} />
          </div>
        ) : null}
        {items.map((item) => (
          <div key={item.label} className="surface-soft flex items-center gap-3 rounded-md p-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-foreground/10 text-warning-fg" aria-hidden>
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="font-mono text-sm font-bold text-foreground">{item.value}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{item.helper}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-warning-fg" aria-hidden />
        {t('wcDataSource', { provider: 'football-data.org' })}
      </div>
    </section>
  )
}

export function WorldCupHostCityPanel({ cities }: { cities: string[] }) {
  const { t, locale } = useLocale()
  const groupedCities = cities.reduce<Record<string, string[]>>((acc, city) => {
    const country = hostCountryOf(city)
    acc[country] = [...(acc[country] ?? []), city]
    return acc
  }, {})

  return (
    <section className="stat-card flex h-full flex-col rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcHostCities')}</p>
          <h2 className="text-base font-semibold tracking-tight">{t('wcThreeHosts')}</h2>
        </div>
        <Badge variant="outline">{cities.length}</Badge>
      </div>
      <div className="grid flex-1 gap-3">
        {Object.entries(groupedCities).map(([country, countryCities]) => (
          <div key={country} className="surface-soft rounded-md p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-foreground/10 text-warning-fg" aria-hidden>
                  <MapPin className="size-4" />
                </span>
                <h3 className="text-sm font-semibold">{countryName(country, locale)}</h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{countryCities.length}</span>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {countryCities.map((city) => (
                <li
                  key={city}
                  className="rounded-lg border border-border/60 bg-background/35 px-2 py-1 text-xs text-muted-foreground"
                >
                  {city}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export function WorldCupFeatureMatch({ fixture }: { fixture?: WorldCupFixture }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()

  if (!fixture) {
    return (
      <section className="stat-card rounded-xl p-4">
        <h2 className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcMatchCenter')}</h2>
        <p className="mt-3 rounded-md border border-dashed border-border/70 p-6 text-sm text-muted-foreground">{t('wcNoFeatured')}</p>
      </section>
    )
  }

  const isLive = fixture.status === 'LIVE'
  const isFinished = fixture.status === 'FINISHED'

  return (
    <section className="stat-card app-grid-lines flex h-full flex-col rounded-xl p-4">
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-hidden
            className={cn('size-2 rounded-full', isLive ? 'bg-success shadow-[0_0_14px_hsl(var(--success)/0.6)]' : 'bg-info')}
          />
          <h2 className="text-2xs uppercase tracking-eyebrow text-muted-foreground">
            {isLive ? t('wcLiveNow') : isFinished ? t('wcLatestResult') : t('wcUpNext')}
          </h2>
        </div>
        <Badge variant={isLive ? 'soft' : 'outline'} className={isLive ? 'bg-success/15 text-success-fg' : undefined}>
          {wc.badge(fixture)}
        </Badge>
      </div>
      <p className="relative mt-1 truncate text-sm font-medium text-muted-foreground">{wc.round(fixture)}</p>

      <div className="relative mt-4 grid flex-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <FeaturedTeam team={fixture.homeTeam} align="left" />
        <div className="rounded-lg border border-border/60 bg-background/40 px-5 py-3 text-center">
          <p className="font-mono text-4xl font-bold tabular-nums">
            {fixture.homeScore ?? '–'}:{fixture.awayScore ?? '–'}
          </p>
          {wc.decision(fixture) ? <p className="mt-1 text-xs font-medium text-muted-foreground">{wc.decision(fixture)}</p> : null}
        </div>
        <FeaturedTeam team={fixture.awayTeam} align="right" />
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-sm">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span>{formatDateTime(fixture.utcDate)}</span>
          {fixture.venue ? <span>{fixture.venue}</span> : null}
        </div>
        <Link to={matchPath(fixture)} className="inline-flex min-h-10 items-center gap-2 font-medium text-primary">
          {isLive ? t('wcFollowLive') : t('wcOpenMatch')}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

function FeaturedTeam({ align, team }: { align: 'left' | 'right'; team: WorldCupTeam }) {
  const wc = useWorldCupLabels()
  return (
    <div className={cn('flex items-center gap-3', align === 'right' && 'justify-end text-right md:flex-row-reverse')}>
      <TeamFlag team={team} className="h-10 w-14" />
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{wc.team(team)}</p>
        {team.group ? <p className="text-xs text-muted-foreground">{wc.group(team.group)}</p> : null}
      </div>
    </div>
  )
}

const formKey: Record<'W' | 'D' | 'L', MessageKey> = { W: 'winsShort', D: 'drawsShort', L: 'lossesShort' }

export function WorldCupTeamSpotlight({ standing, team }: { standing?: WorldCupGroupStanding; team?: WorldCupTeam }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const spotlightTeam = standing?.team ?? team

  if (!spotlightTeam) {
    return (
      <section className="stat-card flex h-full flex-col rounded-xl p-4">
        <h2 className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcTeamSpotlight')}</h2>
        <p className="mt-3 flex flex-1 items-center rounded-md border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
          {t('wcSpotlightEmpty')}
        </p>
      </section>
    )
  }

  const stats = standing
    ? [
        { label: t('wcGroupRank'), value: `#${standing.rank}` },
        { label: t('points'), value: `${standing.points}` },
        { label: t('matchesPlayed'), value: `${standing.played}` },
        { label: t('goalDifference'), value: standing.goalDifference > 0 ? `+${standing.goalDifference}` : `${standing.goalDifference}` },
      ]
    : []

  return (
    <section className="stat-card flex h-full flex-col rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcTeamSpotlight')}</h2>
        <Badge variant="outline" className="border-warning/30 text-warning-fg">
          {wc.group(spotlightTeam.group)}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <TeamFlag team={spotlightTeam} className="h-12 w-16 shadow-fg-2" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{wc.team(spotlightTeam)}</h3>
          <p className="truncate font-mono text-xs text-muted-foreground">{spotlightTeam.code}</p>
        </div>
      </div>
      {stats.length ? (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="surface-soft flex flex-col-reverse rounded-md p-2.5 text-center">
              <dt className="truncate text-2xs uppercase tracking-eyebrow text-muted-foreground">{stat.label}</dt>
              <dd className="mb-0.5 font-mono text-lg font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 flex-1 rounded-md border border-dashed border-border/70 p-3 text-xs text-muted-foreground">{t('wcSpotlightNoStats')}</p>
      )}
      {standing?.form?.length ? (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('formShort')}</span>
          {standing.form.map((result, index) => (
            <span
              key={`${result}-${index}`}
              className={cn(
                'flex size-5 items-center justify-center rounded-md text-2xs font-bold',
                result === 'W' && 'bg-success/15 text-success-fg',
                result === 'D' && 'bg-warning/15 text-warning-fg',
                result === 'L' && 'bg-danger/15 text-danger-fg',
              )}
            >
              {t(formKey[result])}
            </span>
          ))}
        </div>
      ) : null}
      <Link
        to={`/world-cup-2026/team/${spotlightTeam.id}`}
        className="mt-auto inline-flex min-h-10 items-center gap-2 pt-3 text-sm font-medium text-primary"
      >
        {t('wcOpenTeamProfile')}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </section>
  )
}
