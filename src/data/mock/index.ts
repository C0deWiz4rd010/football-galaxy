import * as bundesliga from './bundesliga'
import * as laLiga from './la-liga'
import * as ligue1 from './ligue-1'
import * as premierLeague from './premier-league'
import * as serieA from './serie-a'
import type { LeagueId } from '@/services/types'

export const mockData = {
  'premier-league': premierLeague,
  bundesliga,
  'la-liga': laLiga,
  'serie-a': serieA,
  'ligue-1': ligue1,
} satisfies Record<LeagueId, typeof premierLeague>
