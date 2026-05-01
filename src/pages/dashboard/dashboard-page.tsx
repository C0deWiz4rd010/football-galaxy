import { AppShell } from '../../app/app-shell'
import { StandingsDashboard } from '../../features/standings'

export function DashboardPage() {
  return (
    <AppShell>
      <StandingsDashboard />
    </AppShell>
  )
}
