import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { fadeUpMotion } from '@/shared/motion/tokens'

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={fadeUpMotion.initial}
      animate={fadeUpMotion.animate}
      exit={fadeUpMotion.exit}
      transition={fadeUpMotion.transition}
    >
      {children}
    </motion.div>
  )
}
