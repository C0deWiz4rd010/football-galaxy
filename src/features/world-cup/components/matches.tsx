/** Fixtures: lists, cards, filters, score and match details. */
import { Activity, CalendarDays, ChevronRight, MapPin, RotateCcw, Search, Shield, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type MessageKey, useLocale } from '@/contexts/LocaleContext'
import { cn, formatDate, formatDateTime } from '@/lib/utils'
import type { WorldCupFilterState, WorldCupFixture, WorldCupScore, WorldCupTeam } from '@/services/worldCup/types'

import { useWorldCupLabels } from '../labels'
import { defaultWorldCupFilters, matchPath, uniqueOptions, winnerSide } from '../utils'
import { SignalCard, TeamFlag } from './shared'

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
