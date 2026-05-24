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
  341:   42985,   // Manuel Neuer (Bayern)
  8004:  47447,   // Harry Kane (Bayern)
  144393: 323485, // Jamal Musiala (Bayern)
  113765: 339516, // Michael Olise (Bayern)
  359:   218585,  // Joshua Kimmich (Bayern)
  3181:  234498,  // Leon Goretzka (Bayern)
  9541:  286012,  // Dayot Upamecano (Bayern)
  21288: 281508,  // Alphonso Davies (Bayern)
  22396: 238794,  // Luis Díaz (Bayern)
  311:   211002,  // Serge Gnabry (Bayern)
  82515: 328454,  // Karim Adeyemi (Dortmund)
  148:   188581,  // Julian Brandt (Dortmund)
  334:   283218,  // Gregor Kobel (Dortmund)
  211:   318760,  // Sehrou Guirassy (Dortmund)
  171692: 361609, // Jobe Bellingham (Dortmund)
  // ── La Liga ───────────────────────────────────────────────────────────────
  133860: 312555, // Pedri (Barcelona)
  371:   41655,   // Robert Lewandowski (Barcelona)
  37428: 239074,  // Raphinha (Barcelona)
  202283: 360347, // Lamine Yamal (Barcelona)
  7559:  229481,  // Frenkie de Jong (Barcelona)
  23132: 235866,  // Dani Olmo (Barcelona)
  8499:  265918,  // Jules Koundé (Barcelona)
  28292: 282574,  // Ronald Araújo (Barcelona)
  33154: 293547,  // Ferrán Torres (Barcelona)
  3331:  238600,  // Marcus Rashford (Barcelona)
  1556:  241649,  // Vinicius Junior (Real Madrid)
  3374:  272335,  // Kylian Mbappé (Real Madrid)
  125010: 334381, // Jude Bellingham (Real Madrid)
  1324:  266010,  // Rodrygo (Real Madrid)
  96:    249013,  // Federico Valverde (Real Madrid)
  102343: 322060, // Eduardo Camavinga (Real Madrid)
  8514:  319079,  // Aurélien Tchouameni (Real Madrid)
  7867:  236779,  // Trent Alexander-Arnold (Real Madrid)
  3641:  102300,  // Thibaut Courtois (Real Madrid)
  3177:  192820,  // Antonio Rüdiger (Real Madrid)
  // ── Serie A ──────────────────────────────────────────────────────────────
  3220:  248028,  // Lautaro Martínez (Inter)
  1911:  221018,  // Nicolò Barella (Inter)
  1754:  188785,  // Hakan Çalhanoğlu (Inter)
  1834:  276020,  // Alessandro Bastoni (Inter)
  8685:  311534,  // Marcus Thuram (Inter)
  7417:  230620,  // Denzel Dumfries (Inter)
  // ── Ligue 1 ──────────────────────────────────────────────────────────────
  113285: 351490, // Khvicha Kvaratskhelia (PSG)
  53:    232679,  // Achraf Hakimi (PSG)
  3373:  228705,  // Ousmane Dembélé (PSG)
  3225:  163376,  // Marquinhos (PSG)
  190877: 338866, // Joao Neves (PSG)
  186089: 356021, // Warren Zaïre-Emery (PSG)
  172762: 349527, // Bradley Barcola (PSG)
  101431: 320499, // Gonçalo Ramos (PSG)
  178722: 335620, // Vitinha (PSG)
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
