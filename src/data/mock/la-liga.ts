import { createMockLeague } from './createMockLeague'

// Auto-generated from standings-snapshot.json (real 2025-26 data via football-data.org).
// Run `node scripts/build-mock-data.mjs` to regenerate after refreshing the snapshot.
const realTeams = [
  { name: 'FC Barcelona', shortName: 'Barça', tla: 'FCB', crest: 'https://crests.football-data.org/81.png', color: '#A50044', points: 91, played: 36, won: 30, drawn: 1, lost: 5, goalsFor: 91, goalsAgainst: 32, form: ['W', 'W', 'L', 'W', 'W'] as const },
  { name: 'Real Madrid CF', shortName: 'Real Madrid', tla: 'RMA', crest: 'https://crests.football-data.org/86.png', color: '#FEBE10', points: 80, played: 36, won: 25, drawn: 5, lost: 6, goalsFor: 72, goalsAgainst: 33, form: ['W', 'W', 'W', 'D', 'W'] as const },
  { name: 'Villarreal CF', shortName: 'Villarreal', tla: 'VIL', crest: 'https://crests.football-data.org/94.png', color: '#F7D616', points: 69, played: 36, won: 21, drawn: 6, lost: 9, goalsFor: 67, goalsAgainst: 43, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { name: 'Club Atlético de Madrid', shortName: 'Atleti', tla: 'ATL', crest: 'https://crests.football-data.org/78.png', color: '#C00D1E', points: 66, played: 36, won: 20, drawn: 6, lost: 10, goalsFor: 60, goalsAgainst: 39, form: ['W', 'L', 'D', 'D', 'W'] as const },
  { name: 'Real Betis Balompié', shortName: 'Real Betis', tla: 'BET', crest: 'https://crests.football-data.org/90.png', color: '#00954C', points: 57, played: 36, won: 14, drawn: 15, lost: 7, goalsFor: 56, goalsAgainst: 44, form: ['L', 'D', 'L', 'D', 'W'] as const },
  { name: 'RC Celta de Vigo', shortName: 'Celta', tla: 'CEL', crest: 'https://crests.football-data.org/558.png', color: '#66CCFF', points: 50, played: 36, won: 13, drawn: 11, lost: 12, goalsFor: 51, goalsAgainst: 47, form: ['L', 'W', 'W', 'D', 'D'] as const },
  { name: 'Getafe CF', shortName: 'Getafe', tla: 'GET', crest: 'https://crests.football-data.org/82.png', color: '#1B3669', points: 48, played: 36, won: 14, drawn: 6, lost: 16, goalsFor: 31, goalsAgainst: 37, form: ['L', 'W', 'W', 'D', 'D'] as const },
  { name: 'Real Sociedad de Fútbol', shortName: 'Real Sociedad', tla: 'RSO', crest: 'https://crests.football-data.org/92.png', color: '#0067A5', points: 45, played: 36, won: 11, drawn: 12, lost: 13, goalsFor: 55, goalsAgainst: 56, form: ['D', 'L', 'D', 'D', 'D'] as const },
  { name: 'Athletic Club', shortName: 'Athletic', tla: 'ATH', crest: 'https://crests.football-data.org/77.png', color: '#EE2523', points: 44, played: 36, won: 13, drawn: 5, lost: 18, goalsFor: 40, goalsAgainst: 53, form: ['W', 'L', 'L', 'W', 'L'] as const },
  { name: 'Rayo Vallecano de Madrid', shortName: 'Rayo Vallecano', tla: 'RAY', crest: 'https://crests.football-data.org/87.png', color: '#CF111D', points: 44, played: 36, won: 10, drawn: 14, lost: 12, goalsFor: 37, goalsAgainst: 43, form: ['W', 'D', 'L', 'D', 'L'] as const },
  { name: 'Valencia CF', shortName: 'Valencia', tla: 'VAL', crest: 'https://crests.football-data.org/95.png', color: '#EE6F00', points: 43, played: 36, won: 11, drawn: 10, lost: 15, goalsFor: 39, goalsAgainst: 51, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'Sevilla FC', shortName: 'Sevilla FC', tla: 'SEV', crest: 'https://crests.football-data.org/559.png', color: '#D2010D', points: 43, played: 36, won: 12, drawn: 7, lost: 17, goalsFor: 46, goalsAgainst: 58, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'CA Osasuna', shortName: 'Osasuna', tla: 'OSA', crest: 'https://crests.football-data.org/79.png', color: '#D20026', points: 42, played: 36, won: 11, drawn: 9, lost: 16, goalsFor: 43, goalsAgainst: 47, form: ['L', 'L', 'D', 'W', 'L'] as const },
  { name: 'RCD Espanyol de Barcelona', shortName: 'Espanyol', tla: 'ESP', crest: 'https://crests.football-data.org/80.png', color: '#005BAB', points: 42, played: 36, won: 11, drawn: 9, lost: 16, goalsFor: 40, goalsAgainst: 53, form: ['D', 'L', 'L', 'W', 'L'] as const },
  { name: 'Girona FC', shortName: 'Girona', tla: 'GIR', crest: 'https://crests.football-data.org/298.png', color: '#CD2418', points: 40, played: 36, won: 9, drawn: 13, lost: 14, goalsFor: 38, goalsAgainst: 53, form: ['W', 'D', 'L', 'W', 'W'] as const },
  { name: 'Deportivo Alavés', shortName: 'Alavés', tla: 'ALA', crest: 'https://crests.football-data.org/263.png', color: '#155285', points: 40, played: 36, won: 10, drawn: 10, lost: 16, goalsFor: 42, goalsAgainst: 54, form: ['W', 'W', 'W', 'L', 'W'] as const },
  { name: 'Elche CF', shortName: 'Elche', tla: 'ELC', crest: 'https://crests.football-data.org/285.png', color: '#0E5D33', points: 39, played: 36, won: 9, drawn: 12, lost: 15, goalsFor: 47, goalsAgainst: 56, form: ['L', 'W', 'D', 'L', 'W'] as const },
  { name: 'RCD Mallorca', shortName: 'Mallorca', tla: 'MAL', crest: 'https://crests.football-data.org/89.png', color: '#C8102E', points: 39, played: 36, won: 10, drawn: 9, lost: 17, goalsFor: 44, goalsAgainst: 55, form: ['L', 'L', 'L', 'L', 'W'] as const },
  { name: 'Levante UD', shortName: 'Levante', tla: 'LEV', crest: 'https://crests.football-data.org/88.png', color: '#B5232D', points: 39, played: 36, won: 10, drawn: 9, lost: 17, goalsFor: 44, goalsAgainst: 59, form: ['L', 'L', 'L', 'L', 'W'] as const },
  { name: 'Real Oviedo', shortName: 'Real Oviedo', tla: 'OVI', crest: 'https://crests.football-data.org/1048.png', color: '#1B3D7A', points: 29, played: 36, won: 6, drawn: 11, lost: 19, goalsFor: 26, goalsAgainst: 56, form: ['D', 'D', 'W', 'L', 'D'] as const },
] as const

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'la-liga',
  seed: 17,
  realTeams: realTeams.map((t) => ({ ...t, form: [...t.form] })),
})
