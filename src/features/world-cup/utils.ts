import type {
  WorldCupFilterState,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupTeam,
} from '@/services/worldCup/types'

export const defaultWorldCupFilters: WorldCupFilterState = {
  search: '',
  status: 'all',
  group: 'all',
  stage: 'all',
  hostCity: 'all',
  teamId: 'all',
}

/**
 * `describe` adds the localized labels (team names, round) to the searchable
 * text, so users can search in the language they see.
 */
export function filterWorldCupFixtures(
  fixtures: WorldCupFixture[],
  filters: WorldCupFilterState,
  describe: (fixture: WorldCupFixture) => string = () => '',
) {
  const query = filters.search.trim().toLowerCase()
  return fixtures.filter((fixture) => {
    const matchesSearch =
      !query ||
      [fixture.homeTeam.name, fixture.awayTeam.name, fixture.city ?? '', describe(fixture)].some((text) =>
        text.toLowerCase().includes(query),
      )
    const matchesStatus = filters.status === 'all' || fixture.status.toLowerCase() === filters.status
    const matchesGroup = filters.group === 'all' || fixture.group === filters.group
    const matchesRound = filters.stage === 'all' || fixture.stage === filters.stage
    const matchesCity = filters.hostCity === 'all' || fixture.city === filters.hostCity
    const matchesTeam =
      filters.teamId === 'all' ||
      fixture.homeTeam.id === filters.teamId ||
      fixture.awayTeam.id === filters.teamId

    return matchesSearch && matchesStatus && matchesGroup && matchesRound && matchesCity && matchesTeam
  })
}

export function groupWorldCupStandings(groups: WorldCupGroupStanding[]) {
  return groups.reduce<Record<string, WorldCupGroupStanding[]>>((acc, row) => {
    acc[row.group] = [...(acc[row.group] ?? []), row].sort((left, right) => left.rank - right.rank)
    return acc
  }, {})
}

/** Winning side of a finished match; the provider's verdict beats comparing goals (shoot-outs). */
export function winnerSide(match: Pick<WorldCupFixture, 'winner' | 'homeScore' | 'awayScore'>): 'home' | 'away' | undefined {
  if (match.winner === 'home' || match.winner === 'away') return match.winner
  if (match.winner === 'draw') return undefined
  if (typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number' || match.homeScore === match.awayScore) return undefined
  return match.homeScore > match.awayScore ? 'home' : 'away'
}

export function uniqueOptions(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((left, right) => left.localeCompare(right))
}

export function uniqueTeamOptions(fixtures: WorldCupFixture[]) {
  const teams = new Map<string, WorldCupTeam>()
  for (const fixture of fixtures) {
    teams.set(fixture.homeTeam.id, fixture.homeTeam)
    teams.set(fixture.awayTeam.id, fixture.awayTeam)
  }
  return [...teams.values()].sort((left, right) => left.name.localeCompare(right.name))
}
