export function formatLastUpdated(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const isSameDay = date.toDateString() === now.toDateString()

  const time = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  if (isSameDay) {
    return `Updated ${time}`
  }

  const day = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `Updated ${day}, ${time}`
}
