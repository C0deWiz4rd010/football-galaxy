import { createMockLeague } from './createMockLeague'

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'la-liga',
  seed: 17,
  teamNames: [
    'Madrid Royal',
    'Barcelona Blaugrana',
    'Atletico Capital',
    'Girona Red',
    'Bilbao Athletic',
    'San Sebastian Real',
    'Villarreal Yellow',
    'Valencia Bats',
    'Sevilla Nervion',
    'Betis Verdiblanco',
    'Celta Vigo',
    'Osasuna Reds',
    'Getafe Azul',
    'Mallorca Island',
    'Las Palmas',
    'Rayo Vallecano',
    'Alaves Blue',
    'Espanyol Parakeets',
    'Leganes South',
    'Valladolid Violet',
  ],
})
