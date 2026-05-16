import { createMockLeague } from './createMockLeague'

// Primary colors inspired by real Ligue 1 clubs
const teamColors = [
  '#003366', // Paris Capital → PSG dark blue
  '#00A0E2', // Marseille Phoceens sky blue
  '#D4AF37', // Monaco Principality gold
  '#042D5C', // Lyon Rhone dark blue
  '#9A0022', // Lille Nord dark red
  '#CE1126', // Nice Riviera red
  '#810000', // Rennes Rouge dark red
  '#D0A650', // Lens Sang et Or gold
  '#C8102E', // Strasbourg red
  '#F97316', // Montpellier orange
  '#F7D616', // Nantes Canaries yellow
  '#6A0DAD', // Toulouse Violet purple
  '#C8102E', // Brest red
  '#C8102E', // Reims red
  '#003399', // Auxerre blue
  '#333333', // Angers Noir dark
  '#0057A8', // Le Havre blue
  '#007832', // Saint Etienne green
  '#9A0000', // Metz dark red
  '#F97316', // Lorient orange
]

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'ligue-1',
  seed: 29,
  teamColors,
  teamNames: [
    'Paris Capital',
    'Marseille Phoceens',
    'Monaco Principality',
    'Lyon Rhone',
    'Lille Nord',
    'Nice Riviera',
    'Rennes Rouge',
    'Lens Sang et Or',
    'Strasbourg Alsace',
    'Montpellier Herault',
    'Nantes Canaries',
    'Toulouse Violet',
    'Brest Armorique',
    'Reims Champagne',
    'Auxerre Burgundy',
    'Angers Noir',
    'Le Havre Port',
    'Saint Etienne',
    'Metz Lorraine',
    'Lorient Merlus',
  ],
})
