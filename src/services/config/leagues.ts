import { z } from 'zod'

export const leagueIdSchema = z.enum([
  'premier-league',
  'la-liga',
  'bundesliga',
  'serie-a',
  'ligue-1',
])

export type LeagueId = z.infer<typeof leagueIdSchema>

export type LeagueFlagCode = 'england' | 'es' | 'de' | 'it' | 'fr'

export type LeagueConfig = {
  id: LeagueId
  label: string
  country: string
  flagCode: LeagueFlagCode
  theSportsDbLeagueId: string
}

export const LEAGUES: readonly LeagueConfig[] = [
  {
    id: 'premier-league',
    label: 'Premier League',
    country: 'England',
    flagCode: 'england',
    theSportsDbLeagueId: '4328',
  },
  {
    id: 'la-liga',
    label: 'La Liga',
    country: 'Spain',
    flagCode: 'es',
    theSportsDbLeagueId: '4335',
  },
  {
    id: 'bundesliga',
    label: 'Bundesliga',
    country: 'Germany',
    flagCode: 'de',
    theSportsDbLeagueId: '4331',
  },
  {
    id: 'serie-a',
    label: 'Serie A',
    country: 'Italy',
    flagCode: 'it',
    theSportsDbLeagueId: '4332',
  },
  {
    id: 'ligue-1',
    label: 'Ligue 1',
    country: 'France',
    flagCode: 'fr',
    theSportsDbLeagueId: '4334',
  },
] as const

export const leagueConfigById = Object.fromEntries(
  LEAGUES.map((league) => [league.id, league]),
) as Record<LeagueId, LeagueConfig>

export function getLeagueConfig(leagueId: LeagueId) {
  return leagueConfigById[leagueId]
}
