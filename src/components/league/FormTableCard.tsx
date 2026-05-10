import { Link } from 'react-router-dom'

import { FormDots } from '@/components/shared/FormDots'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Standing } from '@/services/types'

export function FormTableCard({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return (
      <section className="stat-card">
        <EmptyState
          title="No form trends yet"
          description="Recent momentum will appear here once league results are available."
          className="min-h-0 border-0 p-0"
        />
      </section>
    )
  }

  return (
    <section className="stat-card">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Recent momentum
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">Form Table</h2>
      </div>
      <div className="space-y-2">
        {standings.slice(0, 6).map((standing) => (
          <Link
            key={standing.id}
            to={`/${standing.leagueId}/team/${standing.team.id}`}
            className="interactive-card surface-soft flex items-center justify-between gap-3 rounded-[1.1rem] px-3 py-2.5 hover:border-border/70 hover:bg-background/60"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">#{standing.position}</span>
                <span className="truncate text-sm font-medium">{standing.team.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {standing.points} pts · GD {standing.goalDifference}
              </span>
            </div>
            <FormDots form={standing.form.slice(-5)} />
          </Link>
        ))}
      </div>
    </section>
  )
}
