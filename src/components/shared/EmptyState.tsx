import type { LucideIcon } from 'lucide-react'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({ title, description, icon: Icon = SearchX, className }: { title: string; description: string; icon?: LucideIcon; className?: string }) {
  return (
    <div className={cn('flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center', className)}>
      <Icon className="mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
