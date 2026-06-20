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
  round: 'all',
  hostCity: 'all',
  teamId: 'all',
}

export function filterWorldCupFixtures(fixtures: WorldCupFixture[], filters: WorldCupFilterState) {
  const query = filters.search.trim().toLowerCase()
  return fixtures.filter((fixture) => {
    const matchesSearch =
      !query ||
      fixture.homeTeam.name.toLowerCase().includes(query) ||
      fixture.awayTeam.name.toLowerCase().includes(query) ||
      fixture.round.toLowerCase().includes(query) ||
      (fixture.city ?? '').toLowerCase().includes(query)
    const matchesStatus = filters.status === 'all' || fixture.status.toLowerCase() === filters.status
    const matchesGroup = filters.group === 'all' || fixture.group === filters.group
    const matchesRound = filters.round === 'all' || fixture.round === filters.round
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
