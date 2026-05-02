import { createMockLeague } from './createMockLeague'

export const { standings, topScorers, topAssists, recentMatches, teams } = createMockLeague({
  leagueId: 'premier-league',
  seed: 7,
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
