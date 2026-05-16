import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { pageVariants } from '@/shared/motion/variants'

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
