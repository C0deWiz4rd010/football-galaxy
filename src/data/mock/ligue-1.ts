import { createMockLeague } from './createMockLeague'

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'ligue-1',
  seed: 29,
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
