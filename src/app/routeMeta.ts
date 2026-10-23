import type { MessageKey } from '@/i18n/de'
import { getLeague, isLeagueId } from '@/lib/leagues'
import type { LeagueId } from '@/services/types'

export interface RouteMeta {
  title: string
  subtitle: string
  /** For `<meta name="description">` and link previews. */
  description: string
  leagueId?: LeagueId
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

/** Top-level sections by their first path segment. */
const SECTIONS: Record<string, { title: MessageKey; subtitle: MessageKey; description: MessageKey }> = {
  galaxy: { title: 'galaxyMap', subtitle: 'subtitleExplore', description: 'metaDescGalaxy' },
  live: { title: 'liveScores', subtitle: 'liveScoresSubtitle', description: 'metaDescLive' },
  'world-cup-2026': { title: 'worldCup2026', subtitle: 'worldCupSubtitle', description: 'metaDescWorldCup' },
  players: { title: 'playersExplorer', subtitle: 'subtitlePlayers', description: 'metaDescPlayers' },
  teams: { title: 'teamsExplorer', subtitle: 'subtitleTeams', description: 'metaDescTeams' },
  compare: { title: 'comparePlayers', subtitle: 'subtitleCompare', description: 'metaDescCompare' },
  settings: { title: 'settings', subtitle: 'settingsSubtitle', description: 'metaDescDefault' },
}

/** Pages below a league: `/:league/team/:id`, `/:league/team/:id/coach`, `/:league/player/:id`. */
const LEAGUE_PAGES = {
  team: { title: 'teamDetailTitle', description: 'metaDescTeam' },
  coach: { title: 'coachDetailTitle', description: 'metaDescTeam' },
  player: { title: 'playerDetailTitle', description: 'metaDescPlayer' },
} as const satisfies Record<string, { title: MessageKey; description: MessageKey }>

/** Header title, subtitle and document meta for a path — one table instead of an if-chain. */
export function routeMeta(pathname: string, t: Translate): RouteMeta {
  const [first = '', second, , fourth] = pathname.split('/').filter(Boolean)
  const section = SECTIONS[first]
  if (section) {
    return { title: t(section.title), subtitle: t(section.subtitle), description: t(section.description) }
  }

  const league = getLeague(isLeagueId(first) ? first : undefined)
  const subtitle = `Football Galaxy / ${league.name}`
  const page = second === 'team' ? (fourth === 'coach' ? LEAGUE_PAGES.coach : LEAGUE_PAGES.team) : second === 'player' ? LEAGUE_PAGES.player : undefined
  if (page) {
    return { title: t(page.title), subtitle, description: t(page.description, { league: league.name }), leagueId: league.id }
  }
  return { title: league.name, subtitle, description: t('metaDescLeague', { league: league.name }), leagueId: league.id }
}
