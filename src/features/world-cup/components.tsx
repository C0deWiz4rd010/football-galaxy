import {
  Activity,
  AlertCircle,
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

import { AssetImage } from '@/components/shared/AssetImage'
import { DataSourceBadge, type DataFreshness } from '@/components/shared/DataSourceBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import { defaultWorldCupFilters, uniqueOptions, uniqueTeamOptions } from './utils'

const worldCupNavItems = [
  { label: 'Overview', to: '/world-cup-2026' },
  { label: 'Matches', to: '/world-cup-2026/matches' },
  { label: 'Groups', to: '/world-cup-2026/groups' },
  { label: 'Bracket', to: '/world-cup-2026/bracket' },
  { label: 'Teams', to: '/world-cup-2026/teams' },
]

const canadaHostCities = new Set(['Toronto', 'Vancouver'])
const mexicoHostCities = new Set(['Guadalajara', 'Mexico City', 'Monterrey'])

function getHostCountry(city: string) {
  if (canadaHostCities.has(city)) return 'Canada'
  if (mexicoHostCities.has(city)) return 'Mexico'
  return 'United States'
}

function escapeSvg(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Neutral rounded "flag" chip used while a real flag image loads or when the
// provider has no crest yet. Keeps the country code visible instead of a broken
// image. Real flags come straight from API-Football team logos.
function flagFallback(code: string) {
  const safe = escapeSvg(code || 'TBD')
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="32" rx="5" fill="#1f2933"/><rect x="1" y="1" width="46" height="30" rx="4.5" fill="none" stroke="#ffffff" stroke-opacity="0.12"/><text x="24" y="21" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="800" fill="#e5e7eb">${safe}</text></svg>`,
  )}`
}

export function TeamFlag({ team, className }: { team: WorldCupTeam; className?: string }) {
  return (
    <AssetImage
      src={team.placeholder ? undefined : team.flagUrl}
      fallbackSrc={flagFallback(team.code)}
      alt={team.placeholder ? 'Qualifier pending' : team.name}
      loading="lazy"
      className={cn('shrink-0 rounded-md object-cover', className)}
    />
  )
}

function tournamentPhase(startsAt: string, endsAt: string, liveCount: number) {
  const now = Date.now()
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  const dayMs = 86_400_000

  if (Number.isFinite(start) && now < start) {
    const days = Math.max(0, Math.ceil((start - now) / dayMs))
    return { label: days <= 1 ? 'Kicks off tomorrow' : `Kicks off in ${days} days`, active: false }
  }
  if (Number.isFinite(end) && now > end) {
    return { label: 'Tournament complete', active: false }
  }
  if (Number.isFinite(start)) {
    const day = Math.floor((now - start) / dayMs) + 1
    return { label: liveCount > 0 ? `Live now · Day ${day}` : `Underway · Day ${day}`, active: true }
  }
  return { label: liveCount > 0 ? 'Live now' : 'Scheduled', active: liveCount > 0 }
}

export function WorldCupShell({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 pb-6">{children}</div>
}

function freshnessFromQuality(quality: DataQualityMeta): DataFreshness {
  if (quality.isLive) return 'live'
  if (quality.provider === 'snapshot' || quality.confidence === 'snapshot') return 'snapshot'
  return 'official'
}

function qualityLabel(quality: DataQualityMeta): string {
  if (quality.isLive) return 'Live'
  if (quality.provider === 'snapshot' || quality.confidence === 'snapshot') return 'Offline snapshot'
  return 'Official'
}

export function WorldCupQualityBadge({ quality }: { quality: DataQualityMeta }) {
  return (
    <DataSourceBadge
      freshness={freshnessFromQuality(quality)}
      label={qualityLabel(quality)}
    />
  )
}

export function WorldCupDataStatus({ quality }: { quality: DataQualityMeta }) {
  const isSnapshot = quality.provider === 'snapshot' || quality.confidence === 'snapshot'
  return (
    <div className="surface-soft rounded-[1rem] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Data status</p>
          <h2 className="mt-1 text-sm font-semibold">
            {isSnapshot ? 'Offline snapshot' : quality.isLive ? 'Live feed' : 'Official feed'}
          </h2>
        </div>
        <WorldCupQualityBadge quality={quality} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Updated {formatDateTime(quality.lastUpdated)}</p>
      {quality.note ? <p className="mt-1 text-xs text-amber-100/80">{quality.note}</p> : null}
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
  return (
    <section className="stat-card flex flex-wrap items-center justify-between gap-4 rounded-fg-xl p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-300/12 text-amber-200">{icon}</div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {quality ? <WorldCupQualityBadge quality={quality} /> : null}
        <Link to="/world-cup-2026" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          World Cup hub
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export function WorldCupSectionNav() {
  return (
    <div className="relative">
      <nav
        className="flex gap-1 overflow-x-auto rounded-fg-xl border border-border/50 bg-background/35 p-1.5 backdrop-blur-xl sm:gap-2 sm:pr-8"
        aria-label="World Cup sections"
      >
        {worldCupNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/world-cup-2026'}
            className={({ isActive }) =>
              cn(
                'min-w-max rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-white/8 hover:text-foreground sm:px-3.5 sm:text-sm',
                isActive &&
                  'bg-amber-300 text-amber-950 shadow-fg-2 hover:bg-amber-300 hover:text-amber-950',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="pointer-events-none absolute inset-y-1.5 right-0 hidden w-10 rounded-r-fg-xl bg-gradient-to-l from-background/90 to-transparent sm:block" />
    </div>
  )
}

export function WorldCupLoading() {
  return (
    <WorldCupShell>
      <Skeleton className="h-24 rounded-fg-xl" />
      <Skeleton className="h-12 rounded-fg-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-fg-xl" />
        <Skeleton className="h-72 rounded-fg-xl" />
        <Skeleton className="h-72 rounded-fg-xl" />
      </div>
      <Skeleton className="h-64 rounded-fg-xl" />
    </WorldCupShell>
  )
}

export function WorldCupError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="stat-card flex flex-col items-start gap-3 rounded-fg-lg p-fg-6 shadow-fg-2 sm:flex-row">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="flex-1">
        <h2 className="text-base font-semibold tracking-tight">World Cup data is unavailable</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Live fixtures and match details need the data proxy running (<span className="font-mono">npm run dev:all</span>).
          Tournament structure stays available offline; retry once the live feed is reachable.
        </p>
      </div>
      <Button onClick={onRetry}>Retry</Button>
    </div>
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
  return (
    <section className="stat-card app-grid-lines overflow-hidden rounded-fg-xl p-4 shadow-fg-2 sm:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-amber-300/12 to-transparent" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.1rem] border border-amber-300/30 bg-amber-300/12 text-amber-200 shadow-[0_0_42px_rgba(251,191,36,0.14)]">
            <Trophy className="size-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">World Cup 2026</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-amber-200" />
                {formatDate(startsAt)} – {formatDate(endsAt)}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-sky-200" />
                {hostCountries.join(', ')}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {liveCount > 0 ? (
            <Badge variant="soft" className="gap-1.5 border-emerald-400/50 bg-emerald-400/12 text-emerald-100">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
              </span>
              {liveCount} live {liveCount === 1 ? 'match' : 'matches'}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5">
              <span className="size-2 rounded-full bg-sky-300" />
              No live matches
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5">
            <MapPin className="size-3.5" />
            {hostCitiesCount} host cities
          </Badge>
          <Badge variant="outline" className="hidden gap-1.5 lg:inline-flex">
            <Clock3 className="size-3.5" />
            Updated {formatDateTime(quality.lastUpdated)}
          </Badge>
        </div>
      </div>
    </section>
  )
}

function SignalCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="surface-soft flex min-h-16 items-center justify-between gap-3 rounded-[1rem] p-3">
      <div className="flex items-center gap-3">
        <div className={cn('flex size-9 items-center justify-center rounded-xl bg-white/10', tone)}>{icon}</div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn('font-mono text-xl font-black tabular-nums', tone)}>{value}</span>
    </div>
  )
}

export function WorldCupTournamentStatus({
  endsAt,
  hostCitiesCount,
  liveCount,
  matchesCount,
  quality,
  startsAt,
  teamsCount,
}: {
  endsAt: string
  hostCitiesCount: number
  liveCount: number
  matchesCount: number
  quality: DataQualityMeta
  startsAt: string
  teamsCount: number
}) {
  const phase = tournamentPhase(startsAt, endsAt, liveCount)
  const items = [
    { icon: <Users className="size-4" />, label: 'Teams', value: `${teamsCount}`, helper: 'expanded 2026 field' },
    { icon: <Goal className="size-4" />, label: 'Matches', value: `${matchesCount}`, helper: 'across the tournament' },
    { icon: <MapPin className="size-4" />, label: 'Host cities', value: `${hostCitiesCount}`, helper: 'USA · Canada · Mexico' },
    { icon: <Radio className="size-4" />, label: 'Live now', value: `${liveCount}`, helper: phase.label },
  ]

  return (
    <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tournament status</p>
          <h2 className="text-base font-semibold tracking-tight">Operational snapshot</h2>
        </div>
        <Badge
          variant={phase.active ? 'soft' : 'outline'}
          className={cn('gap-1.5', phase.active && 'border-emerald-400/50 bg-emerald-400/12 text-emerald-100')}
        >
          <span className={cn('size-1.5 rounded-full', phase.active ? 'bg-emerald-300' : 'bg-sky-300')} />
          {phase.label}
        </Badge>
      </div>
      <div className="grid flex-1 gap-2">
        {items.map((item) => (
          <div key={item.label} className="surface-soft flex items-center gap-3 rounded-xl p-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-amber-200">{item.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="font-mono text-sm font-black text-foreground">{item.value}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{item.helper}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 border-t border-white/5 pt-3 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-amber-200" />
        Powered by {quality.provider === 'api-football' ? 'API-Football' : quality.provider}
      </div>
    </section>
  )
}

export function WorldCupHostCityPanel({ cities }: { cities: string[] }) {
  const groupedCities = cities.reduce<Record<string, string[]>>((acc, city) => {
    const country = getHostCountry(city)
    acc[country] = [...(acc[country] ?? []), city]
    return acc
  }, {})

  return (
    <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Host cities</p>
          <h2 className="text-base font-semibold tracking-tight">Three-country map</h2>
        </div>
        <Badge variant="outline">{cities.length}</Badge>
      </div>
      <div className="grid flex-1 gap-3">
        {Object.entries(groupedCities).map(([country, countryCities]) => (
          <div key={country} className="surface-soft rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-amber-200">
                  <MapPin className="size-4" />
                </span>
                <p className="text-sm font-semibold">{country}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{countryCities.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {countryCities.map((city) => (
                <span
                  key={city}
                  className="rounded-lg border border-white/10 bg-background/35 px-2 py-1 text-xs text-muted-foreground"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function WorldCupFeatureMatch({ fixture }: { fixture?: WorldCupFixture }) {
  if (!fixture) {
    return (
      <section className="stat-card rounded-fg-xl p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Match center</p>
        <div className="mt-3 rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
          No live or upcoming match is available right now. Matches appear here as soon as the provider publishes them.
        </div>
      </section>
    )
  }

  const isLive = fixture.status === 'LIVE'
  const isFinished = fixture.status === 'FINISHED'

  return (
    <section className="stat-card app-grid-lines flex h-full flex-col rounded-fg-xl p-4">
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'size-2 rounded-full',
              isLive ? 'bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.65)]' : 'bg-sky-300',
            )}
          />
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {isLive ? 'Live now' : isFinished ? 'Latest result' : 'Featured next'}
          </p>
        </div>
        <Badge variant={isLive ? 'soft' : 'outline'} className={isLive ? 'bg-emerald-500/15 text-emerald-100' : undefined}>
          {isLive ? `${fixture.elapsed ?? 0}'` : fixture.status}
        </Badge>
      </div>
      <p className="relative mt-1 truncate text-sm font-medium text-muted-foreground">{fixture.round}</p>

      <div className="relative mt-4 grid flex-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <FeaturedTeam team={fixture.homeTeam} align="left" />
        <div className="rounded-[1.1rem] border border-white/10 bg-background/40 px-5 py-3 text-center">
          <p className="font-mono text-4xl font-black tabular-nums">
            {fixture.homeScore ?? '-'}:{fixture.awayScore ?? '-'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{fixture.city ?? 'Host city pending'}</p>
        </div>
        <FeaturedTeam team={fixture.awayTeam} align="right" />
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 text-sm">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span>{formatDateTime(fixture.utcDate)}</span>
          <span>{fixture.venue ?? 'Venue pending'}</span>
        </div>
        <Link
          to={`/world-cup-2026/match/${fixture.apiFootballId ?? fixture.id}`}
          className="inline-flex items-center gap-2 font-medium text-primary"
        >
          {isLive ? 'View live match center' : 'Open match center'}
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </section>
  )
}

function FeaturedTeam({ align, team }: { align: 'left' | 'right'; team: WorldCupTeam }) {
  return (
    <div className={cn('flex items-center gap-3', align === 'right' && 'justify-end text-right md:flex-row-reverse')}>
      <TeamFlag team={team} className="h-10 w-14" />
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{team.placeholder ? 'Qualifier pending' : team.name}</p>
        <p className="text-xs text-muted-foreground">Group {team.group ?? 'TBD'}</p>
      </div>
    </div>
  )
}

export function WorldCupUpcomingCard({ fixtures }: { fixtures: WorldCupFixture[] }) {
  return (
    <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Schedule scan</p>
          <h2 className="text-base font-semibold tracking-tight">Upcoming matches</h2>
        </div>
        <Link to="/world-cup-2026/matches" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          View all
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {fixtures.length ? (
          fixtures.slice(0, 4).map((fixture) => <WorldCupMatchRow key={fixture.id} fixture={fixture} />)
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            No upcoming matches are scheduled in the live feed yet.
          </p>
        )}
      </div>
    </section>
  )
}

function WorldCupMatchRow({ fixture }: { fixture: WorldCupFixture }) {
  const isLive = fixture.status === 'LIVE'
  return (
    <Link
      to={`/world-cup-2026/match/${fixture.apiFootballId ?? fixture.id}`}
      className="surface-soft flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-background/60"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <TeamRowLine team={fixture.homeTeam} score={fixture.homeScore} />
        <TeamRowLine team={fixture.awayTeam} score={fixture.awayScore} />
      </div>
      <div className="shrink-0 text-right">
        <Badge variant={isLive ? 'soft' : 'outline'} className={cn('text-[10px]', isLive && 'bg-emerald-500/15 text-emerald-100')}>
          {isLive ? `${fixture.elapsed ?? 0}'` : fixture.status === 'SCHEDULED' ? formatDate(fixture.utcDate) : fixture.status}
        </Badge>
        <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(fixture.utcDate).split(', ')[1] ?? ''}</p>
      </div>
    </Link>
  )
}

function TeamRowLine({ team, score }: { team: WorldCupTeam; score?: number }) {
  return (
    <div className="flex items-center gap-2">
      <TeamFlag team={team} className="h-4 w-6" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{team.placeholder ? 'Qualifier pending' : team.name}</span>
      <span className="font-mono text-sm font-bold tabular-nums">{score ?? '-'}</span>
    </div>
  )
}

export function WorldCupMatchCard({ fixture, compact = false }: { fixture: WorldCupFixture; compact?: boolean }) {
  const isLive = fixture.status === 'LIVE'

  return (
    <Link
      to={`/world-cup-2026/match/${fixture.apiFootballId ?? fixture.id}`}
      className="interactive-card surface-soft block rounded-[1rem] p-3 transition hover:border-border/70 hover:bg-background/60"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isLive ? 'soft' : 'outline'} className={isLive ? 'bg-emerald-500/15 text-emerald-100' : undefined}>
            {isLive ? `${fixture.elapsed ?? 0}'` : fixture.status}
          </Badge>
          <span className="truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{fixture.round}</span>
        </div>
        {!compact ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" /> : null}
      </div>
      <div className="mt-3 grid gap-2">
        <TeamRowLine team={fixture.homeTeam} score={fixture.homeScore} />
        <TeamRowLine team={fixture.awayTeam} score={fixture.awayScore} />
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">
        {fixture.city ?? 'Host city pending'} · {formatDateTime(fixture.utcDate)}
      </p>
    </Link>
  )
}

export function WorldCupGroupTable({ group, rows }: { group: string; rows: WorldCupGroupStanding[] }) {
  return (
    <div className="stat-card overflow-hidden rounded-[1rem]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2.5">
        <h2 className="text-sm font-semibold">Group {group}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-sky-300/30 text-sky-100">Top 2</Badge>
          <Badge variant="outline" className="border-amber-300/30 text-amber-100">3rd watch</Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr className="border-b border-white/5">
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-2 py-2 text-right">P</th>
              <th className="px-2 py-2 text-right">GD</th>
              <th className="px-3 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-white/5 last:border-0',
                  row.qualificationHint === 'top-two' && 'bg-sky-400/5',
                  row.qualificationHint === 'best-third-watch' && 'bg-amber-300/5',
                )}
              >
                <td className="px-3 py-2">
                  <Link to={`/world-cup-2026/team/${row.team.id}`} className="flex items-center gap-2 hover:text-primary">
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{row.rank}</span>
                    <TeamFlag team={row.team} className="h-4 w-6" />
                    <span className="truncate">{row.team.placeholder ? 'Qualifier pending' : row.team.name}</span>
                    {row.qualificationHint === 'top-two' ? <span className="size-1.5 rounded-full bg-sky-300" /> : null}
                    {row.qualificationHint === 'best-third-watch' ? <span className="size-1.5 rounded-full bg-amber-300" /> : null}
                  </Link>
                </td>
                <td className="px-2 py-2 text-right font-mono">{row.played}</td>
                <td className="px-2 py-2 text-right font-mono">{row.goalDifference}</td>
                <td className="px-3 py-2 text-right font-mono font-bold">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function WorldCupGroupsPreview({ grouped }: { grouped: Record<string, WorldCupGroupStanding[]> }) {
  const groups = Object.entries(grouped)

  return (
    <section className="stat-card rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Group standings</p>
          <h2 className="text-base font-semibold tracking-tight">All groups at a glance</h2>
        </div>
        <Link to="/world-cup-2026/groups" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          View all groups
          <ChevronRight className="size-4" />
        </Link>
      </div>
      {groups.length ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map(([group, rows]) => (
            <div key={group} className="surface-soft rounded-xl p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Group {group}</p>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pts</span>
              </div>
              <div className="grid gap-1">
                {rows.slice(0, 4).map((row) => (
                  <Link
                    key={row.id}
                    to={`/world-cup-2026/team/${row.team.id}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-white/8"
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        row.qualificationHint === 'top-two'
                          ? 'bg-sky-300'
                          : row.qualificationHint === 'best-third-watch'
                            ? 'bg-amber-300'
                            : 'bg-white/20',
                      )}
                    />
                    <TeamFlag team={row.team} className="h-3.5 w-5" />
                    <span className="min-w-0 flex-1 truncate">{row.team.placeholder ? 'Pending' : row.team.name}</span>
                    <span className="font-mono font-bold">{row.points}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
          Group standings publish once the first group matches kick off. They will appear here automatically.
        </p>
      )}
    </section>
  )
}

export function WorldCupBracketBoard({ rounds }: { rounds: WorldCupBracketRound[] }) {
  if (!rounds.length) {
    return (
      <div className="rounded-fg-xl border border-dashed border-border/60 bg-background/25 p-6 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white/10 text-amber-200">
          <Trophy className="size-5" />
        </div>
        <h2 className="mt-3 text-base font-semibold">The knockout bracket forms after the group stage</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Once the group stage ends, the Round of 32 and every later round will populate here directly from the live feed.
        </p>
      </div>
    )
  }

  const placeholderMatches = rounds.reduce((total, round) => total + round.matches.filter((match) => match.placeholder).length, 0)
  const confirmedMatches = rounds.reduce((total, round) => total + round.matches.filter((match) => !match.placeholder).length, 0)

  return (
    <div className="rounded-fg-xl border border-border/45 bg-background/25 p-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{rounds.length} rounds</Badge>
          <Badge variant="outline" className="border-amber-300/30 text-amber-100">{placeholderMatches} to be decided</Badge>
          <Badge variant="outline" className="border-emerald-300/30 text-emerald-100">{confirmedMatches} confirmed</Badge>
        </div>
        <span>Swipe horizontally on small screens</span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[960px] gap-4 xl:grid-cols-5">
          {rounds.map((round) => (
            <div key={round.id} className="stat-card rounded-fg-xl p-3">
              <h2 className="text-sm font-semibold">{round.label}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {round.matches.map((match) => (
                  <div key={match.id} className="surface-soft rounded-xl p-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{match.label}</p>
                      {match.placeholder ? <Badge variant="outline">TBD</Badge> : null}
                    </div>
                    <div className="mt-2 grid gap-1">
                      <BracketTeamLine team={match.homeTeam} score={match.homeScore} placeholder={match.placeholder} />
                      <BracketTeamLine team={match.awayTeam} score={match.awayScore} placeholder={match.placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BracketTeamLine({ placeholder, score, team }: { placeholder: boolean; score?: number; team?: WorldCupTeam }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/5 px-2 py-1.5">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        {placeholder || !team ? (
          <span className="truncate">Qualified team pending</span>
        ) : (
          <>
            <TeamFlag team={team} className="h-3.5 w-5" />
            <span className="truncate">{team.name}</span>
          </>
        )}
      </span>
      <span className="font-mono font-bold">{score ?? '-'}</span>
    </div>
  )
}

export function WorldCupBracketPreview({ rounds }: { rounds: WorldCupBracketRound[] }) {
  return (
    <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Knockout</p>
          <h2 className="text-base font-semibold tracking-tight">Bracket preview</h2>
        </div>
        <Link to="/world-cup-2026/bracket" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Open
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="flex-1">
        {rounds.length ? (
          <div className="flex flex-col gap-3">
            {rounds.slice(0, 2).map((round) => (
              <div key={round.id} className="surface-soft rounded-xl p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{round.label}</p>
                <div className="grid gap-2">
                  {round.matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="grid gap-1 rounded-lg border border-white/5 p-2 text-xs">
                      <BracketTeamLine team={match.homeTeam} score={match.homeScore} placeholder={match.placeholder} />
                      <BracketTeamLine team={match.awayTeam} score={match.awayScore} placeholder={match.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-5 text-center">
            <Trophy className="size-5 text-amber-200" />
            <p className="mt-2 text-sm font-medium">Bracket forms after the group stage</p>
            <p className="mt-1 text-xs text-muted-foreground">Knockout rounds appear here from the live feed.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export function WorldCupTeamSpotlight({ standing, team }: { standing?: WorldCupGroupStanding; team?: WorldCupTeam }) {
  const spotlightTeam = standing?.team ?? team

  if (!spotlightTeam) {
    return (
      <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Team spotlight</p>
        <div className="mt-3 flex flex-1 items-center rounded-xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
          A featured national team will appear here once the live team list loads.
        </div>
      </section>
    )
  }

  const stats = standing
    ? [
        { label: 'Group rank', value: `#${standing.rank}` },
        { label: 'Points', value: `${standing.points}` },
        { label: 'Played', value: `${standing.played}` },
        { label: 'Goal diff', value: standing.goalDifference > 0 ? `+${standing.goalDifference}` : `${standing.goalDifference}` },
      ]
    : []

  return (
    <section className="stat-card flex h-full flex-col rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Team spotlight</p>
        <Badge variant="outline" className="border-amber-300/30 text-amber-100">
          Group {spotlightTeam.group ?? 'TBD'}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <TeamFlag team={spotlightTeam} className="h-12 w-16 shadow-fg-2" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{spotlightTeam.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{spotlightTeam.country}</p>
        </div>
      </div>
      {stats.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="surface-soft rounded-xl p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 font-mono text-lg font-black">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 flex-1 rounded-xl border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
          Standings stats appear once this team has played a group match.
        </p>
      )}
      {standing?.form?.length ? (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Form</span>
          {standing.form.map((result, index) => (
            <span
              key={`${result}-${index}`}
              className={cn(
                'flex size-5 items-center justify-center rounded-md text-[10px] font-bold',
                result === 'W' && 'bg-emerald-400/15 text-emerald-200',
                result === 'D' && 'bg-amber-400/15 text-amber-200',
                result === 'L' && 'bg-rose-400/15 text-rose-200',
              )}
            >
              {result}
            </span>
          ))}
        </div>
      ) : null}
      <Link
        to={`/world-cup-2026/team/${spotlightTeam.id}`}
        className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-medium text-primary"
      >
        Open team profile
        <ChevronRight className="size-4" />
      </Link>
    </section>
  )
}

export function WorldCupTeamCard({ team }: { team: WorldCupTeam }) {
  return (
    <Link
      key={team.id}
      to={`/world-cup-2026/team/${team.id}`}
      className="interactive-card stat-card rounded-[1rem] p-3 hover:bg-background/60"
    >
      <div className="flex items-center gap-3">
        <TeamFlag team={team} className="h-9 w-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{team.placeholder ? 'Qualifier pending' : team.name}</p>
          <p className="text-xs text-muted-foreground">Group {team.group ?? 'TBD'} · {team.country}</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  )
}

export function WorldCupTeamFilters({
  group,
  onGroupChange,
  onSearchChange,
  search,
  teams,
}: {
  group: string
  onGroupChange: (group: string) => void
  onSearchChange: (search: string) => void
  search: string
  teams: WorldCupTeam[]
}) {
  const groups = uniqueOptions(teams.map((team) => team.group).filter(Boolean))

  return (
    <div className="stat-card rounded-fg-xl p-3">
      <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_220px]">
        <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search country, code, group"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <SelectFilter label="Group" value={group} values={['all', ...groups]} onChange={onGroupChange} />
      </div>
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
  const grouped = teams.reduce<Record<string, number>>((acc, team) => {
    const group = team.group ?? 'TBD'
    acc[group] = (acc[group] ?? 0) + 1
    return acc
  }, {})
  const groups = uniqueOptions(Object.keys(grouped))

  return (
    <div className="flex gap-2 overflow-x-auto rounded-fg-xl border border-border/50 bg-background/30 p-2">
      <button
        type="button"
        onClick={() => onSelectGroup('all')}
        className={cn(
          'min-w-max rounded-xl border border-border/50 px-3 py-2 text-left text-xs transition hover:bg-white/8',
          activeGroup === 'all' && 'border-primary/60 bg-primary text-primary-foreground',
        )}
      >
        <span className="block font-semibold">All</span>
        <span className="font-mono opacity-75">{teams.length}</span>
      </button>
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          onClick={() => onSelectGroup(group)}
          className={cn(
            'min-w-[72px] rounded-xl border border-border/50 px-3 py-2 text-left text-xs transition hover:bg-white/8',
            activeGroup === group && 'border-primary/60 bg-primary text-primary-foreground',
          )}
        >
          <span className="block font-semibold">Group {group}</span>
          <span className="font-mono opacity-75">{grouped[group]}</span>
        </button>
      ))}
    </div>
  )
}

export function WorldCupTeamProfile({ team, playersCount }: { playersCount: number; team: WorldCupTeam }) {
  return (
    <section className="stat-card app-grid-lines rounded-fg-xl p-5">
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <TeamFlag team={team} className="h-16 w-24 shadow-fg-2" />
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight">{team.placeholder ? 'Qualifier pending' : team.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{team.country} · Group {team.group ?? 'TBD'}</p>
          </div>
        </div>
        <div className="grid min-w-[220px] gap-2 text-sm">
          <ProfileLine label="Coach" value={team.coach ?? 'Pending'} />
          <ProfileLine label="Squad" value={`${playersCount} players`} />
          <ProfileLine label="Status" value={team.placeholder ? 'Qualification pending' : 'Confirmed'} />
        </div>
      </div>
    </section>
  )
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft flex items-center justify-between gap-3 rounded-xl px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  )
}

export function WorldCupMatchFilters({
  filters,
  fixtures,
  onChange,
}: {
  filters: WorldCupFilterState
  fixtures: WorldCupFixture[]
  onChange: (filters: WorldCupFilterState) => void
}) {
  const groups = uniqueOptions(fixtures.map((fixture) => fixture.group).filter(Boolean))
  const rounds = uniqueOptions(fixtures.map((fixture) => fixture.round))
  const cities = uniqueOptions(fixtures.map((fixture) => fixture.city).filter(Boolean))
  const teams = uniqueTeamOptions(fixtures)
  const activeFilterCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : '',
    filters.group !== 'all' ? filters.group : '',
    filters.round !== 'all' ? filters.round : '',
    filters.hostCity !== 'all' ? filters.hostCity : '',
    filters.teamId !== 'all' ? filters.teamId : '',
  ].filter(Boolean).length
  const statusTabs: Array<WorldCupFilterState['status']> = ['all', 'live', 'scheduled', 'finished']

  return (
    <div className="stat-card rounded-fg-xl p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-amber-200">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Match filters</h2>
            <p className="text-xs text-muted-foreground">{activeFilterCount ? `${activeFilterCount} active` : 'All matches visible'}</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl border border-border/60 bg-background/35 p-1">
          {statusTabs.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ ...filters, status })}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground transition hover:text-foreground',
                filters.status === status && 'bg-primary text-primary-foreground hover:text-primary-foreground',
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.2fr)_repeat(3,minmax(130px,1fr))]">
        <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search team, round, city"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <SelectFilter label="Group" value={filters.group} values={['all', ...groups]} onChange={(group) => onChange({ ...filters, group })} />
        <SelectFilter label="Round" value={filters.round} values={['all', ...rounds]} onChange={(round) => onChange({ ...filters, round })} />
        <SelectFilter label="City" value={filters.hostCity} values={['all', ...cities]} onChange={(hostCity) => onChange({ ...filters, hostCity })} />
      </div>
      <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(160px,1fr)_auto]">
        <SelectFilter
          label="Team"
          value={filters.teamId}
          values={['all', ...teams.map((team) => team.id)]}
          valueLabels={Object.fromEntries(teams.map((team) => [team.id, team.name]))}
          onChange={(teamId) => onChange({ ...filters, teamId })}
        />
        <Button type="button" variant="outline" className="gap-2" onClick={() => onChange(defaultWorldCupFilters)}>
          <RotateCcw className="size-4" />
          Reset
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
    <div className="rounded-fg-xl border border-dashed border-border/70 bg-background/25 p-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white/10 text-amber-200">
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
  value,
  valueLabels,
  values,
}: {
  label: string
  onChange: (value: string) => void
  value: string
  valueLabels?: Record<string, string>
  values: string[]
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {valueLabels?.[item] ?? item}
          </option>
        ))}
      </select>
    </label>
  )
}

export function TeamScore({ align, score, team }: { align: 'left' | 'right'; score?: number; team: WorldCupTeam }) {
  return (
    <div className={cn('flex items-center gap-3', align === 'right' && 'md:flex-row-reverse md:text-right')}>
      <TeamFlag team={team} className="h-12 w-16" />
      <div>
        <p className="font-semibold">{team.placeholder ? 'Qualifier pending' : team.name}</p>
        <p className="font-mono text-2xl font-black">{score ?? '-'}</p>
      </div>
    </div>
  )
}

export function WorldCupScoreBreakdown({ fixture }: { fixture: WorldCupFixture }) {
  const scores: Array<{ label: string; score?: WorldCupScore }> = [
    { label: 'HT', score: fixture.scoreBreakdown?.halftime },
    { label: 'FT', score: fixture.scoreBreakdown?.fulltime },
    { label: 'ET', score: fixture.scoreBreakdown?.extratime },
    { label: 'PEN', score: fixture.scoreBreakdown?.penalty },
  ]

  return (
    <section className="stat-card rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Score breakdown</h2>
        <Badge variant="outline">{fixture.timezone ?? 'UTC'}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {scores.map((item) => (
          <div key={item.label} className="surface-soft rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 font-mono text-xl font-black">{item.score?.home ?? '-'}:{item.score?.away ?? '-'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function WorldCupSquadByPosition({ players }: { players: WorldCupSquadPlayer[] }) {
  const grouped = players.reduce<Record<string, WorldCupSquadPlayer[]>>((acc, player) => {
    const key = player.position ?? 'Position pending'
    acc[key] = [...(acc[key] ?? []), player]
    return acc
  }, {})

  return (
    <section className="stat-card rounded-fg-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Squad by position</h2>
        <Badge variant="outline">{players.length} players</Badge>
      </div>
      {players.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Object.entries(grouped).map(([position, groupPlayers]) => (
            <div key={position} className="surface-soft rounded-xl p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{position}</h3>
                <span className="font-mono text-xs text-muted-foreground">{groupPlayers.length}</span>
              </div>
              <div className="grid gap-2">
                {groupPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 rounded-lg px-1 py-1">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 font-mono text-xs">
                      {player.number ?? '-'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{player.name}</span>
                    {player.age ? <span className="shrink-0 text-xs text-muted-foreground">{player.age}y</span> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
          The squad list publishes closer to the tournament. Check back as teams confirm their rosters.
        </p>
      )}
    </section>
  )
}

export function MatchMetaGrid({ fixture }: { fixture: WorldCupFixture }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <SignalCard icon={<CalendarDays className="size-4" />} label="Kickoff" value={formatDateTime(fixture.utcDate)} tone="text-sky-200" />
      <SignalCard icon={<MapPin className="size-4" />} label="Venue" value={fixture.venue ?? 'Pending'} tone="text-amber-200" />
      <SignalCard icon={<Shield className="size-4" />} label="Referee" value={fixture.referee ?? 'Pending'} tone="text-violet-200" />
      <SignalCard icon={<Activity className="size-4" />} label="Status" value={fixture.status} tone="text-emerald-200" />
    </div>
  )
}
