import type { LeagueId, Standing } from '@/services/types'

/** Clubs per league in 2026/27; Ligue 1 has played with 18 since 2023/24. */
export const TEAM_COUNT: Record<LeagueId, number> = {
  'premier-league': 20,
  'la-liga': 20,
  'serie-a': 20,
  bundesliga: 18,
  'ligue-1': 18,
}

/**
 * Arithmetic every league table must satisfy. A violation means the feed (or
 * our mapping) is wrong — or a points deduction, which the feeds do not mark —
 * so the result is worth logging rather than showing.
 */
export function standingsIssues(leagueId: LeagueId, standings: Standing[]): string[] {
  const issues: string[] = []
  const expected = TEAM_COUNT[leagueId]
  if (standings.length !== expected) issues.push(`${standings.length} teams, expected ${expected}`)

  const ranks = standings.map((row) => row.position).sort((a, b) => a - b)
  if (ranks.some((rank, index) => rank !== index + 1)) issues.push(`positions are not 1…${standings.length}`)

  for (const row of standings) {
    const name = row.team.shortName || row.team.name
    if (row.points !== row.won * 3 + row.drawn) issues.push(`${name}: ${row.points} pts ≠ 3×${row.won} + ${row.drawn}`)
    if (row.played !== row.won + row.drawn + row.lost) issues.push(`${name}: ${row.played} played ≠ W+D+L`)
    if (row.goalDifference !== row.goalsFor - row.goalsAgainst) issues.push(`${name}: goal difference ≠ ${row.goalsFor}−${row.goalsAgainst}`)
  }

  const sum = (pick: (row: Standing) => number) => standings.reduce((total, row) => total + pick(row), 0)
  if (sum((row) => row.won) !== sum((row) => row.lost)) issues.push('total wins ≠ total losses')
  if (sum((row) => row.drawn) % 2 !== 0) issues.push('odd number of draws')
  if (sum((row) => row.goalsFor) !== sum((row) => row.goalsAgainst)) issues.push('goals scored ≠ goals conceded')

  return issues
}
