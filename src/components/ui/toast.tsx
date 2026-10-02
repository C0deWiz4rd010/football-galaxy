import { useCallback, useEffect, useRef, useState } from 'react'

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

type ToastVariant = 'error' | 'info' | 'success'

export interface ToastMessage {
  /** Plain title, or `titleKey` to translate it at render time. */
  title?: string
  titleKey?: string
  description: string
  variant?: ToastVariant
}

interface ActiveToast extends ToastMessage {
  id: number
  key: string
}

const EVENT = 'football-toast'
const DURATION_MS = 4500
const MAX_VISIBLE = 3

export function toast(message: ToastMessage) {
  window.dispatchEvent(new CustomEvent<ToastMessage>(EVENT, { detail: message }))
}

const icons = { error: AlertCircle, info: Info, success: CheckCircle2 } as const
const tones = {
  error: 'border-destructive/30 [&_svg]:text-destructive',
  info: 'border-border [&_svg]:text-primary',
  success: 'border-emerald-500/30 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400',
} as const

export function Toaster() {
  const { t } = useLocale()
  const [toasts, setToasts] = useState<ActiveToast[]>([])
  const timers = useRef(new Map<number, number>())
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  useEffect(() => {
    const activeTimers = timers.current
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastMessage>).detail
      const key = `${detail.variant ?? 'error'}|${detail.titleKey ?? detail.title}|${detail.description}`
      const id = ++nextId.current
      setToasts((current) => {
        // The same failure reported by several hooks at once shows only once.
        if (current.some((item) => item.key === key)) return current
        return [...current, { ...detail, id, key }].slice(-MAX_VISIBLE)
      })
      activeTimers.set(id, window.setTimeout(() => dismiss(id), DURATION_MS))
    }
    window.addEventListener(EVENT, handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      activeTimers.forEach((timer) => window.clearTimeout(timer))
      activeTimers.clear()
    }
  }, [dismiss])

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 md:inset-x-auto md:bottom-auto md:right-4 md:top-20 md:items-end"
    >
      {toasts.map((item) => {
        const variant = item.variant ?? 'error'
        const Icon = icons[variant]
        return (
          <div
            key={item.id}
            role={variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-background p-4 text-sm shadow-lg',
              tones[variant],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.titleKey ? t(item.titleKey) : item.title}</p>
              <p className="break-words text-muted-foreground">{item.description}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label={t('close')}
              className="-m-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
