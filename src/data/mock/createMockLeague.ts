import { leagues } from '@/lib/leagues'
import { createPlayerAvatar, createFlag } from '@/lib/visualAssets'
import { getEspnPhotoSources } from '@/data/playerPhotoSources'
import type { Assist, LeagueId, Match, Player, Scorer, Standing, Team } from '@/services/types'

const fallbackFirstNames = ['Luca', 'Noah', 'Theo', 'Milan', 'Elias', 'Jonas', 'Mateo', 'Oscar', 'Hugo', 'Leo']
const fallbackLastNames = ['Silva', 'Martin', 'Keller', 'Moretti', 'Dubois', 'Costa', 'Hansen', 'Rossi', 'Garcia', 'Bauer']

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : ''
  return `${first}${last}`.toUpperCase()
}

function slug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface MockLeagueData {
  standings: Standing[]
  topScorers: Scorer[]
  topAssists: Assist[]
  recentMatches: Match[]
  teams: Team[]
}

export interface RealPlayerInput {
  id: number | string
  name: string
  position?: string | null
  dateOfBirth?: string | null
  nationality?: string | null
  shirtNumber?: number | null
}

export interface RealTeamInput {
  name: string
  shortName: string
  tla: string
  crest: string
  color: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  form: Array<'W' | 'D' | 'L' | string>
  venue?: string | null
  founded?: number | null
  coach?: { name?: string | null; nationality?: string | null; dateOfBirth?: string | null } | null
  squad?: RealPlayerInput[]
}

interface CreateMockLeagueOptions {
  leagueId: LeagueId
  realTeams: RealTeamInput[]
  seed: number
}

function mapPosition(raw?: string | null): 'GK' | 'DF' | 'MF' | 'FW' {
  if (!raw) return 'MF'
  const p = raw.toLowerCase()
  if (p.includes('goalkeeper') || p === 'gk') return 'GK'
  if (p.includes('back') || p.includes('defence') || p.includes('defender') || p === 'df') return 'DF'
  if (p.includes('forward') || p.includes('winger') || p.includes('striker') || p.includes('offence') || p === 'fw') return 'FW'
  return 'MF'
}

function computeAge(dateOfBirth?: string | null, seasonEnd = new Date('2026-05-30')) {
  if (!dateOfBirth) return 24
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return 24
  let age = seasonEnd.getFullYear() - dob.getFullYear()
  const m = seasonEnd.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && seasonEnd.getDate() < dob.getDate())) age -= 1
  return age
}

function nationalitySlug(nationality?: string | null): string | null {
  if (!nationality) return null
  return nationality
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]+/g, '-')
    .replace(/^-|-$/g, '')
}

type FlagCode = 'england' | 'germany' | 'spain' | 'italy' | 'france' | 'portugal' | 'netherlands' | 'brazil'
const FLAG_ALIASES: Record<string, FlagCode> = {
  england: 'england',
  'united-kingdom': 'england',
  scotland: 'england',
  wales: 'england',
  'northern-ireland': 'england',
  ireland: 'england',
  germany: 'germany',
  austria: 'germany',
  switzerland: 'germany',
  spain: 'spain',
  italy: 'italy',
  france: 'france',
  portugal: 'portugal',
  netherlands: 'netherlands',
  belgium: 'netherlands',
  brazil: 'brazil',
}
function toFlagCode(slug: string | null, fallback: FlagCode): FlagCode {
  if (!slug) return fallback
  return FLAG_ALIASES[slug] ?? fallback
}

function createPlayerFromReal(
  leagueId: LeagueId,
  teamId: string,
  teamColor: string,
  teamIndex: number,
  playerIndex: number,
  real: RealPlayerInput,
): Player {
  const position = mapPosition(real.position)
  const age = computeAge(real.dateOfBirth)
  const goalsBase = position === 'FW' ? 8 : position === 'MF' ? 4 : position === 'DF' ? 2 : 0
  const assistsBase = position === 'MF' ? 7 : position === 'FW' ? 4 : position === 'DF' ? 2 : 1
  const flagSlug = nationalitySlug(real.nationality)
  const flagCode = toFlagCode(flagSlug, 'england')
  const number = real.shirtNumber ?? playerIndex + 1

  const espnSources = real.id ? getEspnPhotoSources(real.id) : []
  const avatarSvg = createPlayerAvatar(initials(real.name), teamColor)

  return {
    id: `${teamId}-p${real.id ?? playerIndex + 1}`,
    teamId,
    leagueId,
    name: real.name,
    number,
    position,
    nationality: real.nationality ?? 'Unknown',
    flag: createFlag(flagCode),
    age,
    heightCm: 174 + ((teamIndex * 2 + playerIndex) % 24),
    weightKg: 68 + ((teamIndex + playerIndex * 2) % 20),
    photo: espnSources[0] ?? avatarSvg,
    photoSources: espnSources.length > 0 ? [...espnSources.slice(1), avatarSvg] : [avatarSvg],
    marketValueEurCents: (3_000_000 + (teamIndex * 2_100_000 + playerIndex * 775_000)) * 100,
    contractUntil: `${2026 + ((teamIndex + playerIndex) % 4)}-06-30`,
    stats: {
      appearances: position === 'GK' && playerIndex > 0 ? 4 + (playerIndex % 6) : 18 + ((teamIndex + playerIndex) % 15),
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

function createPlayerFallback(
  leagueId: LeagueId,
  teamId: string,
  teamColor: string,
  teamIndex: number,
  playerIndex: number,
): Player {
  const firstName = pick(fallbackFirstNames, teamIndex + playerIndex)
  const lastName = pick(fallbackLastNames, teamIndex * 3 + playerIndex)
  return createPlayerFromReal(leagueId, teamId, teamColor, teamIndex, playerIndex, {
    id: playerIndex + 1,
    name: `${firstName} ${lastName}`,
    position: playerIndex === 0 ? 'Goalkeeper' : 'Midfield',
    nationality: 'Unknown',
    shirtNumber: playerIndex + 1,
  })
}

export function createMockLeague({ leagueId, realTeams, seed }: CreateMockLeagueOptions): MockLeagueData {
  const league = leagues.find((item) => item.id === leagueId)!

  const teams: Team[] = realTeams.map((rt, index) => {
    const primaryColor = rt.color || league.color
    const secondaryColor = index % 2 === 0 ? '#18181b' : '#f4f4f5'
    const teamId = `${leagueId}-${slug(rt.name)}`
    // Build a deduplicated crestSources chain so AssetImage has multiple CDN
    // candidates before falling back to the generated SVG shield.
    const crestSources: string[] = []
    if (rt.crest) {
      crestSources.push(rt.crest)
      // If the primary crest uses http, also try https variant.
      if (rt.crest.startsWith('http://')) {
        crestSources.push(rt.crest.replace('http://', 'https://'))
      }
    }

    const team: Team = {
      id: teamId,
      leagueId,
      name: rt.name,
      shortName: rt.shortName,
      crest: rt.crest,
      crestSources: crestSources.length > 0 ? crestSources : undefined,
      manager: rt.coach?.name ?? `${pick(fallbackFirstNames, index + seed)} ${pick(fallbackLastNames, index + seed + 5)}`,
      stadium: rt.venue ?? `${rt.shortName} Stadium`,
      capacity: 32000 + ((index + seed) % 11) * 4200,
      primaryColor,
      secondaryColor,
    }
    if (rt.squad && rt.squad.length > 0) {
      team.squad = rt.squad.map((real, playerIndex) =>
        createPlayerFromReal(leagueId, teamId, primaryColor, index, playerIndex, real),
      )
    } else {
      team.squad = Array.from({ length: 18 }, (_, playerIndex) =>
        createPlayerFallback(leagueId, teamId, primaryColor, index, playerIndex),
      )
    }
    return team
  })

  const standings: Standing[] = realTeams
    .map((rt, index) => {
      const team = teams[index]!
      const rawForms = rt.form && rt.form.length > 0 ? rt.form : ['W', 'D', 'L', 'W', 'D']
      const forms = rawForms.map((f) => (f === 'W' || f === 'D' || f === 'L' ? f : 'D')) as Array<'W' | 'D' | 'L'>
      return {
        id: `${team.id}-standing`,
        leagueId,
        position: index + 1,
        team,
        played: rt.played,
        won: rt.won,
        drawn: rt.drawn,
        lost: rt.lost,
        goalsFor: rt.goalsFor,
        goalsAgainst: rt.goalsAgainst,
        goalDifference: rt.goalsFor - rt.goalsAgainst,
        points: rt.points,
        avgPossession: Math.max(35, 62 - index * 1.1),
        form: forms.slice(0, 5).map((result, formIndex) => ({
          result,
          opponent: pick(teams, index + formIndex + 3).shortName,
          score:
            result === 'W'
              ? `${1 + (formIndex % 3)}-${formIndex % 2}`
              : result === 'D'
                ? `${formIndex % 3}-${formIndex % 3}`
                : `${formIndex % 2}-${1 + (formIndex % 3)}`,
          date: `2026-05-${String(1 + formIndex * 4).padStart(2, '0')}T15:00:00Z`,
        })),
      } satisfies Standing
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
    .map((standing, index) => ({ ...standing, position: index + 1 }))

  const players = teams.flatMap((team) => team.squad ?? [])
  const topScorers: Scorer[] = players
    .slice()
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 15)
    .map((player) => ({
      id: `${player.id}-scorer`,
      player,
      team: teams.find((team) => team.id === player.teamId)!,
      goals: player.stats.goals,
      assists: player.stats.assists,
    }))
  const topAssists: Assist[] = players
    .slice()
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 15)
    .map((player) => ({
      id: `${player.id}-assist`,
      player,
      team: teams.find((team) => team.id === player.teamId)!,
      assists: player.stats.assists,
      goals: player.stats.goals,
    }))

  const recentMatches: Match[] = Array.from({ length: Math.min(10, Math.floor(teams.length / 2)) }, (_, index) => {
    const homeTeam = teams[index * 2]!
    const awayTeam = teams[index * 2 + 1]!
    const homeScore = (index + seed) % 4
    const awayScore = (index * 2 + seed) % 3
    const homePlayer = homeTeam.squad![Math.min(8, homeTeam.squad!.length - 1)]!
    const awayPlayer = awayTeam.squad![Math.min(9, awayTeam.squad!.length - 1)]!
    return {
      id: `${leagueId}-md38-${index + 1}`,
      leagueId,
      season: '2025-26',
      matchday: 38,
      utcDate: `2026-05-${String(10 + index).padStart(2, '0')}T16:30:00Z`,
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
