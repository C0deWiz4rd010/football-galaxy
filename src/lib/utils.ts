import { clsx, type ClassValue } from 'clsx'
import { format, isValid, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string | null | undefined, pattern = 'dd MMM yyyy') {
  if (!iso) {
    return '—'
  }
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, pattern) : '—'
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, 'dd MMM yyyy, HH:mm') : '—'
}

/**
 * Compact, human relative time for data-freshness labels ("just now",
 * "3 min ago", "2 h ago"). Accepts an epoch-ms timestamp or ISO string and
 * returns an em-dash for anything unparseable so live feeds never crash the UI.
 */
export function formatRelativeTime(
  input: number | string | null | undefined,
  now: number = Date.now(),
): string {
  if (input === null || input === undefined) {
    return '—'
  }
  const ms = typeof input === 'number' ? input : parseISO(input).getTime()
  if (!Number.isFinite(ms)) {
    return '—'
  }
  const diffSeconds = Math.max(0, Math.round((now - ms) / 1000))
  if (diffSeconds < 45) {
    return 'just now'
  }
  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} h ago`
  }
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays} d ago`
}

export const eurFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatMarketValue(cents: number) {
  return eurFormatter.format(cents / 100)
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
