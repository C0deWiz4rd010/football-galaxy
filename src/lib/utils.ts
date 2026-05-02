import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string, pattern = 'dd MMM yyyy') {
  return format(parseISO(iso), pattern)
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), 'dd MMM yyyy, HH:mm')
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
