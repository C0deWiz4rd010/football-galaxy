import { createMockLeague } from './createMockLeague'

// Auto-generated from standings-snapshot.json (real 2025-26 data via football-data.org).
// Run `node scripts/build-mock-data.mjs` to regenerate after refreshing the snapshot.
const realTeams = [
  { name: 'FC Bayern München', shortName: 'Bayern', tla: 'FCB', crest: 'https://crests.football-data.org/5.png', color: '#DC052D', points: 89, played: 34, won: 28, drawn: 5, lost: 1, goalsFor: 120, goalsAgainst: 36, form: ['W', 'W', 'D', 'W', 'W'] as const },
  { name: 'Borussia Dortmund', shortName: 'Dortmund', tla: 'BVB', crest: 'https://crests.football-data.org/4.png', color: '#FDE100', points: 71, played: 34, won: 21, drawn: 8, lost: 5, goalsFor: 68, goalsAgainst: 34, form: ['W', 'W', 'W', 'D', 'W'] as const },
  { name: 'RB Leipzig', shortName: 'RB Leipzig', tla: 'RBL', crest: 'https://crests.football-data.org/721.png', color: '#DA011E', points: 65, played: 34, won: 20, drawn: 5, lost: 9, goalsFor: 66, goalsAgainst: 45, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { name: 'VfB Stuttgart', shortName: 'Stuttgart', tla: 'VFB', crest: 'https://crests.football-data.org/10.png', color: '#ED1C24', points: 64, played: 34, won: 19, drawn: 7, lost: 8, goalsFor: 71, goalsAgainst: 47, form: ['W', 'D', 'D', 'D', 'W'] as const },
  { name: 'TSG 1899 Hoffenheim', shortName: 'Hoffenheim', tla: 'TSG', crest: 'https://crests.football-data.org/2.png', color: '#1961AC', points: 61, played: 34, won: 18, drawn: 7, lost: 9, goalsFor: 65, goalsAgainst: 50, form: ['L', 'W', 'L', 'D', 'W'] as const },
  { name: 'Bayer 04 Leverkusen', shortName: 'Leverkusen', tla: 'B04', crest: 'https://crests.football-data.org/3.png', color: '#E32221', points: 59, played: 34, won: 17, drawn: 8, lost: 9, goalsFor: 67, goalsAgainst: 46, form: ['D', 'W', 'W', 'W', 'W'] as const },
  { name: 'SC Freiburg', shortName: 'Freiburg', tla: 'SCF', crest: 'https://crests.football-data.org/17.png', color: '#CC0000', points: 47, played: 34, won: 13, drawn: 8, lost: 13, goalsFor: 49, goalsAgainst: 57, form: ['D', 'W', 'W', 'D', 'D'] as const },
  { name: 'Eintracht Frankfurt', shortName: 'Frankfurt', tla: 'SGE', crest: 'https://crests.football-data.org/19.png', color: '#E1000F', points: 43, played: 34, won: 11, drawn: 10, lost: 13, goalsFor: 59, goalsAgainst: 65, form: ['D', 'L', 'D', 'D', 'D'] as const },
  { name: 'FC Augsburg', shortName: 'Augsburg', tla: 'FCA', crest: 'https://crests.football-data.org/16.png', color: '#BA3733', points: 43, played: 34, won: 12, drawn: 7, lost: 15, goalsFor: 45, goalsAgainst: 59, form: ['W', 'L', 'L', 'W', 'L'] as const },
  { name: '1. FSV Mainz 05', shortName: 'Mainz', tla: 'M05', crest: 'https://crests.football-data.org/15.png', color: '#C63126', points: 40, played: 34, won: 10, drawn: 10, lost: 14, goalsFor: 44, goalsAgainst: 53, form: ['W', 'D', 'L', 'W', 'L'] as const },
  { name: '1. FC Union Berlin', shortName: 'Union Berlin', tla: 'UNB', crest: 'https://crests.football-data.org/28.png', color: '#EB1923', points: 39, played: 34, won: 10, drawn: 9, lost: 15, goalsFor: 42, goalsAgainst: 58, form: ['L', 'D', 'W', 'W', 'L'] as const },
  { name: 'Borussia Mönchengladbach', shortName: 'M\'gladbach', tla: 'BMG', crest: 'https://crests.football-data.org/18.png', color: '#000000', points: 38, played: 34, won: 9, drawn: 11, lost: 14, goalsFor: 40, goalsAgainst: 53, form: ['L', 'W', 'D', 'W', 'L'] as const },
  { name: 'Hamburger SV', shortName: 'HSV', tla: 'HSV', crest: 'https://crests.football-data.org/7.png', color: '#1055A1', points: 38, played: 34, won: 9, drawn: 11, lost: 14, goalsFor: 39, goalsAgainst: 53, form: ['D', 'L', 'D', 'W', 'L'] as const },
  { name: 'SV Werder Bremen', shortName: 'Bremen', tla: 'SVW', crest: 'https://crests.football-data.org/12.png', color: '#1D9D54', points: 33, played: 34, won: 8, drawn: 9, lost: 17, goalsFor: 37, goalsAgainst: 58, form: ['D', 'L', 'L', 'W', 'L'] as const },
  { name: '1. FC Köln', shortName: '1. FC Köln', tla: 'KOE', crest: 'https://crests.football-data.org/1.png', color: '#ED1C24', points: 32, played: 34, won: 7, drawn: 11, lost: 16, goalsFor: 49, goalsAgainst: 61, form: ['D', 'D', 'L', 'W', 'W'] as const },
  { name: 'VfL Wolfsburg', shortName: 'Wolfsburg', tla: 'WOB', crest: 'https://crests.football-data.org/11.png', color: '#65B32E', points: 29, played: 34, won: 7, drawn: 8, lost: 19, goalsFor: 43, goalsAgainst: 68, form: ['W', 'D', 'W', 'L', 'W'] as const },
  { name: 'FC St. Pauli 1910', shortName: 'St. Pauli', tla: 'STP', crest: 'https://crests.football-data.org/20.png', color: '#5C3317', points: 26, played: 34, won: 6, drawn: 8, lost: 20, goalsFor: 28, goalsAgainst: 58, form: ['L', 'W', 'D', 'L', 'W'] as const },
  { name: '1. FC Heidenheim 1846', shortName: 'Heidenheim', tla: 'HEI', crest: 'https://crests.football-data.org/44.png', color: '#D00E10', points: 26, played: 34, won: 6, drawn: 8, lost: 20, goalsFor: 41, goalsAgainst: 72, form: ['L', 'L', 'L', 'L', 'D'] as const },
] as const

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'bundesliga',
  seed: 11,
  realTeams: realTeams.map((t) => ({ ...t, form: [...t.form] })),
})
