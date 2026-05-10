import { motion } from 'framer-motion'

import { useAppMode } from '@/hooks/useAppMode'
import { motionDurations, motionEasing } from '@/shared/motion/tokens'

const modes = [
  { id: 'live', label: 'Galaxy Live' },
  { id: 'ea-fc', label: 'EA FC Mode' },
] as const

export function AppModeToggle() {
  const { mode, setMode } = useAppMode()

  return (
    <div className="app-pill relative hidden items-center gap-1 p-1 lg:flex">
      <motion.div
        layoutId="app-mode-highlight"
        className="absolute inset-y-1 w-[calc(50%-0.125rem)] rounded-full bg-white/12 shadow-[0_10px_30px_rgba(15,23,42,0.28)]"
        initial={false}
        animate={{
          x: mode === 'live' ? '0%' : '100%',
        }}
        transition={{
          duration: motionDurations.fast,
          ease: motionEasing.emphasize,
        }}
      />
      {modes.map((item) => {
        const active = mode === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={[
              'relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
