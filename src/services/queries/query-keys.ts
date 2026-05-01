import type { LeagueId } from '../config/leagues'

export const standingsQueryKeys = {
  all: ['standings'] as const,
  byLeague: (leagueId: LeagueId) =>
    [...standingsQueryKeys.all, leagueId] as const,
}
