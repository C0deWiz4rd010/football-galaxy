/**
 * Single source of truth for the football season. European league seasons run
 * from August to May, so a new season starts counting from July 1st (UTC).
 * Canonical id format: `YYYY-YY` (e.g. `2026-27`).
 */

export function seasonStartYear(date = new Date()): number {
  const year = date.getUTCFullYear()
  return date.getUTCMonth() >= 6 ? year : year - 1
}

export function currentSeasonId(date = new Date()): string {
  return seasonIdFromStartYear(seasonStartYear(date))
}

export function seasonIdFromStartYear(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`
}

/** Parses the starting year from `YYYY`, `YYYY-YY` or `YYYY-YYYY`. */
export function parseSeasonStartYear(season: string | undefined): number | undefined {
  const match = season ? /^(\d{4})/.exec(season.trim()) : null
  return match ? Number(match[1]) : undefined
}

/** TheSportsDB expects `YYYY-YYYY`. */
export function toTheSportsDbSeason(seasonId: string): string {
  const start = parseSeasonStartYear(seasonId) ?? seasonStartYear()
  return `${start}-${start + 1}`
}

export function seasonInfo(seasonId: string) {
  const start = parseSeasonStartYear(seasonId) ?? seasonStartYear()
  return {
    id: seasonIdFromStartYear(start),
    label: `${start}/${String((start + 1) % 100).padStart(2, '0')}`,
    startDate: `${start}-08-01T00:00:00Z`,
    endDate: `${start + 1}-05-31T23:59:59Z`,
  }
}

/** Double round-robin: every team plays every other team twice. */
export function totalMatchdays(teamCount: number): number {
  return teamCount > 1 ? (teamCount - 1) * 2 : 38
}

/**
 * The matchday currently being played (or next up), derived from the table.
 * The free scoreboard feeds rarely carry a round number, but the table always
 * knows how many games have been played.
 */
export function currentMatchdayFromTable(
  standings: Array<{ played: number }>,
  matches: Array<{ status: string }>,
): number {
  const played = standings.reduce((max, row) => Math.max(max, row.played), 0)
  const hasOpenMatches = matches.some((match) => match.status !== 'FINISHED')
  const total = totalMatchdays(standings.length)
  return Math.min(total, Math.max(1, played + (hasOpenMatches ? 1 : 0)))
}
