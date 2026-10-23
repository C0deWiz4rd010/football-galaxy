import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** UI language as set by LocaleContext (and the pre-paint script) on <html lang>. */
export function currentLocaleTag(): string {
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : ''
  return lang === 'en' ? 'en-GB' : 'de-DE'
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function dateFormatter(options: Intl.DateTimeFormatOptions) {
  const key = `${currentLocaleTag()}|${JSON.stringify(options)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(currentLocaleTag(), options)
    formatters.set(key, formatter)
  }
  return formatter
}

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "12. Okt. 2026" / "12 Oct 2026" in the UI language. */
export function formatDate(iso: string | null | undefined) {
  const date = parse(iso)
  return date ? dateFormatter({ day: 'numeric', month: 'short', year: 'numeric' }).format(date) : '—'
}

/** Date and kick-off time in the UI language. */
export function formatDateTime(iso: string | null | undefined) {
  const date = parse(iso)
  return date ? dateFormatter({ day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date) : '—'
}

/**
 * Compact relative time for data-freshness labels ("gerade eben", "vor 3 Min.").
 * Accepts epoch ms or an ISO string; unparseable input renders an em-dash so
 * live feeds never crash the UI.
 */
export function formatRelativeTime(input: number | string | null | undefined, now: number = Date.now()): string {
  if (input === null || input === undefined) return '—'
  const ms = typeof input === 'number' ? input : new Date(input).getTime()
  if (!Number.isFinite(ms)) return '—'
  const seconds = Math.round((ms - now) / 1000)
  const format = new Intl.RelativeTimeFormat(currentLocaleTag(), { numeric: 'auto', style: 'short' })
  if (Math.abs(seconds) < 45) return format.format(0, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return format.format(hours, 'hour')
  return format.format(Math.round(hours / 24), 'day')
}
