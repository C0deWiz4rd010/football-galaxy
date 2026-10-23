/**
 * ESPN endpoints. Kept free of imports so vite.config.ts can use it too: the
 * build writes the league core URLs into index.html, which starts those
 * requests while the JavaScript is still loading (see `preloadLeagueData`).
 */
export const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
export const WEB = 'https://site.web.api.espn.com/apis/v2/sports/soccer'
export const COMMON = 'https://site.web.api.espn.com/apis/common/v3/sports/soccer'

export const espnSlugByLeague = {
  'premier-league': 'eng.1',
  bundesliga: 'ger.1',
  'la-liga': 'esp.1',
  'serie-a': 'ita.1',
  'ligue-1': 'fra.1',
} as const

/** The four calls behind a league dashboard, in the order the loader awaits them. */
export function leagueCoreUrls(slug: string) {
  return {
    teams: `${SITE}/${slug}/teams`,
    standings: `${WEB}/${slug}/standings`,
    scoreboard: `${SITE}/${slug}/scoreboard`,
    statistics: `${SITE}/${slug}/statistics`,
  }
}
