import type { League, LeagueId } from '@/services/types'
import { createLeagueLogo } from './visualAssets'

export const leagues: League[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'England',
    apiCode: 'PL',
    abbreviation: 'PL',
    theSportsDbLeagueId: '4328',
    theSportsDbLeagueName: 'English Premier League',
    color: '#3d195b',
    accentClass: 'text-pl',
    logo: createLeagueLogo('PL', '#3d195b', 'Premier League'),
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'Spain',
    apiCode: 'PD',
    abbreviation: 'LL',
    theSportsDbLeagueId: '4335',
    theSportsDbLeagueName: 'Spanish La Liga',
    color: '#003f8f',
    accentClass: 'text-ll',
    logo: createLeagueLogo('LL', '#003f8f', 'La Liga'),
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Germany',
    apiCode: 'BL1',
    abbreviation: 'BL',
    theSportsDbLeagueId: '4331',
    theSportsDbLeagueName: 'German Bundesliga',
    color: '#d3010c',
    accentClass: 'text-bl',
    logo: createLeagueLogo('BL', '#d3010c', 'Bundesliga'),
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    country: 'Italy',
    apiCode: 'SA',
    abbreviation: 'SA',
    theSportsDbLeagueId: '4332',
    theSportsDbLeagueName: 'Italian Serie A',
    color: '#009246',
    accentClass: 'text-sa',
    logo: createLeagueLogo('SA', '#009246', 'Serie A'),
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    country: 'France',
    apiCode: 'FL1',
    abbreviation: 'L1',
    theSportsDbLeagueId: '4334',
    theSportsDbLeagueName: 'French Ligue 1',
    color: '#091c3e',
    accentClass: 'text-l1',
    logo: createLeagueLogo('L1', '#091c3e', 'Ligue 1'),
  },
]

export const defaultLeagueId: LeagueId = 'premier-league'

export function getLeague(leagueId: string | undefined) {
  return leagues.find((league) => league.id === leagueId) ?? leagues[0]!
}

export function isLeagueId(value: string | undefined): value is LeagueId {
  return leagues.some((league) => league.id === value)
}
