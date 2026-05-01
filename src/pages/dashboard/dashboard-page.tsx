import { AppShell } from '../../app/app-shell'
import { StandingsFeature } from '../../features/standings'

export function DashboardPage() {
  return (
    <AppShell>
      <StandingsFeature leagueId="premier-league" />
    </AppShell>
  )
}
