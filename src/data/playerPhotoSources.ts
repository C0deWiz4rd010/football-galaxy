/**
 * Static mapping of football-data.org player IDs to ESPN photo CDN URLs.
 * Used by createPlayerFromReal() to populate photoSources so real headshots
 * are tried before falling back to the generated SVG avatar.
 *
 * ESPN CDN format:
 *   https://a.espncdn.com/i/headshots/soccer/players/full/{espnId}.png
 *
 * Mapping key = football-data.org numeric player ID
 * Mapping value = ESPN player ID
 */

const FD_TO_ESPN: Record<number, number> = {
  // ── Premier League ────────────────────────────────────────────────────────
  99813: 246669,  // Bukayo Saka (Arsenal)
  8215:  242085,  // Declan Rice (Arsenal)
  7427:  215250,  // Martin Ødegaard (Arsenal)
  80171: 264174,  // William Saliba (Arsenal)
  98816: 272481,  // Jurrien Timber (Arsenal)
  61450: 270989,  // Martinelli (Arsenal)
  171:   275981,  // Kai Havertz (Arsenal)
  6154:  222600,  // Ben White (Arsenal)
  23128: 230621,  // Gabriel (Arsenal)
  3236:  186590,  // Gabriel Jesus (Arsenal)
  8279:  352946,  // Viktor Gyökeres (Arsenal)
  7935:  219499,  // Mikel Merino (Arsenal)
  38101: 241337,  // Erling Haaland (Man City)
  7888:  241022,  // Phil Foden (Man City)
  3199:  241084,  // Rodri (Man City)
  3254:  198499,  // Bernardo Silva (Man City)
  10183: 240589,  // Rúben Dias (Man City)
  3313:  206913,  // John Stones (Man City)
  99775: 280679,  // Jeremy Doku (Man City)
  66896: 296264,  // Omar Marmoush (Man City)
  7696:  357075,  // Tijjani Reijnders (Man City)
  65:    194766,  // Mateo Kovačić (Man City)
  // ── Bundesliga ────────────────────────────────────────────────────────────
  // harry kane id in fd.org may differ; leaving common ones
  // ── La Liga ───────────────────────────────────────────────────────────────
  // ── Serie A ──────────────────────────────────────────────────────────────
  // ── Ligue 1 ──────────────────────────────────────────────────────────────
}

const ESPN_CDN = 'https://a.espncdn.com/i/headshots/soccer/players/full'
const ESPN_CDN_LARGE = 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full'

/**
 * Returns an ordered list of photo URL candidates for a player identified by
 * their football-data.org numeric ID.  Returns an empty array when no mapping
 * is known — the caller then falls back to the generated SVG avatar.
 */
export function getEspnPhotoSources(fdPlayerId: number | string): string[] {
  const id = Number(fdPlayerId)
  const espnId = FD_TO_ESPN[id]
  if (!espnId) return []
  return [
    `${ESPN_CDN_LARGE}/${espnId}.png&w=350&h=254&cb=1`,
    `${ESPN_CDN}/${espnId}.png`,
  ]
}
