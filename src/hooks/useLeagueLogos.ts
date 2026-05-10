import { useEffect, useState } from 'react'

import { leagues } from '@/lib/leagues'
import { getLeagueSummary } from '@/services/footballData'

export function useLeagueLogos() {
  const [logos, setLogos] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true

    void Promise.all(
      leagues.map(async (league) => {
        try {
          const summary = await getLeagueSummary({ leagueId: league.id })
          return [league.id, summary.league.logo] as const
        } catch {
          return [league.id, league.logo] as const
        }
      }),
    ).then((entries) => {
      if (!active) {
        return
      }

      setLogos(Object.fromEntries(entries))
    })

    return () => {
      active = false
    }
  }, [])

  return logos
}
