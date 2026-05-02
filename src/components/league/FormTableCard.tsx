import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FormDots } from '@/components/shared/FormDots'
import type { Standing } from '@/services/types'

export function FormTableCard({ standings }: { standings: Standing[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <section className="stat-card">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Form Table</h2>
      <div className="space-y-2">
        {standings.slice(0, 8).map((standing) => (
          <div key={standing.id} className="rounded-lg border bg-background/70 p-3">
            <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setExpanded(expanded === standing.id ? null : standing.id)}>
              <span className="truncate font-medium">{standing.team.name}</span>
              <FormDots form={standing.form.slice(-6)} />
            </button>
            <AnimatePresence>
              {expanded === standing.id ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden text-xs text-muted-foreground">
                  <div className="pt-2">{standing.form.map((item) => `${item.opponent} ${item.score}`).join(' · ')}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
}
