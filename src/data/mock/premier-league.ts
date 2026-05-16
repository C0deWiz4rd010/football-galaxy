import { createMockLeague } from './createMockLeague'

// Primary colors inspired by real Premier League clubs
const teamColors = [
  '#EF0107', // North London Royals → Arsenal red
  '#DA291C', // Manchester Albion → Man Utd red
  '#C8102E', // Merseyside Reds → Liverpool crimson
  '#034694', // West London Blues → Chelsea blue
  '#6CABDD', // City of Manchester → Man City sky blue
  '#333333', // Tyneside United → Newcastle black
  '#670E36', // Aston Lions → Aston Villa claret
  '#0057B8', // Brighton Coast → Brighton blue
  '#7A263A', // East London Irons → West Ham claret
  '#DD0000', // Nottingham Forest red
  '#1B458F', // Crystal Palace blue
  '#CC0000', // Fulham Riverside red
  '#DA291C', // Bournemouth red
  '#D20000', // Brentford red
  '#FDB913', // Wolverhampton gold
  '#003399', // Everton blue
  '#003090', // Leicester blue
  '#D71920', // Southampton red
  '#0057BD', // Ipswich blue
  '#1D428A', // Leeds blue
]

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'premier-league',
  seed: 7,
  teamColors,
  teamNames: [
    'North London Royals',
    'Manchester Albion',
    'Merseyside Reds',
    'West London Blues',
    'City of Manchester',
    'Tyneside United',
    'Aston Lions',
    'Brighton Coast',
    'East London Irons',
    'Nottingham Forest',
    'Crystal Palace',
    'Fulham Riverside',
    'Bournemouth Coast',
    'Brentford Bees',
    'Wolverhampton Gold',
    'Everton Dockers',
    'Leicester Foxes',
    'Southampton Saints',
    'Ipswich Town',
    'Leeds White',
  ],
})
