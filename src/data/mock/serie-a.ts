import { createMockLeague } from './createMockLeague'

// Primary colors inspired by real Serie A clubs
const teamColors = [
  '#010E80', // Milano Nerazzurri → Inter dark blue
  '#2D2D2D', // Torino Bianconeri → Juventus black
  '#1874CD', // Napoli Partenopei → Napoli sky blue
  '#8E1F2F', // Roma Giallorossi → Roma dark red
  '#1565C0', // Lazio Eagles → Lazio blue
  '#1C3E90', // Atalanta Bergamo blue
  '#4A0080', // Fiorentina Viola violet
  '#CC0000', // Bologna Rossoblu red
  '#8B0000', // Torino Granata dark red
  '#9B1726', // Genoa Port red
  '#D90000', // Monza red
  '#333333', // Udinese black
  '#0046AD', // Cagliari blue
  '#F5A000', // Lecce Salento gold/yellow
  '#004B8D', // Empoli blue
  '#1A4D7C', // Verona Mastini blue
  '#FFDD00', // Parma Ducali yellow
  '#0033A0', // Como Lake blue
  '#2D1A3E', // Venezia Lagoon dark purple
  '#00711F', // Sassuolo dark green
]

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'serie-a',
  seed: 23,
  teamColors,
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
