/**
 * The app's navigation in one place. Sidebar, mobile menu, tab bar and the
 * command palette all render from these lists, so a route is added once.
 */
import { BarChart3, CalendarDays, Globe2, Grid3X3, LayoutDashboard, RadioTower, Settings, Shield, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { MessageKey } from '@/i18n/de'
import type { LeagueId } from '@/services/types'

export interface NavItem {
  to: string
  /** Locale key of the label. */
  labelKey: MessageKey
  /** Shorter label for tight grids (mobile menu). */
  shortLabelKey?: MessageKey
  icon: LucideIcon
  /** Match only the exact path (overview routes with children). */
  end?: boolean
  tone?: 'live' | 'gold'
}

export const exploreNav: NavItem[] = [
  { to: '/live', labelKey: 'liveScores', icon: RadioTower, tone: 'live' },
  { to: '/players', labelKey: 'playersExplorer', icon: Users },
  { to: '/teams', labelKey: 'teamsExplorer', icon: Shield },
  { to: '/galaxy', labelKey: 'galaxyMap', icon: Globe2 },
]

export const worldCupNav: NavItem[] = [
  { to: '/world-cup-2026', labelKey: 'wcOverview', icon: LayoutDashboard, end: true, tone: 'gold' },
  { to: '/world-cup-2026/matches', labelKey: 'wcMatches', icon: CalendarDays, tone: 'gold' },
  { to: '/world-cup-2026/groups', labelKey: 'wcGroups', icon: Grid3X3, tone: 'gold' },
  { to: '/world-cup-2026/bracket', labelKey: 'wcBracket', shortLabelKey: 'wcBracketShort', icon: Trophy, tone: 'gold' },
  { to: '/world-cup-2026/teams', labelKey: 'wcTeams', icon: Users, tone: 'gold' },
]

export const toolsNav: NavItem[] = [
  { to: '/compare', labelKey: 'comparePlayers', shortLabelKey: 'compare', icon: BarChart3 },
  { to: '/settings', labelKey: 'settings', icon: Settings },
]

const LAST_LEAGUE_KEY = 'fg-last-league'

/** The league the user looked at last (tab bar "League" target). */
export function readLastLeague(): LeagueId | null {
  try {
    return (localStorage.getItem(LAST_LEAGUE_KEY) as LeagueId | null) ?? null
  } catch {
    return null
  }
}

export function rememberLeague(leagueId: LeagueId) {
  try {
    localStorage.setItem(LAST_LEAGUE_KEY, leagueId)
  } catch {
    // Storage unavailable (private mode): the tab bar falls back to the default league.
  }
}
