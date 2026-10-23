import type { Match } from '@/services/types'

export interface Matchweek {
  id: string
  start: string
  end: string
  matches: Match[]
}

/** Matches more than this far apart belong to different rounds. */
const ROUND_GAP_MS = 40 * 60 * 60 * 1000

/**
 * Groups a season's matches into rounds by kick-off time. The free feeds do
 * not carry matchday numbers, so rounds are the clusters of matches that sit
 * close together in time (a weekend, a midweek round).
 */
export function groupMatchweeks(matches: Match[]): Matchweek[] {
  const sorted = [...matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  const weeks: Matchweek[] = []
  let previous = -Infinity
  for (const match of sorted) {
    const time = Date.parse(match.utcDate)
    const current = weeks[weeks.length - 1]
    if (!current || time - previous > ROUND_GAP_MS) {
      weeks.push({ id: match.utcDate, start: match.utcDate, end: match.utcDate, matches: [match] })
    } else {
      current.matches.push(match)
      current.end = match.utcDate
    }
    previous = time
  }
  return weeks
}

/** The round to open first: the one in progress or next up, else the latest. */
export function currentMatchweekIndex(weeks: Matchweek[], now = Date.now()): number {
  const index = weeks.findIndex((week) => week.matches.some((match) => match.status !== 'FINISHED') && Date.parse(week.end) >= now - ROUND_GAP_MS)
  return index >= 0 ? index : weeks.length - 1
}
