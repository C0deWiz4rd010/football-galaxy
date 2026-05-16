import { createMockLeague } from './createMockLeague'

// Auto-generated from standings-snapshot.json (real 2025-26 data via football-data.org).
// Run `node scripts/build-mock-data.mjs` to regenerate after refreshing the snapshot.
const realTeams = [
  { name: 'Paris Saint-Germain FC', shortName: 'PSG', tla: 'PSG', crest: 'https://crests.football-data.org/524.png', color: '#003366', points: 76, played: 33, won: 24, drawn: 4, lost: 5, goalsFor: 73, goalsAgainst: 27, form: ['W', 'W', 'L', 'D', 'W'] as const },
  { name: 'Racing Club de Lens', shortName: 'RC Lens', tla: 'RCL', crest: 'https://crests.football-data.org/546.png', color: '#D0A650', points: 67, played: 33, won: 21, drawn: 4, lost: 8, goalsFor: 62, goalsAgainst: 35, form: ['W', 'W', 'W', 'D', 'W'] as const },
  { name: 'Lille OSC', shortName: 'Lille', tla: 'LIL', crest: 'https://crests.football-data.org/521.png', color: '#9A0022', points: 61, played: 33, won: 18, drawn: 7, lost: 8, goalsFor: 52, goalsAgainst: 35, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { name: 'Olympique Lyonnais', shortName: 'Olympique Lyon', tla: 'LYO', crest: 'https://crests.football-data.org/523.png', color: '#042D5C', points: 60, played: 33, won: 18, drawn: 6, lost: 9, goalsFor: 53, goalsAgainst: 36, form: ['W', 'L', 'D', 'D', 'W'] as const },
  { name: 'Stade Rennais FC 1901', shortName: 'Stade Rennais', tla: 'REN', crest: 'https://crests.football-data.org/529.png', color: '#810000', points: 59, played: 33, won: 17, drawn: 8, lost: 8, goalsFor: 58, goalsAgainst: 47, form: ['L', 'D', 'L', 'D', 'W'] as const },
  { name: 'Olympique de Marseille', shortName: 'Marseille', tla: 'MAR', crest: 'https://crests.football-data.org/516.png', color: '#00A0E2', points: 56, played: 33, won: 17, drawn: 5, lost: 11, goalsFor: 60, goalsAgainst: 44, form: ['L', 'W', 'W', 'W', 'W'] as const },
  { name: 'AS Monaco FC', shortName: 'Monaco', tla: 'ASM', crest: 'https://crests.football-data.org/548.png', color: '#D4AF37', points: 54, played: 33, won: 16, drawn: 6, lost: 11, goalsFor: 56, goalsAgainst: 49, form: ['D', 'W', 'W', 'W', 'D'] as const },
  { name: 'RC Strasbourg Alsace', shortName: 'Strasbourg', tla: 'RC', crest: 'https://crests.football-data.org/576.png', color: '#C8102E', points: 50, played: 33, won: 14, drawn: 8, lost: 11, goalsFor: 53, goalsAgainst: 43, form: ['W', 'L', 'D', 'W', 'D'] as const },
  { name: 'FC Lorient', shortName: 'Lorient', tla: 'FCL', crest: 'https://crests.football-data.org/525.png', color: '#F97316', points: 45, played: 33, won: 11, drawn: 12, lost: 10, goalsFor: 48, goalsAgainst: 49, form: ['W', 'L', 'D', 'D', 'D'] as const },
  { name: 'Toulouse FC', shortName: 'Toulouse', tla: 'TOU', crest: 'https://crests.football-data.org/511.png', color: '#6A0DAD', points: 44, played: 33, won: 12, drawn: 8, lost: 13, goalsFor: 47, goalsAgainst: 46, form: ['W', 'D', 'L', 'W', 'L'] as const },
  { name: 'Paris FC', shortName: 'Paris FC', tla: 'PFC', crest: 'https://crests.football-data.org/1045.png', color: '#0033A0', points: 41, played: 33, won: 10, drawn: 11, lost: 12, goalsFor: 45, goalsAgainst: 49, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'Stade Brestois 29', shortName: 'Brest', tla: 'BRE', crest: 'https://crests.football-data.org/512.png', color: '#C8102E', points: 38, played: 33, won: 10, drawn: 8, lost: 15, goalsFor: 42, goalsAgainst: 54, form: ['L', 'W', 'D', 'W', 'L'] as const },
  { name: 'Angers SCO', shortName: 'Angers SCO', tla: 'ANG', crest: 'https://crests.football-data.org/532.png', color: '#000000', points: 35, played: 33, won: 9, drawn: 8, lost: 16, goalsFor: 28, goalsAgainst: 47, form: ['L', 'L', 'L', 'W', 'L'] as const },
  { name: 'Le Havre AC', shortName: 'Le Havre', tla: 'HAC', crest: 'https://crests.football-data.org/533.png', color: '#0057A8', points: 32, played: 33, won: 6, drawn: 14, lost: 13, goalsFor: 30, goalsAgainst: 44, form: ['D', 'L', 'L', 'W', 'L'] as const },
  { name: 'AJ Auxerre', shortName: 'Auxerre', tla: 'AJA', crest: 'https://crests.football-data.org/519.png', color: '#003399', points: 31, played: 33, won: 7, drawn: 10, lost: 16, goalsFor: 32, goalsAgainst: 44, form: ['D', 'D', 'L', 'W', 'W'] as const },
  { name: 'OGC Nice', shortName: 'Nice', tla: 'NIC', crest: 'https://crests.football-data.org/522.png', color: '#CE1126', points: 31, played: 33, won: 7, drawn: 10, lost: 16, goalsFor: 37, goalsAgainst: 60, form: ['W', 'D', 'W', 'L', 'W'] as const },
  { name: 'FC Nantes', shortName: 'Nantes', tla: 'NAN', crest: 'https://crests.football-data.org/543.png', color: '#F7D616', points: 23, played: 33, won: 5, drawn: 8, lost: 20, goalsFor: 29, goalsAgainst: 52, form: ['L', 'W', 'L', 'L', 'W'] as const },
  { name: 'FC Metz', shortName: 'FC Metz', tla: 'FCM', crest: 'https://crests.football-data.org/545.png', color: '#9A0000', points: 16, played: 33, won: 3, drawn: 7, lost: 23, goalsFor: 32, goalsAgainst: 76, form: ['L', 'L', 'L', 'L', 'D'] as const },
] as const

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'ligue-1',
  seed: 29,
  realTeams: realTeams.map((t) => ({ ...t, form: [...t.form] })),
})
