import { useState } from 'react'

import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  Goal,
  MapPin,
  Radio,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { worldCupNav } from '@/app/navigation'
import { AssetImage } from '@/components/shared/AssetImage'
import { DataSourceBadge, type DataFreshness } from '@/components/shared/DataSourceBadge'
import { ErrorState } from '@/components/shared/StatusStates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { type MessageKey, useLocale } from '@/contexts/LocaleContext'
import { countryName } from '@/lib/countries'
import { POSITION_ORDER, positionBucket, positionGroupKey, type PositionCode } from '@/lib/positions'
import { cn, formatDate, formatDateTime } from '@/lib/utils'
import type {
  DataQualityMeta,
  WorldCupBracketRound,
  WorldCupFilterState,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupScore,
  WorldCupSquadPlayer,
  WorldCupTeam,
} from '@/services/worldCup/types'
import { MatchStatePulse, SquadPositionChart } from './charts'
import { useWorldCupLabels } from './labels'
import { defaultWorldCupFilters, uniqueOptions, winnerSide } from './utils'

const matchPath = (fixture: { id: string }) => `/world-cup-2026/match/${fixture.id}`

const canadaHostCities = new Set(['Toronto', 'Vancouver'])
const mexicoHostCities = new Set(['Guadalajara', 'Mexico City', 'Monterrey'])

/** English host country of a 2026 host city (resolved to the UI language at render). */
function hostCountryOf(city: string) {
  if (canadaHostCities.has(city)) return 'Canada'
  if (mexicoHostCities.has(city)) return 'Mexico'
  return 'United States'
}

function escapeSvg(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Neutral rounded "flag" chip used while a real flag image loads or when the
// provider has no crest yet. Keeps the country code visible instead of a broken
// image.
function flagFallback(code: string) {
  const safe = escapeSvg(code || '?')
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="32" rx="5" fill="#1f2933"/><rect x="1" y="1" width="46" height="30" rx="4.5" fill="none" stroke="#ffffff" stroke-opacity="0.12"/><text x="24" y="21" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="800" fill="#e5e7eb">${safe}</text></svg>`,
  )}`
}

/** Decorative: the team name is always rendered next to it. */
export function TeamFlag({ team, className }: { team: WorldCupTeam; className?: string }) {
  return (
    <AssetImage
      src={team.placeholder ? undefined : team.flagUrl}
      fallbackSrc={flagFallback(team.code)}
      alt=""
      loading="lazy"
      className={cn('shrink-0 rounded-md object-cover', className)}
    />
  )
}

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

export function WorldCupShell({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 pb-6">{children}</div>
}

function freshnessFromQuality(quality: DataQualityMeta): DataFreshness {
  return quality.isLive ? 'live' : 'official'
}

export function WorldCupQualityBadge({ quality }: { quality: DataQualityMeta }) {
  return <DataSourceBadge freshness={freshnessFromQuality(quality)} />
}

export function WorldCupDataStatus({ quality }: { quality: DataQualityMeta }) {
  const { t } = useLocale()
  return (
    <div className="surface-soft rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcDataStatus')}</p>
          <h2 className="mt-1 text-sm font-semibold">{quality.isLive ? t('wcFeedLive') : t('wcFeedOfficial')}</h2>
        </div>
        <WorldCupQualityBadge quality={quality} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t('wcUpdatedAt', { time: formatDateTime(quality.lastUpdated) })}</p>
    </div>
  )
}

export function WorldCupPageTitle({
  description,
  icon,
  quality,
  title,
}: {
  description: string
  icon: React.ReactNode
  quality?: DataQualityMeta
  title: string
}) {
  const { t } = useLocale()
  return (
    <section className="stat-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-warning/12 text-warning-fg">{icon}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {quality ? <WorldCupQualityBadge quality={quality} /> : null}
        <Link to="/world-cup-2026" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary">
          {t('wcHubLink')}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

export function WorldCupSectionNav() {
  const { t } = useLocale()
  return (
    <div className="sticky top-header-offset z-sticky">
      <nav
        className="flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-background/70 p-1.5 backdrop-blur-xl sm:gap-2 sm:pr-8"
        aria-label={t('wcSections')}
      >
        {worldCupNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-10 min-w-max items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-foreground/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3.5',
                isActive &&
                  'bg-amber-300 text-amber-950 shadow-fg-2 hover:bg-amber-300 hover:text-amber-950',
              )
            }
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="pointer-events-none absolute inset-y-1.5 right-0 hidden w-10 rounded-r-xl bg-gradient-to-l from-background/90 to-transparent sm:block" />
    </div>
  )
}

export function WorldCupLoading() {
  return (
    <WorldCupShell>
      <div aria-busy="true" className="contents">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </WorldCupShell>
  )
}

export function WorldCupError({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale()
  return (
    <WorldCupShell>
      <ErrorState title={t('wcUnavailableTitle')} description={t('wcUnavailableBody')} onRetry={onRetry} />
    </WorldCupShell>
  )
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

function SignalCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="surface-soft flex min-h-16 items-center justify-between gap-3 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground/10', tone)}>{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn('truncate text-right font-mono text-base font-bold tabular-nums', tone)}>{value}</span>
    </div>
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

/** Next matches; once the tournament is over (archive) the latest results instead. */
export function WorldCupUpcomingCard({ fixtures, mode = 'upcoming' }: { fixtures: WorldCupFixture[]; mode?: 'upcoming' | 'recent' }) {
  const { t } = useLocale()
  return (
    <section className="stat-card flex h-full flex-col rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-eyebrow text-muted-foreground">{mode === 'recent' ? t('wcArchive') : t('wcSchedule')}</p>
          <h2 className="text-base font-semibold tracking-tight">{mode === 'recent' ? t('wcLatestResults') : t('wcUpcomingMatches')}</h2>
        </div>
        <Link to="/world-cup-2026/matches" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary">
          {t('wcViewAll')}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {fixtures.length ? (
          fixtures.slice(0, 4).map((fixture) => <WorldCupMatchRow key={fixture.id} fixture={fixture} />)
        ) : (
          <p className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">{t('wcNoUpcoming')}</p>
        )}
      </div>
    </section>
  )
}

function WorldCupMatchRow({ fixture }: { fixture: WorldCupFixture }) {
  const wc = useWorldCupLabels()
  const isLive = fixture.status === 'LIVE'
  return (
    <Link to={matchPath(fixture)} className="surface-soft flex items-center gap-3 rounded-md p-2.5 transition hover:bg-background/60">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <TeamRowLine team={fixture.homeTeam} score={fixture.homeScore} won={winnerSide(fixture) === 'home'} />
        <TeamRowLine team={fixture.awayTeam} score={fixture.awayScore} won={winnerSide(fixture) === 'away'} />
      </div>
      <div className="shrink-0 text-right">
        <Badge variant={isLive ? 'soft' : 'outline'} className={cn('text-2xs', isLive && 'bg-success/15 text-success-fg')}>
          {wc.badge(fixture)}
        </Badge>
        <p className="mt-1 text-2xs text-muted-foreground">{formatDate(fixture.utcDate)}</p>
      </div>
    </Link>
  )
}

function TeamRowLine({ team, score, won = false }: { team: WorldCupTeam; score?: number; won?: boolean }) {
  const wc = useWorldCupLabels()
  return (
    <div className="flex items-center gap-2">
      <TeamFlag team={team} className="h-4 w-6" />
      <span className={cn('min-w-0 flex-1 truncate text-sm', won ? 'font-semibold' : 'font-medium')}>{wc.team(team)}</span>
      <span className="font-mono text-sm font-bold tabular-nums">{score ?? '–'}</span>
    </div>
  )
}

export function WorldCupMatchCard({ fixture, compact = false }: { fixture: WorldCupFixture; compact?: boolean }) {
  const wc = useWorldCupLabels()
  const isLive = fixture.status === 'LIVE'

  return (
    <Link
      to={matchPath(fixture)}
      className="interactive-card surface-soft block rounded-lg p-3 transition hover:border-border/70 hover:bg-background/60"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge variant={isLive ? 'soft' : 'outline'} className={isLive ? 'bg-success/15 text-success-fg' : undefined}>
            {wc.badge(fixture)}
          </Badge>
          <span className="truncate text-2xs uppercase tracking-eyebrow text-muted-foreground">{wc.round(fixture)}</span>
        </div>
        {!compact ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
      </div>
      <div className="mt-3 grid gap-2">
        <TeamRowLine team={fixture.homeTeam} score={fixture.homeScore} won={winnerSide(fixture) === 'home'} />
        <TeamRowLine team={fixture.awayTeam} score={fixture.awayScore} won={winnerSide(fixture) === 'away'} />
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">
        {formatDateTime(fixture.utcDate)}
      </p>
    </Link>
  )
}

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

/** Goals, plus the shoot-out tally in small type when there was one ("1 ⁽³⁾"). */
export function PenaltyScore({ score, penalties, className }: { score?: number; penalties?: number; className?: string }) {
  return (
    <span className={cn('font-mono font-bold tabular-nums', className)}>
      {score ?? '–'}
      {penalties !== undefined ? <span className="ml-0.5 align-super text-2xs font-medium text-muted-foreground">({penalties})</span> : null}
    </span>
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

export function WorldCupTeamCard({ team }: { team: WorldCupTeam }) {
  const wc = useWorldCupLabels()
  return (
    <Link to={`/world-cup-2026/team/${team.id}`} className="interactive-card stat-card rounded-lg p-3 hover:bg-background/60">
      <div className="flex items-center gap-3">
        <TeamFlag team={team} className="h-9 w-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{wc.team(team)}</p>
          <p className="text-xs text-muted-foreground">
            {wc.group(team.group)} · <span className="font-mono">{team.code}</span>
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  )
}

export function WorldCupTeamFilters({
  onSearchChange,
  search,
}: {
  onSearchChange: (search: string) => void
  search: string
}) {
  const { t } = useLocale()
  return (
    <div className="stat-card rounded-xl p-3">
      <label className="flex min-h-11 items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm focus-within:ring-2 focus-within:ring-ring">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('wcSearchTeams')}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('wcSearchTeams')}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </label>
    </div>
  )
}

export function WorldCupTeamGroupRail({
  activeGroup,
  onSelectGroup,
  teams,
}: {
  activeGroup: string
  onSelectGroup: (group: string) => void
  teams: WorldCupTeam[]
}) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  const grouped = teams.reduce<Record<string, number>>((acc, team) => {
    if (team.group) acc[team.group] = (acc[team.group] ?? 0) + 1
    return acc
  }, {})
  const groups = uniqueOptions(Object.keys(grouped))
  const chip = (active: boolean) =>
    cn(
      'min-h-11 min-w-max rounded-md border border-border/50 px-3 py-1.5 text-left text-xs transition hover:bg-foreground/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active && 'border-primary/60 bg-primary text-primary-foreground hover:bg-primary',
    )

  return (
    <div className="flex gap-2 overflow-x-auto rounded-xl border border-border/50 bg-background/30 p-2" role="group" aria-label={t('wcGroup')}>
      <button type="button" aria-pressed={activeGroup === 'all'} onClick={() => onSelectGroup('all')} className={chip(activeGroup === 'all')}>
        <span className="block font-semibold">{t('allOption')}</span>
        <span className="font-mono opacity-75">{teams.length}</span>
      </button>
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          aria-pressed={activeGroup === group}
          onClick={() => onSelectGroup(group)}
          className={chip(activeGroup === group)}
        >
          <span className="block font-semibold">{wc.group(group)}</span>
          <span className="font-mono opacity-75">{grouped[group]}</span>
        </button>
      ))}
    </div>
  )
}

export function WorldCupTeamProfile({ team, playersCount }: { playersCount: number; team: WorldCupTeam }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  return (
    <section className="stat-card app-grid-lines rounded-xl p-5">
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TeamFlag team={team} className="h-16 w-24 shadow-fg-2" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">{wc.team(team)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{team.code}</span> · {wc.group(team.group)}
            </p>
          </div>
        </div>
        <dl className="grid min-w-[220px] gap-2 text-sm">
          <ProfileLine label={t('wcCoach')} value={team.coach ?? t('notAnnounced')} />
          <ProfileLine label={t('squad')} value={t('playersCount', { count: playersCount })} />
          <ProfileLine label={t('statusLabel')} value={team.placeholder ? t('wcQualificationPending') : t('wcConfirmed')} />
        </dl>
      </div>
    </section>
  )
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft flex items-center justify-between gap-3 rounded-md px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

const STATUS_TABS: Array<{ value: WorldCupFilterState['status']; key: MessageKey }> = [
  { value: 'all', key: 'allOption' },
  { value: 'live', key: 'wcStateLive' },
  { value: 'scheduled', key: 'wcStateUpcoming' },
  { value: 'finished', key: 'wcStateFinished' },
]

export function WorldCupMatchFilters({
  filters,
  fixtures,
  onChange,
}: {
  filters: WorldCupFilterState
  fixtures: WorldCupFixture[]
  onChange: (filters: WorldCupFilterState) => void
}) {
  const { t, locale } = useLocale()
  const wc = useWorldCupLabels()
  const groups = uniqueOptions(fixtures.map((fixture) => fixture.group))
  const stageOrder = ['group', 'round-of-32', 'round-of-16', 'quarter-final', 'semi-final', 'third-place', 'final', 'unknown'] as const
  const stages = stageOrder.filter((stage) => fixtures.some((fixture) => fixture.stage === stage))
  const teams = new Map<string, string>()
  for (const fixture of fixtures) {
    for (const team of [fixture.homeTeam, fixture.awayTeam]) {
      if (!team.placeholder) teams.set(team.id, wc.team(team))
    }
  }
  const teamOptions = [...teams.entries()].sort((left, right) => left[1].localeCompare(right[1], locale))
  const activeFilterCount = [
    filters.search,
    filters.status !== 'all',
    filters.group !== 'all',
    filters.stage !== 'all',
    filters.teamId !== 'all',
  ].filter(Boolean).length
  const all = t('allOption')

  return (
    <div className="stat-card rounded-xl p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-foreground/10 text-warning-fg" aria-hidden>
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t('wcMatchFilters')}</h2>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {activeFilterCount ? t('wcFiltersActive', { count: activeFilterCount }) : t('wcAllMatchesVisible')}
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-md border border-border/60 bg-background/35 p-1" role="group" aria-label={t('statusLabel')}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filters.status === tab.value}
              onClick={() => onChange({ ...filters, status: tab.value })}
              className={cn(
                'min-h-9 rounded-lg px-3 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                filters.status === tab.value && 'bg-primary text-primary-foreground hover:text-primary-foreground',
              )}
            >
              {t(tab.key)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.2fr)_repeat(3,minmax(130px,1fr))]">
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-sm focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{t('wcSearchMatches')}</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder={t('wcSearchMatches')}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
          />
        </label>
        <SelectFilter
          label={t('wcGroup')}
          value={filters.group}
          options={[['all', all], ...groups.map((group): [string, string] => [group, wc.group(group)])]}
          onChange={(group) => onChange({ ...filters, group })}
        />
        <SelectFilter
          label={t('wcRound')}
          value={filters.stage}
          options={[['all', all], ...stages.map((stage): [string, string] => [stage, wc.stage(stage)])]}
          onChange={(stage) => onChange({ ...filters, stage: stage as WorldCupFilterState['stage'] })}
        />
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(160px,1fr)_auto]">
        <SelectFilter
          label={t('team')}
          value={filters.teamId}
          options={[['all', all], ...teamOptions]}
          onChange={(teamId) => onChange({ ...filters, teamId })}
        />
        <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={() => onChange(defaultWorldCupFilters)}>
          <RotateCcw className="size-4" aria-hidden />
          {t('reset')}
        </Button>
      </div>
    </div>
  )
}

export function WorldCupEmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel?: string
  description: string
  onAction?: () => void
  title: string
}) {
  return (
    <div role="status" className="rounded-xl border border-dashed border-border/70 bg-background/25 p-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-foreground/10 text-warning-fg" aria-hidden>
        <Search className="size-5" />
      </div>
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

function SelectFilter({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<[value: string, label: string]>
  value: string
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none sm:text-sm"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TeamScore({ align, team }: { align: 'left' | 'right'; team: WorldCupTeam }) {
  const wc = useWorldCupLabels()
  return (
    <div className={cn('flex items-center gap-3', align === 'right' && 'md:flex-row-reverse md:text-right')}>
      <TeamFlag team={team} className="h-12 w-16" />
      <p className="min-w-0 truncate text-lg font-semibold">{wc.team(team)}</p>
    </div>
  )
}

export function WorldCupScoreBreakdown({ fixture }: { fixture: WorldCupFixture }) {
  const { t } = useLocale()
  const scores: Array<{ label: string; score?: WorldCupScore }> = [
    { label: t('wcHalfTime'), score: fixture.scoreBreakdown?.halftime },
    { label: t('wcRegularTime'), score: fixture.scoreBreakdown?.regular },
    { label: t('wcExtraTime'), score: fixture.scoreBreakdown?.extratime },
    { label: t('wcPenalties'), score: fixture.scoreBreakdown?.penalty },
  ].filter((item) => item.score?.home !== undefined || item.score?.away !== undefined)

  if (!scores.length) return null

  return (
    <section className="stat-card rounded-xl p-4">
      <h2 className="mb-3 text-base font-semibold">{t('wcScoreBreakdown')}</h2>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scores.map((item) => (
          <div key={item.label} className="surface-soft flex flex-col-reverse rounded-md p-3 text-center">
            <dt className="truncate text-2xs uppercase tracking-eyebrow text-muted-foreground">{item.label}</dt>
            <dd className="mb-1 font-mono text-xl font-bold">{item.score?.home ?? '–'}:{item.score?.away ?? '–'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function WorldCupSquadByPosition({ players }: { players: WorldCupSquadPlayer[] }) {
  const { t } = useLocale()
  const grouped = new Map<PositionCode | 'other', WorldCupSquadPlayer[]>()
  for (const player of players) {
    const bucket = positionBucket(player.position) ?? 'other'
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), player])
  }
  const sections = [...POSITION_ORDER, 'other' as const].flatMap((bucket) => {
    const members = grouped.get(bucket)
    return members?.length ? [{ bucket, members }] : []
  })

  return (
    <section className="stat-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{t('wcSquadByPosition')}</h2>
        <Badge variant="outline">{t('playersCount', { count: players.length })}</Badge>
      </div>
      {players.length ? (
        <>
          <div className="surface-soft mb-3 rounded-md p-3">
            <p className="mb-1 text-2xs uppercase tracking-eyebrow text-muted-foreground">{t('wcComposition')}</p>
            <SquadPositionChart players={players} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {sections.map(({ bucket, members }) => (
              <div key={bucket} className="surface-soft rounded-md p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{bucket === 'other' ? t('posUnknown') : t(positionGroupKey[bucket])}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{members.length}</span>
                </div>
                <ul className="grid gap-2">
                  {members.map((player) => (
                    <li key={player.id} className="flex items-center gap-3 rounded-lg px-1 py-1">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/10 font-mono text-xs">
                        {player.number ?? '–'}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</span>
                      {player.age ? <span className="shrink-0 text-xs text-muted-foreground">{t('wcAgeShort', { age: player.age })}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">{t('wcSquadNotPublished')}</p>
      )}
    </section>
  )
}

export function MatchMetaGrid({ fixture }: { fixture: WorldCupFixture }) {
  const { t } = useLocale()
  const wc = useWorldCupLabels()
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SignalCard icon={<CalendarDays className="size-4" />} label={t('wcKickoff')} value={formatDateTime(fixture.utcDate)} tone="text-info-fg" />
      <SignalCard icon={<MapPin className="size-4" />} label={t('wcVenue')} value={fixture.venue ?? t('notAnnounced')} tone="text-warning-fg" />
      <SignalCard icon={<Shield className="size-4" />} label={t('wcReferee')} value={fixture.referee ?? t('notAnnounced')} tone="text-violet-700 dark:text-violet-300" />
      <SignalCard icon={<Activity className="size-4" />} label={t('statusLabel')} value={wc.status(fixture.status)} tone="text-success-fg" />
    </div>
  )
}
