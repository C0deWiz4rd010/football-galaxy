import { useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { FormDots } from '@/components/shared/FormDots'
import type { Standing } from '@/services/types'

export function FormTableCard({ standings }: { standings: Standing[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <section className="stat-card">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Recent momentum
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Form Table</h2>
      </div>
      <div className="space-y-2">
        {standings.slice(0, 8).map((standing) => (
          <div key={standing.id} className="surface-soft rounded-[1.2rem] p-3">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setExpanded(expanded === standing.id ? null : standing.id)}
            >
              <div className="min-w-0">
                <span className="block truncate font-medium">{standing.team.name}</span>
                <span className="text-xs text-muted-foreground">
                  {standing.points} pts - GD {standing.goalDifference}
                </span>
              </div>
              <FormDots form={standing.form.slice(-6)} />
            </button>
            <AnimatePresence initial={false}>
              {expanded === standing.id ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden text-xs text-muted-foreground"
                >
                  <div className="pt-3">
                    {standing.form.map((item) => `${item.opponent} ${item.score}`).join(' - ')}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
