export const motionDurations = {
  instant: 0.12,
  fast: 0.18,
  base: 0.24,
  slow: 0.32,
  hero: 0.42,
} as const

export const motionEasing = {
  enter: [0.16, 1, 0.3, 1],
  soft: [0.45, 0, 0.55, 1],
  exit: [0.32, 0, 0.67, 0],
  emphasize: [0.34, 1.56, 0.64, 1],
} as const

export const pageMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: motionDurations.base,
    ease: motionEasing.enter,
  },
} as const

export const fadeUpMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: motionDurations.base,
    ease: motionEasing.enter,
  },
} as const
