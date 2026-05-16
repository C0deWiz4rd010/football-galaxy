import { createMockLeague } from './createMockLeague'

// Auto-generated from standings-snapshot.json (real 2025-26 data via football-data.org).
// Run `node scripts/build-mock-data.mjs` to regenerate after refreshing the snapshot.
const realTeams = [
  { name: 'Arsenal FC', shortName: 'Arsenal', tla: 'ARS', crest: 'https://crests.football-data.org/57.png', color: '#EF0107', points: 79, played: 36, won: 24, drawn: 7, lost: 5, goalsFor: 68, goalsAgainst: 26, form: ['W', 'W', 'L', 'D', 'W'] as const },
  { name: 'Manchester City FC', shortName: 'Man City', tla: 'MCI', crest: 'https://crests.football-data.org/65.png', color: '#6CABDD', points: 77, played: 36, won: 23, drawn: 8, lost: 5, goalsFor: 75, goalsAgainst: 32, form: ['W', 'W', 'W', 'D', 'W'] as const },
  { name: 'Manchester United FC', shortName: 'Man United', tla: 'MUN', crest: 'https://crests.football-data.org/66.png', color: '#DA291C', points: 65, played: 36, won: 18, drawn: 11, lost: 7, goalsFor: 63, goalsAgainst: 48, form: ['W', 'L', 'W', 'D', 'W'] as const },
  { name: 'Aston Villa FC', shortName: 'Aston Villa', tla: 'AVL', crest: 'https://crests.football-data.org/58.png', color: '#670E36', points: 62, played: 37, won: 18, drawn: 8, lost: 11, goalsFor: 54, goalsAgainst: 48, form: ['W', 'L', 'D', 'D', 'W'] as const },
  { name: 'Liverpool FC', shortName: 'Liverpool', tla: 'LIV', crest: 'https://crests.football-data.org/64.png', color: '#C8102E', points: 59, played: 37, won: 17, drawn: 8, lost: 12, goalsFor: 62, goalsAgainst: 52, form: ['L', 'D', 'L', 'D', 'W'] as const },
  { name: 'AFC Bournemouth', shortName: 'Bournemouth', tla: 'BOU', crest: 'https://crests.football-data.org/bournemouth.png', color: '#DA291C', points: 55, played: 36, won: 13, drawn: 16, lost: 7, goalsFor: 56, goalsAgainst: 52, form: ['D', 'W', 'W', 'D', 'D'] as const },
  { name: 'Brighton & Hove Albion FC', shortName: 'Brighton Hove', tla: 'BHA', crest: 'https://crests.football-data.org/397.png', color: '#0057B8', points: 53, played: 36, won: 14, drawn: 11, lost: 11, goalsFor: 52, goalsAgainst: 42, form: ['D', 'W', 'W', 'D', 'D'] as const },
  { name: 'Brentford FC', shortName: 'Brentford', tla: 'BRE', crest: 'https://crests.football-data.org/402.png', color: '#D20000', points: 51, played: 36, won: 14, drawn: 9, lost: 13, goalsFor: 52, goalsAgainst: 49, form: ['D', 'L', 'D', 'D', 'D'] as const },
  { name: 'Chelsea FC', shortName: 'Chelsea', tla: 'CHE', crest: 'https://crests.football-data.org/61.png', color: '#034694', points: 49, played: 36, won: 13, drawn: 10, lost: 13, goalsFor: 55, goalsAgainst: 49, form: ['W', 'L', 'L', 'W', 'D'] as const },
  { name: 'Everton FC', shortName: 'Everton', tla: 'EVE', crest: 'https://crests.football-data.org/62.png', color: '#003399', points: 49, played: 36, won: 13, drawn: 10, lost: 13, goalsFor: 46, goalsAgainst: 46, form: ['W', 'D', 'L', 'W', 'L'] as const },
  { name: 'Fulham FC', shortName: 'Fulham', tla: 'FUL', crest: 'https://crests.football-data.org/63.png', color: '#000000', points: 48, played: 36, won: 14, drawn: 6, lost: 16, goalsFor: 44, goalsAgainst: 50, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'Sunderland AFC', shortName: 'Sunderland', tla: 'SUN', crest: 'https://crests.football-data.org/71.png', color: '#EB172B', points: 48, played: 36, won: 12, drawn: 12, lost: 12, goalsFor: 37, goalsAgainst: 46, form: ['L', 'W', 'W', 'W', 'L'] as const },
  { name: 'Newcastle United FC', shortName: 'Newcastle', tla: 'NEW', crest: 'https://crests.football-data.org/67.png', color: '#241F20', points: 46, played: 36, won: 13, drawn: 7, lost: 16, goalsFor: 50, goalsAgainst: 52, form: ['L', 'L', 'D', 'W', 'L'] as const },
  { name: 'Leeds United FC', shortName: 'Leeds United', tla: 'LEE', crest: 'https://crests.football-data.org/341.png', color: '#1D428A', points: 44, played: 36, won: 10, drawn: 14, lost: 12, goalsFor: 48, goalsAgainst: 53, form: ['D', 'L', 'L', 'W', 'L'] as const },
  { name: 'Crystal Palace FC', shortName: 'Crystal Palace', tla: 'CRY', crest: 'https://crests.football-data.org/354.png', color: '#1B458F', points: 44, played: 36, won: 11, drawn: 11, lost: 14, goalsFor: 38, goalsAgainst: 47, form: ['W', 'D', 'L', 'W', 'W'] as const },
  { name: 'Nottingham Forest FC', shortName: 'Nottingham', tla: 'NOT', crest: 'https://crests.football-data.org/351.png', color: '#DD0000', points: 43, played: 36, won: 11, drawn: 10, lost: 15, goalsFor: 45, goalsAgainst: 47, form: ['W', 'W', 'W', 'L', 'W'] as const },
  { name: 'Tottenham Hotspur FC', shortName: 'Tottenham', tla: 'TOT', crest: 'https://crests.football-data.org/73.png', color: '#132257', points: 38, played: 36, won: 9, drawn: 11, lost: 16, goalsFor: 46, goalsAgainst: 55, form: ['L', 'W', 'D', 'L', 'W'] as const },
  { name: 'West Ham United FC', shortName: 'West Ham', tla: 'WHU', crest: 'https://crests.football-data.org/563.png', color: '#7A263A', points: 36, played: 36, won: 9, drawn: 9, lost: 18, goalsFor: 42, goalsAgainst: 62, form: ['L', 'L', 'L', 'L', 'W'] as const },
  { name: 'Burnley FC', shortName: 'Burnley', tla: 'BUR', crest: 'https://crests.football-data.org/328.png', color: '#6C1D45', points: 21, played: 36, won: 4, drawn: 9, lost: 23, goalsFor: 37, goalsAgainst: 73, form: ['L', 'L', 'L', 'L', 'D'] as const },
  { name: 'Wolverhampton Wanderers FC', shortName: 'Wolverhampton', tla: 'WOL', crest: 'https://crests.football-data.org/76.png', color: '#FDB913', points: 18, played: 36, won: 3, drawn: 9, lost: 24, goalsFor: 25, goalsAgainst: 66, form: ['L', 'L', 'W', 'L', 'D'] as const },
] as const

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'premier-league',
  seed: 7,
  realTeams: realTeams.map((t) => ({ ...t, form: [...t.form] })),
})
