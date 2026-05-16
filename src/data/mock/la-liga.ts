import { createMockLeague } from './createMockLeague'

// Primary colors inspired by real La Liga clubs
const teamColors = [
  '#FEBE10', // Madrid Royal → Real Madrid gold
  '#A50044', // Barcelona Blaugrana → Barcelona maroon
  '#C00D1E', // Atletico Capital → Atlético red
  '#9B1726', // Girona Red
  '#EE2523', // Bilbao Athletic → Athletic red
  '#0067A5', // San Sebastian Real → Real Sociedad blue
  '#F7D616', // Villarreal Yellow
  '#EE6F00', // Valencia Bats → Valencia orange
  '#D2010D', // Sevilla Nervion red
  '#00954C', // Betis Verdiblanco → Real Betis green
  '#66CCFF', // Celta Vigo sky blue
  '#D20026', // Osasuna red
  '#1B3669', // Getafe Azul blue
  '#C8102E', // Mallorca red
  '#FFDD00', // Las Palmas yellow
  '#CF111D', // Rayo Vallecano red
  '#155285', // Alaves Blue
  '#005BAB', // Espanyol blue
  '#0033A0', // Leganes blue
  '#6C1F7E', // Valladolid violet
]

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'la-liga',
  seed: 17,
  teamColors,
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
