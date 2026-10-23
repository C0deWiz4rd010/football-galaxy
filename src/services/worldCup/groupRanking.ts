/**
 * FIFA World Cup 2026 group ranking order:
 * 1. points
 * 2. points, 3. goal difference, 4. goals in the matches between the tied teams
 * 5. overall goal difference, 6. overall goals
 * Fair-play points and the FIFA ranking are not in the feed; the provider's own
 * order is the last resort for those (rare) cases. Re-applying 2–4 to a subset
 * that is still tied is not modelled.
 */

export interface RankableTeam {
  teamId: number
  points: number
  goalDifference: number
  goalsFor: number
  /** Position in the provider's table, used only as the final tiebreaker. */
  providerOrder: number
}

export interface GroupResult {
  homeId: number
  awayId: number
  homeGoals: number
  awayGoals: number
}

interface MiniRow {
  points: number
  goalDifference: number
  goalsFor: number
}

function miniTable(teamIds: Set<number>, results: GroupResult[]): Map<number, MiniRow> {
  const table = new Map<number, MiniRow>()
  for (const id of teamIds) table.set(id, { points: 0, goalDifference: 0, goalsFor: 0 })
  for (const result of results) {
    const home = table.get(result.homeId)
    const away = table.get(result.awayId)
    if (!home || !away) continue
    home.goalsFor += result.homeGoals
    away.goalsFor += result.awayGoals
    home.goalDifference += result.homeGoals - result.awayGoals
    away.goalDifference += result.awayGoals - result.homeGoals
    if (result.homeGoals > result.awayGoals) home.points += 3
    else if (result.homeGoals < result.awayGoals) away.points += 3
    else {
      home.points += 1
      away.points += 1
    }
  }
  return table
}

/** Orders one group's teams; `results` are that group's finished matches. */
export function rankGroup<T extends RankableTeam>(teams: T[], results: GroupResult[]): T[] {
  const byPoints = new Map<number, T[]>()
  for (const team of teams) byPoints.set(team.points, [...(byPoints.get(team.points) ?? []), team])

  return [...byPoints.entries()]
    .sort(([left], [right]) => right - left)
    .flatMap(([, tied]) => {
      if (tied.length === 1) return tied
      const h2h = miniTable(new Set(tied.map((team) => team.teamId)), results)
      return [...tied].sort((left, right) => {
        const a = h2h.get(left.teamId)!
        const b = h2h.get(right.teamId)!
        return (
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          b.goalsFor - a.goalsFor ||
          right.goalDifference - left.goalDifference ||
          right.goalsFor - left.goalsFor ||
          left.providerOrder - right.providerOrder
        )
      })
    })
}
