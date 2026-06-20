import { Skeleton } from '@/components/ui/skeleton'

/**
 * Layout-matched skeleton for `LeagueDashboard`. Showing roughly the same
 * structure as the real content reduces perceived load time vs. four generic
 * placeholder cards because the viewer's eye lands on the right spots.
 */
export function LeagueDashboardSkeleton() {
  return (
    <div className="space-y-4">
      <section className="stat-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-fg-lg" />
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Liga-Dashboard wird geladen
              </p>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-16 rounded-fg-md" />
          <Skeleton className="h-16 rounded-fg-md" />
          <Skeleton className="h-16 rounded-fg-md" />
          <Skeleton className="h-16 rounded-fg-md" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="stat-card space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Primäre Liga-Ansicht
              </p>
              <Skeleton className="mt-2 h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="rounded-fg-lg border border-border/50">
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_repeat(5,3.5rem)] gap-3 border-b border-border/50 px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
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
          <Skeleton className="h-40 rounded-fg-lg" />
          <Skeleton className="h-32 rounded-fg-lg" />
          <Skeleton className="h-32 rounded-fg-lg" />
          <Skeleton className="h-40 rounded-fg-lg" />
        </div>
      </section>
    </div>
  )
}
