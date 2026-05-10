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

export function getLeagueCatalog() {
  return leagues.map((league) => ({
    league,
    teamCount: mockData[league.id].teams.length,
    playerCount: mockData[league.id].teams.reduce(
      (total, team) => total + (team.squad?.length ?? 0),
      0,
    ),
  }))
}

export function getTeamExplorerEntries(selectedLeagueId?: LeagueId) {
  return leagues
    .filter((league) => !selectedLeagueId || league.id === selectedLeagueId)
    .flatMap((league) => {
      const dataset = mockData[league.id]

      return dataset.teams.map((team) => ({
        league,
        standing: dataset.standings.find((item) => item.team.id === team.id),
        team,
      }))
    })
}

export function getPlayerExplorerEntries(selectedLeagueId?: LeagueId) {
  return getTeamExplorerEntries(selectedLeagueId).flatMap(({ league, standing, team }) =>
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
}

export function searchEntities(query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return {
      leagues: [] as League[],
      teams: [] as TeamExplorerEntry[],
      players: [] as PlayerExplorerEntry[],
    }
  }

  return {
    leagues: leagues.filter(
      (league) =>
        league.name.toLowerCase().includes(normalized) ||
        league.country.toLowerCase().includes(normalized),
    ),
    teams: getTeamExplorerEntries().filter(
      ({ team, league }) =>
        team.name.toLowerCase().includes(normalized) ||
        team.shortName.toLowerCase().includes(normalized) ||
        league.name.toLowerCase().includes(normalized),
    ),
    players: getPlayerExplorerEntries().filter(
      ({ player, team, league, archetype }) =>
        player.name.toLowerCase().includes(normalized) ||
        player.position.toLowerCase().includes(normalized) ||
        team.name.toLowerCase().includes(normalized) ||
        league.name.toLowerCase().includes(normalized) ||
        archetype.toLowerCase().includes(normalized),
    ),
  }
}
