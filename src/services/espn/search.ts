/**
 * Live search across the five supported leagues via ESPN's public search API.
 * Results outside the top-5 leagues (cups, other countries, women's leagues
 * with the same names) are filtered out so every hit links to a page we have.
 */
import { z } from 'zod'

import { fetchLiveJson } from '@/services/net/liveClient'
import type { LeagueId } from '@/services/types'

import { espnSlugByLeague } from './league'
import { espnPlayerId } from './players'

const SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search'

const leagueBySlug = new Map(
  (Object.entries(espnSlugByLeague) as Array<[LeagueId, string]>).map(([leagueId, slug]) => [slug, leagueId]),
)

const str = z.string().optional()
const itemSchema = z.object({
  id: str,
  displayName: str,
  league: str,
  isActive: z.boolean().optional(),
  headshot: z.object({ href: str }).optional(),
  logos: z.array(z.object({ href: str })).optional(),
  leagueRelationships: z.array(z.object({ core: z.object({ slug: str }).optional() })).optional(),
  teamRelationships: z.array(z.object({ displayName: str })).optional(),
})
const responseSchema = z.object({ items: z.array(itemSchema).optional() })

export interface SearchHit {
  kind: 'team' | 'player'
  id: string
  name: string
  leagueId: LeagueId
  subtitle?: string
  image?: string
}

async function searchType(type: 'team' | 'player', query: string, signal?: AbortSignal) {
  const url = `${SEARCH}?query=${encodeURIComponent(query)}&limit=25&type=${type}&sport=soccer`
  return responseSchema.parse(await fetchLiveJson<unknown>(url, { init: { signal }, maxRetries: 0 })).items ?? []
}

export async function searchFootball(query: string, signal?: AbortSignal): Promise<{ teams: SearchHit[]; players: SearchHit[] }> {
  const [teams, players] = await Promise.all([searchType('team', query, signal), searchType('player', query, signal)])

  return {
    teams: teams.flatMap((item): SearchHit[] => {
      const leagueId = leagueBySlug.get(item.league ?? '')
      if (!leagueId || !item.id || !item.displayName) return []
      return [{ kind: 'team', id: item.id, name: item.displayName, leagueId, image: item.logos?.[0]?.href }]
    }),
    players: players.flatMap((item): SearchHit[] => {
      if (!item.id || !item.displayName || item.isActive === false) return []
      const slugs = [item.league, ...(item.leagueRelationships ?? []).map((relation) => relation.core?.slug)]
      const leagueId = slugs.map((slug) => leagueBySlug.get(slug ?? '')).find(Boolean)
      if (!leagueId) return []
      return [
        {
          kind: 'player',
          id: espnPlayerId(item.id),
          name: item.displayName,
          leagueId,
          // ESPN appends the competition, e.g. "Liverpool (Club Friendly)".
          subtitle: item.teamRelationships?.[0]?.displayName?.replace(/\s*\(.*\)\s*$/, ''),
          image: item.headshot?.href,
        },
      ]
    }),
  }
}
