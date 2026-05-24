import type { LeagueId } from '../config/leagues'

export const standingsQueryKeys = {
  all: ['standings'] as const,
  byLeague: (leagueId: LeagueId, matchday: number | null) =>
    [...standingsQueryKeys.all, leagueId, matchday ?? 'latest'] as const,
}
