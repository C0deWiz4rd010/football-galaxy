import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({ title, description, icon: Icon = SearchX, className }: { title: string; description: string; icon?: LucideIcon; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-48 flex-col items-center justify-center rounded-fg-2xl border border-dashed border-border/60 bg-card/40 p-8 text-center',
        className,
      )}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
