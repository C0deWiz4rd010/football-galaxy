import { Skeleton } from '@/components/ui/skeleton'

/**
 * Layout-matched skeleton for `LeagueDashboard`. Showing roughly the same
 * structure as the real content reduces perceived load time vs. four generic
 * placeholder cards because the viewer's eye lands on the right spots.
 */
export function LeagueDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero block */}
      <section className="stat-card overflow-hidden p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.9fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-fg-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Skeleton className="h-16 rounded-fg-md" />
              <Skeleton className="h-16 rounded-fg-md" />
              <Skeleton className="h-16 rounded-fg-md" />
              <Skeleton className="h-16 rounded-fg-md" />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Skeleton className="h-12 rounded-fg-md" />
              <Skeleton className="h-12 rounded-fg-md" />
              <Skeleton className="h-12 rounded-fg-md" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Skeleton className="h-24 rounded-fg-md" />
            <Skeleton className="h-24 rounded-fg-md" />
          </div>
        </div>
      </section>

      {/* Table block */}
      <div className="stat-card space-y-3 p-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-fg-sm" />
          ))}
        </div>
      </div>

      {/* Storyline + side blocks */}
      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-fg-lg" />
          ))}
        </div>
        <div className="grid gap-3">
          <Skeleton className="h-40 rounded-fg-lg" />
          <Skeleton className="h-40 rounded-fg-lg" />
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,0.8fr)]">
        <Skeleton className="h-64 rounded-fg-lg" />
        <Skeleton className="h-64 rounded-fg-lg" />
        <Skeleton className="h-64 rounded-fg-lg" />
      </div>
    </div>
  )
}
