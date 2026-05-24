/**
 * Build ordered fallback image source chains for crests and player photos.
 * These chains are fed to `AssetImage`'s `fallbackSrc` array prop so a broken
 * primary URL transparently retries known alternates before showing the SVG.
 */

import type { Player, Team } from '@/services/types'

function dedupe(values: Array<string | undefined>): string[] {
  const out: string[] = []
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed && !out.includes(trimmed)) {
      out.push(trimmed)
    }
  }
  return out
}

/**
 * Returns every URL we know how to try for the team's crest, in order:
 * 1. Service-provided alternates (`crestSources`, set by adapters that
 *    discover multiple candidates).
 * 2. The primary `crest` (synthetic SVG when nothing else is known).
 */
export function getCrestSources(team: Pick<Team, 'crest' | 'crestSources'>): string[] {
  return dedupe([...(team.crestSources ?? []), team.crest])
}

/**
 * Same idea for player photos. The primary `photo` is the last entry so that
 * we exhaust real-photo candidates before falling back to the SVG avatar.
 */
export function getPlayerPhotoSources(player: Pick<Player, 'photo' | 'photoSources'>): string[] {
  return dedupe([...(player.photoSources ?? []), player.photo])
}
