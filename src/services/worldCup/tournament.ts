// Fixed reference facts about the FIFA World Cup 2026. These are not mock match
// data — they are static tournament metadata (host nations, venue cities, the
// official window and field size) that the live API does not return as a single
// payload. Live fixtures, standings, teams and brackets always come from
// API-Football; only this descriptive shell is hard-coded.
export const worldCupTournament = {
  id: 'world-cup-2026' as const,
  name: 'World Cup 2026',
  season: '2026',
  startsAt: '2026-06-11T00:00:00Z',
  endsAt: '2026-07-19T23:59:59Z',
  hostCountries: ['Canada', 'Mexico', 'United States'],
  hostCities: [
    'Atlanta',
    'Boston',
    'Dallas',
    'Guadalajara',
    'Houston',
    'Kansas City',
    'Los Angeles',
    'Mexico City',
    'Miami',
    'Monterrey',
    'New York/New Jersey',
    'Philadelphia',
    'San Francisco Bay Area',
    'Seattle',
    'Toronto',
    'Vancouver',
  ],
  // Expanded 2026 format: 48 teams, 12 groups of four, 104 matches.
  teamCount: 48,
  groupCount: 12,
  matchCount: 104,
}

export type WorldCupTournament = typeof worldCupTournament
