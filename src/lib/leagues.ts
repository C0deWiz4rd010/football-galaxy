import bundesligaLogo from '@/assets/leagues/bundesliga.png'
import laLigaLogo from '@/assets/leagues/la-liga.png'
import ligue1Logo from '@/assets/leagues/ligue-1.png'
import premierLeagueLogo from '@/assets/leagues/premier-league.png'
import serieALogo from '@/assets/leagues/serie-a.png'
import type { League, LeagueId } from '@/services/types'

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
    logo: premierLeagueLogo,
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
    logo: laLigaLogo,
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
    logo: bundesligaLogo,
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
    logo: serieALogo,
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
    logo: ligue1Logo,
  },
]

export const defaultLeagueId: LeagueId = 'premier-league'

export function getLeague(leagueId: string | undefined) {
  return leagues.find((league) => league.id === leagueId) ?? leagues[0]!
}

export function isLeagueId(value: string | undefined): value is LeagueId {
  return leagues.some((league) => league.id === value)
}
