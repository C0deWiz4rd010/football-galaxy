import { leagues } from '@/lib/leagues'
import { createFlag, createPlayerAvatar, createTeamCrest } from '@/lib/visualAssets'
import type { Assist, LeagueId, Match, Player, Scorer, Standing, Team } from '@/services/types'

const firstNames = ['Luca', 'Noah', 'Theo', 'Milan', 'Elias', 'Jonas', 'Mateo', 'Oscar', 'Hugo', 'Leo', 'Nico', 'Rafael', 'Iker', 'Enzo', 'Felix', 'Adam', 'Ivan', 'Marco']
const lastNames = ['Silva', 'Martin', 'Keller', 'Moretti', 'Dubois', 'Costa', 'Hansen', 'Rossi', 'Garcia', 'Bauer', 'Leroy', 'Santos', 'Varela', 'Meyer', 'Fischer', 'Ndiaye', 'Bianchi', 'Romero']
const nationalities = [
  ['England', createFlag('england')],
  ['Germany', createFlag('germany')],
  ['Spain', createFlag('spain')],
  ['Italy', createFlag('italy')],
  ['France', createFlag('france')],
  ['Portugal', createFlag('portugal')],
  ['Netherlands', createFlag('netherlands')],
  ['Brazil', createFlag('brazil')],
] as const
const positions = ['GK', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW'] as const

export interface MockLeagueData {
  standings: Standing[]
  topScorers: Scorer[]
  topAssists: Assist[]
  recentMatches: Match[]
  teams: Team[]
}

interface CreateMockLeagueOptions {
  leagueId: LeagueId
  teamNames: string[]
  teamColors?: string[]
  seed: number
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`
}

function createPlayer(leagueId: LeagueId, teamId: string, teamColor: string, teamIndex: number, playerIndex: number): Player {
  const firstName = pick(firstNames, teamIndex + playerIndex)
  const lastName = pick(lastNames, teamIndex * 3 + playerIndex)
  const [nationality, flag] = pick(nationalities, teamIndex + playerIndex)
  const position = playerIndex === 0 ? 'GK' : pick(positions, playerIndex)
  const goalsBase = position === 'FW' ? 8 : position === 'MF' ? 4 : 1
  const assistsBase = position === 'MF' ? 7 : position === 'FW' ? 4 : 2

  return {
    id: `${teamId}-p${playerIndex + 1}`,
    teamId,
    leagueId,
    name: `${firstName} ${lastName}`,
    number: playerIndex + 1,
    position,
    nationality,
    flag,
    age: 19 + ((teamIndex + playerIndex) % 15),
    heightCm: 174 + ((teamIndex * 2 + playerIndex) % 24),
    weightKg: 68 + ((teamIndex + playerIndex * 2) % 20),
    photo: createPlayerAvatar(initials(firstName, lastName), teamColor),
    marketValueEurCents: (5_000_000 + (teamIndex * 2_100_000 + playerIndex * 775_000)) * 100,
    contractUntil: `${2027 + ((teamIndex + playerIndex) % 4)}-06-30`,
    stats: {
      appearances: 18 + ((teamIndex + playerIndex) % 15),
      goals: Math.max(0, goalsBase + ((teamIndex + playerIndex) % 9) - 3),
      assists: Math.max(0, assistsBase + ((teamIndex * 2 + playerIndex) % 8) - 2),
      yellowCards: (teamIndex + playerIndex) % 7,
      redCards: playerIndex % 17 === 0 ? 1 : 0,
      minutes: 640 + (((teamIndex + 2) * (playerIndex + 5) * 19) % 2500),
      trend: [0, 1, 2, 1, 3].map((value, index) => value + ((teamIndex + playerIndex + index) % 3)),
      attributes: {
        pace: 58 + ((teamIndex + playerIndex * 7) % 38),
        shooting: 52 + ((teamIndex * 3 + playerIndex * 5) % 42),
        passing: 56 + ((teamIndex * 4 + playerIndex * 4) % 40),
        dribbling: 54 + ((teamIndex * 5 + playerIndex * 3) % 42),
        defending: 45 + ((teamIndex * 6 + playerIndex * 2) % 45),
        physical: 55 + ((teamIndex * 7 + playerIndex) % 40),
      },
    },
  }
}

export function createMockLeague({ leagueId, teamNames, teamColors, seed }: CreateMockLeagueOptions): MockLeagueData {
  const league = leagues.find((item) => item.id === leagueId)!
  const teams = teamNames.map((name, index) => {
    const primaryColor = teamColors?.[index] ?? league.color
    const shortName = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase()
    const secondaryColor = index % 2 === 0 ? '#18181b' : '#f4f4f5'
    const teamId = `${leagueId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const team: Team = {
      id: teamId,
      leagueId,
      name,
      shortName,
      crest: createTeamCrest(shortName, primaryColor, secondaryColor, index),
      manager: `${pick(firstNames, index + seed)} ${pick(lastNames, index + seed + 5)}`,
      stadium: `${name.split(' ')[0]} Arena`,
      capacity: 32000 + ((index + seed) % 11) * 4200,
      primaryColor,
      secondaryColor,
    }
    team.squad = Array.from({ length: 18 }, (_, playerIndex) => createPlayer(leagueId, teamId, primaryColor, index, playerIndex))
    return team
  })

  const standings = teams
    .map((team, index) => {
      const played = 34 + ((index + seed) % 5)
      const won = Math.max(4, 27 - index - (seed % 3))
      const drawn = 3 + ((index + seed) % 8)
      const lost = Math.max(1, played - won - drawn)
      const goalsFor = 84 - index * 2 + (seed % 7)
      const goalsAgainst = 25 + index * 2 + (seed % 5)
      const goalDifference = goalsFor - goalsAgainst
      const points = won * 3 + drawn
      const forms = ['W', 'W', 'D', 'L', 'W', 'D', 'L'] as const

      return {
        id: `${team.id}-standing`,
        leagueId,
        position: index + 1,
        team,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        avgPossession: 61 - index * 0.8,
        form: Array.from({ length: 5 }, (_, formIndex) => ({
          result: pick(forms, index + formIndex + seed),
          opponent: pick(teams, index + formIndex + 3).shortName,
          score: `${(index + formIndex) % 4}-${(index + seed + formIndex) % 3}`,
          date: `2025-04-${String(5 + formIndex * 4).padStart(2, '0')}T15:00:00Z`,
        })),
      } satisfies Standing
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .map((standing, index) => ({ ...standing, position: index + 1 }))

  const players = teams.flatMap((team) => team.squad ?? [])
  const topScorers = players
    .slice()
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 15)
    .map((player) => ({ id: `${player.id}-scorer`, player, team: teams.find((team) => team.id === player.teamId)!, goals: player.stats.goals, assists: player.stats.assists }))
  const topAssists = players
    .slice()
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 15)
    .map((player) => ({ id: `${player.id}-assist`, player, team: teams.find((team) => team.id === player.teamId)!, assists: player.stats.assists, goals: player.stats.goals }))

  const recentMatches: Match[] = Array.from({ length: 10 }, (_, index) => {
    const homeTeam = teams[index * 2]!
    const awayTeam = teams[index * 2 + 1]!
    const homeScore = (index + seed) % 4
    const awayScore = (index * 2 + seed) % 3
    const homePlayer = homeTeam.squad![8]!
    const awayPlayer = awayTeam.squad![9]!
    return {
      id: `${leagueId}-md38-${index + 1}`,
      leagueId,
      season: '2024-25',
      matchday: 38,
      utcDate: `2025-05-${String(10 + index).padStart(2, '0')}T16:30:00Z`,
      status: index === 0 ? 'LIVE' : 'FINISHED',
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      venue: homeTeam.stadium,
      events: [
        { id: `${leagueId}-e-${index}-1`, minute: 23, type: 'goal', teamId: homeTeam.id, playerId: homePlayer.id, playerName: homePlayer.name, detail: 'Right-footed finish' },
        { id: `${leagueId}-e-${index}-2`, minute: 58, type: 'yellow', teamId: awayTeam.id, playerId: awayPlayer.id, playerName: awayPlayer.name, detail: 'Late challenge' },
        { id: `${leagueId}-e-${index}-3`, minute: 76, type: 'substitution', teamId: homeTeam.id, playerName: 'Double change' },
      ],
    }
  })

  return { standings, topScorers, topAssists, recentMatches, teams }
}
