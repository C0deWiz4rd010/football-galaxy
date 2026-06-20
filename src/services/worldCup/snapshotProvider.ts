/**
 * Free, offline World Cup fallback provider.
 *
 * The World Cup area used to be live-only against API-Football, so without a
 * configured key (or when offline) it rendered nothing. This provider keeps the
 * area functional for free: it returns the real, static tournament shell (host
 * nations, window, format) plus a clearly-labelled structural snapshot of the
 * 12-group field. Every payload is tagged `provider: 'snapshot'` /
 * `confidence: 'snapshot'` so the UI can show an honest "Offline snapshot"
 * badge and never present placeholder data as official live results.
 */

import { worldCupTournament } from './tournament'
import type {
  DataQualityMeta,
  WorldCupBracketRound,
  WorldCupDashboard,
  WorldCupFixture,
  WorldCupGroupStanding,
  WorldCupProvider,
  WorldCupSquad,
  WorldCupTeam,
} from './types'

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

const SNAPSHOT_NOTE =
  'Offline snapshot — connect a live source for confirmed teams, fixtures and standings.'

function snapshotQuality(overrides: Partial<DataQualityMeta> = {}): DataQualityMeta {
  const now = new Date().toISOString()
  return {
    provider: 'snapshot',
    fetchedAt: now,
    lastUpdated: now,
    isLive: false,
    confidence: 'snapshot',
    note: SNAPSHOT_NOTE,
    ...overrides,
  }
}

// The three host nations are the only teams confirmed independently of the
// live draw, so they are the only "real" teams the offline shell exposes.
const hostTeams: WorldCupTeam[] = worldCupTournament.hostCountries.map((country, index) => ({
  id: `wc-host-${country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: country,
  code: country.slice(0, 3).toUpperCase(),
  country,
  group: GROUP_LETTERS[index],
  placeholder: false,
}))

function placeholderTeam(group: string, seed: number): WorldCupTeam {
  return {
    id: `wc-${group.toLowerCase()}-${seed}`,
    name: 'To be confirmed',
    code: `${group}${seed}`,
    country: `Group ${group} · Seed ${seed}`,
    group,
    placeholder: true,
  }
}

function buildGroups(): WorldCupGroupStanding[] {
  return GROUP_LETTERS.flatMap((group) =>
    Array.from({ length: 4 }, (_, slot) => {
      const seed = slot + 1
      const host = hostTeams.find((team) => team.group === group && seed === 1)
      const team = host ?? placeholderTeam(group, seed)
      return {
        id: `${team.id}-world-cup-standing`,
        group,
        rank: seed,
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: [],
        qualificationHint: seed <= 2 ? 'top-two' : seed === 3 ? 'best-third-watch' : 'pending',
        quality: snapshotQuality(),
      } satisfies WorldCupGroupStanding
    }),
  )
}

function buildDashboard(): WorldCupDashboard {
  return {
    tournament: worldCupTournament,
    quality: snapshotQuality(),
    liveMatches: [],
    upcomingMatches: [],
    recentMatches: [],
    groups: buildGroups(),
    teams: hostTeams,
    bracket: [],
  }
}

function emptySquad(teamId: string): WorldCupSquad {
  return { teamId, players: [], quality: snapshotQuality() }
}

export const snapshotWorldCupProvider: WorldCupProvider = {
  getDashboard() {
    return Promise.resolve(buildDashboard())
  },
  getFixtures(): Promise<WorldCupFixture[]> {
    return Promise.resolve([])
  },
  getLiveFixtures(): Promise<WorldCupFixture[]> {
    return Promise.resolve([])
  },
  getGroups() {
    return Promise.resolve(buildGroups())
  },
  getTeams() {
    return Promise.resolve(hostTeams)
  },
  getTeam(teamId: string) {
    const team =
      hostTeams.find(
        (item) => item.id === teamId || item.code.toLowerCase() === teamId.toLowerCase(),
      ) ?? hostTeams[0]
    if (!team) {
      return Promise.reject(new Error('World Cup team not available offline.'))
    }
    return Promise.resolve({ team, squad: emptySquad(team.id), fixtures: [] })
  },
  getFixture() {
    return Promise.reject(new Error('Match details require a live World Cup source.'))
  },
  getFixtureLineups() {
    return Promise.resolve([])
  },
  getFixtureStatistics() {
    return Promise.resolve([])
  },
  getBracket(): Promise<WorldCupBracketRound[]> {
    return Promise.resolve([])
  },
}
