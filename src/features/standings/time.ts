import {
  getDashboardCopy,
  getLanguageLocale,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'

export function formatLastUpdated(timestamp: number, language: LanguageCode) {
  const date = new Date(timestamp)
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()
  const locale = getLanguageLocale(language)
  const copy = getDashboardCopy(language)

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  if (isSameDay) {
    return `${copy.updatedPrefix} ${time}`
  }

  const day = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `${copy.updatedPrefix} ${day}, ${time}`
}
