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
