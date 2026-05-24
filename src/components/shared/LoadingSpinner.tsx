import { cn } from '@/lib/utils'

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-24', className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary" />
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-primary/40" style={{ animationDuration: '1.4s', animationDirection: 'reverse' }} />
      </div>
    </div>
  )
}
