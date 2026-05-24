import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard() {
  return (
    <div className="stat-card space-y-4">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
