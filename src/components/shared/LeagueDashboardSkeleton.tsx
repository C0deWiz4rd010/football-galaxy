import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocale } from '@/contexts/LocaleContext'
import type { League } from '@/services/types'

/**
 * Layout-matched skeleton for `LeagueDashboard`. The league header is static
 * data, so it renders for real right away (it is the page's LCP element);
 * only the live sections below are placeholders.
 */
export function LeagueDashboardSkeleton({ league }: { league?: League }) {
  const { t } = useLocale()
  return (
    <div className="space-y-4" aria-busy="true">
      <span role="status" className="sr-only">
        {t('loading')}
      </span>
      <section className="stat-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {league ? (
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={league.logo}
                alt={`${league.name} logo`}
                width={56}
                height={56}
                fetchPriority="high"
                className="h-14 w-14 rounded-lg bg-white/90 object-contain p-2 ring-1 ring-border"
              />
              <div className="min-w-0">
                <Badge variant="outline">{league.country}</Badge>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{league.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('tableFirstSubtitle')}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          )}
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="stat-card space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-eyebrow text-muted-foreground">{t('primaryLeagueView')}</p>
              <Skeleton className="mt-2 h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="rounded-lg border border-border/50">
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_repeat(5,3.5rem)] gap-3 border-b border-border/50 px-4 py-3 text-xs uppercase tracking-eyebrow text-muted-foreground">
              <span>Pos</span>
              <span>Team</span>
              <span>Sp</span>
              <span>S</span>
              <span>U</span>
              <span>N</span>
              <span>Pkt</span>
            </div>
            <div className="space-y-1 p-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_repeat(5,3.5rem)] items-center gap-3 px-2 py-2"
                >
                  <Skeleton className="h-4 w-5" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </section>
    </div>
  )
}
