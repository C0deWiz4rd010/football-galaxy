import { useOptionalLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

/** Page-level loading indicator, announced politely to screen readers. */
export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  const locale = useOptionalLocale()
  const text = label ?? locale?.t('loading') ?? 'Loading…'
  return (
    <div role="status" aria-live="polite" className={cn('flex min-h-[60dvh] items-center justify-center', className)}>
      <div aria-hidden className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary motion-reduce:animate-none" />
        <div
          className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-primary/40 motion-reduce:animate-none"
          style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}
        />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  )
}
