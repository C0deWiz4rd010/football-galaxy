import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

/** React Router stores the history index; 0 means the page was opened directly. */
function canGoBack() {
  const state: unknown = window.history.state
  return typeof state === 'object' && state !== null && 'idx' in state && Number((state as { idx: unknown }).idx) > 0
}

/**
 * The one back control. Goes back in history when the user navigated here,
 * otherwise to `fallbackTo` (deep links must not leave the app).
 * `icon` is the compact round variant for heroes; `onMedia` styles it for
 * coloured/photo backgrounds.
 */
export function BackButton({
  fallbackTo = '/',
  variant = 'labeled',
  onMedia = false,
  className,
}: {
  fallbackTo?: string
  variant?: 'labeled' | 'icon'
  onMedia?: boolean
  className?: string
}) {
  const navigate = useNavigate()
  const { t } = useLocale()
  const goBack = () => {
    if (canGoBack()) navigate(-1)
    else navigate(fallbackTo)
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={goBack}
        aria-label={t('back')}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          onMedia
            ? 'border-white/20 bg-black/30 text-white hover:bg-black/50'
            : 'border-border/60 bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground',
          className,
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </button>
    )
  }

  return (
    <Button type="button" variant="outline" className={cn('h-11 w-fit', className)} onClick={goBack}>
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {t('back')}
    </Button>
  )
}
