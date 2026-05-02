import { createMockLeague } from './createMockLeague'

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'bundesliga',
  seed: 11,
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
