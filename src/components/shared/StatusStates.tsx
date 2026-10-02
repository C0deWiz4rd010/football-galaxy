import type { ReactNode } from 'react'

import { AlertCircle, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

interface StateShellProps {
  icon: ReactNode
  title: string
  description: string
  actions?: ReactNode
  role?: 'alert' | 'status'
  className?: string
}

function StateShell({ icon, title, description, actions, role, className }: StateShellProps) {
  return (
    <div
      role={role}
      className={cn(
        'stat-card mx-auto flex max-w-xl flex-col items-center gap-fg-3 rounded-fg-lg p-fg-6 text-center shadow-fg-2',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">{icon}</div>
      <div className="space-y-fg-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap justify-center gap-fg-2">{actions}</div> : null}
    </div>
  )
}

/** Recoverable load failure with a retry action. */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  const { t } = useLocale()
  return (
    <StateShell
      role="alert"
      className={className}
      icon={<AlertCircle className="h-6 w-6 text-destructive" aria-hidden />}
      title={title ?? t('loadFailedTitle')}
      description={description ?? t('loadFailedDescription')}
      actions={onRetry ? <Button onClick={onRetry}>{t('retry')}</Button> : null}
    />
  )
}

/** The request succeeded but the entity (or route) does not exist. */
export function NotFoundState({
  title,
  description,
  backTo = '/',
  backLabel,
  className,
}: {
  title?: string
  description?: string
  backTo?: string
  backLabel?: string
  className?: string
}) {
  const { t } = useLocale()
  return (
    <StateShell
      role="status"
      className={className}
      icon={<Compass className="h-6 w-6 text-muted-foreground" aria-hidden />}
      title={title ?? t('pageNotFound')}
      description={description ?? t('pageNotFoundDescription')}
      actions={
        <Button asChild variant="outline">
          <Link to={backTo}>{backLabel ?? t('goHome')}</Link>
        </Button>
      }
    />
  )
}
