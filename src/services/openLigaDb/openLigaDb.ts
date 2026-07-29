/**
 * OpenLigaDB provider (Bundesliga).
 *
 * OpenLigaDB is a free, key-less, community-run API with authoritative German
 * Bundesliga data. We use it as an additional live source in the cascade so
 * that when football-data.org is rate-limited (10 req/min) or TheSportsDB is
 * flaky, the Bundesliga table still resolves to real data instead of an error.
 *
 * The host (`api.openligadb.de`) is on the proxy allowlist. Responses are
 * Zod-validated leniently so an upstream shape change degrades gracefully.
 */

import { z } from 'zod'

import { leagues } from '@/lib/leagues'
import { createTeamCrest, normalizeImageSrc } from '@/lib/visualAssets'
import { fetchLiveJson } from '@/services/net/liveClient'

import type { FootballQueryParams, LeagueId, Standing, Team } from '../types'

const API_BASE = 'https://api.openligadb.de'
/** OpenLigaDB league shortcut for the men's first Bundesliga. */
const BUNDESLIGA_SHORTCUT = 'bl1'

/** OpenLigaDB seasons are keyed by their starting year (e.g. 2025 → 2025/26). */
function seasonStartYear(season: string | undefined): number {
  if (season) {
    const match = /^(\d{4})/.exec(season.trim())
    if (match) return Number(match[1])
  }
  const now = new Date()
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
}

function bundesligaConfig() {
  const league = leagues.find((entry) => entry.id === 'bundesliga')
  if (!league) throw new Error('Bundesliga config missing')
  return league
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const tableEntrySchema = z.object({
  teamInfoId: z.number().optional(),
  teamName: z.string().optional(),
  shortName: z.string().optional(),
  teamIconUrl: z.string().optional(),
  points: z.number().optional(),
  opponentGoals: z.number().optional(),
  goals: z.number().optional(),
  matches: z.number().optional(),
  won: z.number().optional(),
  lost: z.number().optional(),
  draw: z.number().optional(),
  goalDiff: z.number().optional(),
})

const tableSchema = z.array(tableEntrySchema)

type TableEntry = z.infer<typeof tableEntrySchema>

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapTeam(entry: TableEntry, index: number): Team {
  const league = bundesligaConfig()
  const name = entry.teamName?.trim() || entry.shortName?.trim() || 'Unknown Team'
  const shortName = entry.shortName?.trim() || name
  const crestUrl = normalizeImageSrc(entry.teamIconUrl)
  const syntheticCrest = createTeamCrest(
    shortName.slice(0, 3).toUpperCase(),
    league.color,
    '#f4f4f5',
    index,
  )
  return {
    id: `oldb-${entry.teamInfoId ?? index}`,
    leagueId: 'bundesliga',
    name,
    shortName,
    crest: crestUrl ?? syntheticCrest,
    crestSources: crestUrl ? [crestUrl] : undefined,
    primaryColor: league.color,
    secondaryColor: '#f4f4f5',
  }
}

function mapStanding(entry: TableEntry, index: number): Standing {
  const team = mapTeam(entry, index)
  const goalsFor = entry.goals ?? 0
  const goalsAgainst = entry.opponentGoals ?? 0
  return {
    id: `${team.id}-standing`,
    leagueId: 'bundesliga',
    position: index + 1,
    team,
    played: entry.matches ?? 0,
    won: entry.won ?? 0,
    drawn: entry.draw ?? 0,
    lost: entry.lost ?? 0,
    goalsFor,
    goalsAgainst,
    goalDifference: entry.goalDiff ?? goalsFor - goalsAgainst,
    points: entry.points ?? 0,
    form: [],
    avgPossession: 50,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the current Bundesliga table from OpenLigaDB. Throws for any other
 * league so the cascade in `footballData.ts` skips this source cleanly.
 */
export async function getStandings(
  params: FootballQueryParams = {},
): Promise<Standing[]> {
  const leagueId: LeagueId = params.leagueId ?? 'premier-league'
  if (leagueId !== 'bundesliga') {
    throw new Error('OpenLigaDB only provides Bundesliga data')
  }

  const year = seasonStartYear(params.season)
  const url = `${API_BASE}/getbltable/${BUNDESLIGA_SHORTCUT}/${year}`
  const raw = await fetchLiveJson<unknown>(url)
  const table = tableSchema.parse(raw)

  if (table.length === 0) {
    throw new Error('OpenLigaDB returned an empty Bundesliga table')
  }

  return table.map((entry, index) => mapStanding(entry, index))
}
