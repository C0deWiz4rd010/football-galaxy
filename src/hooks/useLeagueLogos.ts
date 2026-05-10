import { useMemo } from 'react'

import { leagues } from '@/lib/leagues'

export function useLeagueLogos() {
  return useMemo(
    () =>
      Object.fromEntries(
        leagues.map((league) => [league.id, league.logo]),
      ) as Record<string, string>,
    [],
  )
}
