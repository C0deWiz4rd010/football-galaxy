import { createMockLeague } from './createMockLeague'

// Auto-generated from standings-snapshot.json (real 2025-26 data via football-data.org).
// Run `node scripts/build-mock-data.mjs` to regenerate after refreshing the snapshot.
const realTeams = [
  { name: 'FC Internazionale Milano', shortName: 'Inter', tla: 'INT', crest: 'https://crests.football-data.org/108.png', color: '#010E80', points: 85, played: 36, won: 27, drawn: 4, lost: 5, goalsFor: 85, goalsAgainst: 31, form: ['W', 'W', 'L', 'D', 'W'] as const },
  { name: 'SSC Napoli', shortName: 'Napoli', tla: 'NAP', crest: 'https://crests.football-data.org/113.png', color: '#1874CD', points: 70, played: 36, won: 21, drawn: 7, lost: 8, goalsFor: 54, goalsAgainst: 36, form: ['W', 'W', 'W', 'D', 'W'] as const },
  { name: 'Juventus FC', shortName: 'Juventus', tla: 'JUV', crest: 'https://crests.football-data.org/109.png', color: '#000000', points: 68, played: 36, won: 19, drawn: 11, lost: 6, goalsFor: 59, goalsAgainst: 30, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { name: 'AC Milan', shortName: 'Milan', tla: 'MIL', crest: 'https://crests.football-data.org/98.png', color: '#FB090B', points: 67, played: 36, won: 19, drawn: 10, lost: 7, goalsFor: 50, goalsAgainst: 32, form: ['W', 'D', 'D', 'D', 'W'] as const },
  { name: 'AS Roma', shortName: 'Roma', tla: 'ROM', crest: 'https://crests.football-data.org/100.png', color: '#8E1F2F', points: 67, played: 36, won: 21, drawn: 4, lost: 11, goalsFor: 55, goalsAgainst: 31, form: ['L', 'W', 'L', 'W', 'W'] as const },
  { name: 'Como 1907', shortName: 'Como 1907', tla: 'COM', crest: 'https://crests.football-data.org/7397.png', color: '#0033A0', points: 65, played: 36, won: 18, drawn: 11, lost: 7, goalsFor: 60, goalsAgainst: 28, form: ['D', 'W', 'W', 'W', 'W'] as const },
  { name: 'Atalanta BC', shortName: 'Atalanta', tla: 'ATA', crest: 'https://crests.football-data.org/102.png', color: '#1C3E90', points: 58, played: 36, won: 15, drawn: 13, lost: 8, goalsFor: 50, goalsAgainst: 34, form: ['D', 'W', 'W', 'D', 'D'] as const },
  { name: 'Bologna FC 1909', shortName: 'Bologna', tla: 'BOL', crest: 'https://crests.football-data.org/103.png', color: '#CC0000', points: 52, played: 36, won: 15, drawn: 7, lost: 14, goalsFor: 45, goalsAgainst: 43, form: ['W', 'L', 'D', 'W', 'D'] as const },
  { name: 'SS Lazio', shortName: 'Lazio', tla: 'LAZ', crest: 'https://crests.football-data.org/110.png', color: '#87CEEB', points: 51, played: 36, won: 13, drawn: 12, lost: 11, goalsFor: 39, goalsAgainst: 37, form: ['W', 'L', 'D', 'W', 'D'] as const },
  { name: 'Udinese Calcio', shortName: 'Udinese', tla: 'UDI', crest: 'https://crests.football-data.org/115.png', color: '#000000', points: 50, played: 36, won: 14, drawn: 8, lost: 14, goalsFor: 45, goalsAgainst: 46, form: ['W', 'D', 'L', 'W', 'L'] as const },
  { name: 'US Sassuolo Calcio', shortName: 'Sassuolo', tla: 'SAS', crest: 'https://crests.football-data.org/471.png', color: '#00711F', points: 49, played: 35, won: 14, drawn: 7, lost: 14, goalsFor: 43, goalsAgainst: 44, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'Parma Calcio 1913', shortName: 'Parma', tla: 'PAR', crest: 'https://crests.football-data.org/112.png', color: '#F7D616', points: 42, played: 36, won: 10, drawn: 12, lost: 14, goalsFor: 27, goalsAgainst: 45, form: ['L', 'W', 'D', 'W', 'L'] as const },
  { name: 'Genoa CFC', shortName: 'Genoa', tla: 'GEN', crest: 'https://crests.football-data.org/107.png', color: '#9B1726', points: 41, played: 36, won: 10, drawn: 11, lost: 15, goalsFor: 40, goalsAgainst: 48, form: ['D', 'L', 'D', 'W', 'L'] as const },
  { name: 'Torino FC', shortName: 'Torino', tla: 'TOR', crest: 'https://crests.football-data.org/586.png', color: '#8B0000', points: 41, played: 35, won: 11, drawn: 8, lost: 16, goalsFor: 39, goalsAgainst: 58, form: ['D', 'L', 'L', 'W', 'L'] as const },
  { name: 'ACF Fiorentina', shortName: 'Fiorentina', tla: 'FIO', crest: 'https://crests.football-data.org/99.png', color: '#4A0080', points: 38, played: 36, won: 8, drawn: 14, lost: 14, goalsFor: 38, goalsAgainst: 49, form: ['D', 'D', 'L', 'W', 'W'] as const },
  { name: 'Cagliari Calcio', shortName: 'Cagliari', tla: 'CAG', crest: 'https://crests.football-data.org/104.png', color: '#0046AD', points: 37, played: 36, won: 9, drawn: 10, lost: 17, goalsFor: 36, goalsAgainst: 51, form: ['W', 'D', 'W', 'L', 'W'] as const },
  { name: 'US Lecce', shortName: 'Lecce', tla: 'USL', crest: 'https://crests.football-data.org/5890.png', color: '#F5A000', points: 32, played: 36, won: 8, drawn: 8, lost: 20, goalsFor: 24, goalsAgainst: 48, form: ['L', 'W', 'D', 'L', 'W'] as const },
  { name: 'US Cremonese', shortName: 'Cremonese', tla: 'CRE', crest: 'https://crests.football-data.org/457.png', color: '#D90000', points: 31, played: 36, won: 7, drawn: 10, lost: 19, goalsFor: 30, goalsAgainst: 53, form: ['L', 'L', 'L', 'L', 'D'] as const },
  { name: 'Hellas Verona FC', shortName: 'Verona', tla: 'HVE', crest: 'https://crests.football-data.org/450.png', color: '#1A4D7C', points: 20, played: 36, won: 3, drawn: 11, lost: 22, goalsFor: 24, goalsAgainst: 58, form: ['L', 'L', 'L', 'L', 'D'] as const },
  { name: 'AC Pisa 1909', shortName: 'AC Pisa', tla: 'PIS', crest: 'https://crests.football-data.org/487.png', color: '#0E4C92', points: 18, played: 36, won: 2, drawn: 12, lost: 22, goalsFor: 25, goalsAgainst: 66, form: ['L', 'L', 'W', 'L', 'D'] as const },
] as const

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'serie-a',
  seed: 23,
  realTeams: realTeams.map((t) => ({ ...t, form: [...t.form] })),
})
