/** Building blocks shared by every World Cup page: shell, titles, navigation, flags, states. */
import { ChevronRight, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { worldCupNav } from '@/app/navigation'
import { AssetImage } from '@/components/shared/AssetImage'
import { DataSourceBadge, type DataFreshness } from '@/components/shared/DataSourceBadge'
import { ErrorState } from '@/components/shared/StatusStates'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/contexts/LocaleContext'
import { cn, formatDateTime } from '@/lib/utils'
import type { DataQualityMeta, WorldCupTeam } from '@/services/worldCup/types'

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

export function SignalCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
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

/** Goals, plus the shoot-out tally in small type when there was one ("1 ⁽³⁾"). */
export function PenaltyScore({ score, penalties, className }: { score?: number; penalties?: number; className?: string }) {
  return (
    <span className={cn('font-mono font-bold tabular-nums', className)}>
      {score ?? '–'}
      {penalties !== undefined ? <span className="ml-0.5 align-super text-2xs font-medium text-muted-foreground">({penalties})</span> : null}
    </span>
  )
}
