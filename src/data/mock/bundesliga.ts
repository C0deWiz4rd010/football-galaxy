import { createMockLeague } from './createMockLeague'

// Primary colors inspired by real Bundesliga clubs
const teamColors = [
  '#DC052D', // Munich Rekordmeister → Bayern red
  '#FDE100', // Dortmund Schwarzgelb → BVB yellow
  '#E32221', // Leverkusen Werkself red
  '#DA011E', // Leipzig Red Bulls red
  '#ED1C24', // Stuttgart red
  '#E1000F', // Frankfurt Eagles red
  '#CC0000', // Freiburg red
  '#65B32E', // Wolfsburg green
  '#C63126', // Mainz red
  '#1D9D54', // Bremen green
  '#BA3733', // Augsburg red
  '#1961AC', // Hoffenheim blue
  '#EB1923', // Union Berlin red
  '#333333', // Gladbach black
  '#005CA8', // Bochum blue
  '#D00E10', // Heidenheim red
  '#0B5FA5', // Kiel blue
  '#1055A1', // Hamburg blue
  '#FC4F00', // Cologne orange
  '#990000', // Nuremberg dark red
]

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'bundesliga',
  seed: 11,
  teamColors,
  teamNames: [
    'Munich Rekordmeister',
    'Dortmund Schwarzgelb',
    'Leverkusen Werkself',
    'Leipzig Red Bulls',
    'Stuttgart Swabians',
    'Frankfurt Eagles',
    'Freiburg Breisgau',
    'Wolfsburg Wolves',
    'Mainz Carnival',
    'Bremen River',
    'Augsburg Fugger',
    'Hoffenheim Village',
    'Union Berlin',
    'Gladbach Foals',
    'Bochum Ruhr',
    'Heidenheim Hill',
    'Kiel North',
    'Hamburg Port',
    'Cologne Cathedral',
    'Nuremberg Club',
  ],
})
