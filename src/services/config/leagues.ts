import { z } from 'zod'

export const leagueIdSchema = z.enum([
  'premier-league',
  'la-liga',
  'bundesliga',
  'serie-a',
  'ligue-1',
])

export type LeagueId = z.infer<typeof leagueIdSchema>

export type LeagueConfig = {
  id: LeagueId
  label: string
  country: string
  competitionCode: string
}

export const LEAGUES: readonly LeagueConfig[] = [
  {
    id: 'premier-league',
    label: 'Premier League',
    country: 'England',
    competitionCode: 'PL',
  },
  {
    id: 'la-liga',
    label: 'La Liga',
    country: 'Spain',
    competitionCode: 'PD',
  },
  {
    id: 'bundesliga',
    label: 'Bundesliga',
    country: 'Germany',
    competitionCode: 'BL1',
  },
  {
    id: 'serie-a',
    label: 'Serie A',
    country: 'Italy',
    competitionCode: 'SA',
  },
  {
    id: 'ligue-1',
    label: 'Ligue 1',
    country: 'France',
    competitionCode: 'FL1',
  },
] as const

export const leagueConfigById = Object.fromEntries(
  LEAGUES.map((league) => [league.id, league]),
) as Record<LeagueId, LeagueConfig>

export function getLeagueConfig(leagueId: LeagueId) {
  return leagueConfigById[leagueId]
}
