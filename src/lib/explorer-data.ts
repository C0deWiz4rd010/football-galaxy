import { mockData } from '@/data/mock'
import { leagues } from '@/lib/leagues'
import { getPlayerCardProfile } from '@/lib/player-ratings'
import type { League, LeagueId, Player, Standing, Team } from '@/services/types'

export interface TeamExplorerEntry {
  league: League
  standing?: Standing
  team: Team
}

export interface PlayerExplorerEntry {
  league: League
  player: Player
  standing?: Standing
  team: Team
  overall: number
  archetype: string
}

export interface SearchResults {
  leagues: League[]
  teams: TeamExplorerEntry[]
  players: PlayerExplorerEntry[]
}

const leagueCatalog = leagues.map((league) => ({
  league,
  teamCount: mockData[league.id].teams.length,
  playerCount: mockData[league.id].teams.reduce(
    (total, team) => total + (team.squad?.length ?? 0),
    0,
  ),
}))

const teamExplorerEntries = leagues.flatMap((league) => {
  const dataset = mockData[league.id]

  return dataset.teams.map((team) => ({
    league,
    standing: dataset.standings.find((item) => item.team.id === team.id),
    team,
  }))
})

const playerExplorerEntries = teamExplorerEntries.flatMap(({ league, standing, team }) =>
  (team.squad ?? []).map((player) => {
    const card = getPlayerCardProfile(player)

    return {
      league,
      player,
      standing,
      team,
      overall: card.overall,
      archetype: card.archetype,
    }
  }),
)

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

export function getLeagueCatalog() {
  return leagueCatalog
}

export function getTeamExplorerEntries(selectedLeagueId?: LeagueId) {
  return selectedLeagueId
    ? teamExplorerEntries.filter(({ league }) => league.id === selectedLeagueId)
    : teamExplorerEntries
}

export function getPlayerExplorerEntries(selectedLeagueId?: LeagueId) {
  return selectedLeagueId
    ? playerExplorerEntries.filter(({ league }) => league.id === selectedLeagueId)
    : playerExplorerEntries
}

export function searchEntities(query: string): SearchResults {
  const normalized = normalizeQuery(query)

  if (!normalized) {
    return {
      leagues: [],
      teams: [],
      players: [],
    }
  }

  return {
    leagues: leagues.filter(
      (league) =>
        league.name.toLowerCase().includes(normalized) ||
        league.country.toLowerCase().includes(normalized),
    ),
    teams: teamExplorerEntries.filter(
      ({ team, league }) =>
        team.name.toLowerCase().includes(normalized) ||
        team.shortName.toLowerCase().includes(normalized) ||
        league.name.toLowerCase().includes(normalized),
    ),
    players: playerExplorerEntries.filter(
      ({ player, team, league, archetype }) =>
        player.name.toLowerCase().includes(normalized) ||
        player.position.toLowerCase().includes(normalized) ||
        team.name.toLowerCase().includes(normalized) ||
        league.name.toLowerCase().includes(normalized) ||
        archetype.toLowerCase().includes(normalized),
    ),
  }
}
