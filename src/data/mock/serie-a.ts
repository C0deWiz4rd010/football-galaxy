import { createMockLeague } from './createMockLeague'

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'serie-a',
  seed: 23,
  teamNames: [
    'Milano Nerazzurri',
    'Torino Bianconeri',
    'Napoli Partenopei',
    'Roma Giallorossi',
    'Lazio Eagles',
    'Atalanta Bergamo',
    'Fiorentina Viola',
    'Bologna Rossoblu',
    'Torino Granata',
    'Genoa Port',
    'Monza Brianza',
    'Udinese Friuli',
    'Cagliari Island',
    'Lecce Salento',
    'Empoli Tuscan',
    'Verona Mastini',
    'Parma Ducali',
    'Como Lake',
    'Venezia Lagoon',
    'Sassuolo Neroverdi',
  ],
})
