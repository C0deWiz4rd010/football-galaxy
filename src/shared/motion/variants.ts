/**
 * Canonical Framer Motion variants for the app.
 *
 * Centralising these here means a page-transition tweak or a fade-in retiming
 * happens in exactly one place instead of every component. Use the named
 * helpers below rather than ad-hoc `initial`/`animate` props.
 */

import type { Transition, Variants } from 'framer-motion'

import { motionDurations, motionEasing } from './tokens'

/**
 * Standard entrance transition: emphasised decelerate at the base duration.
 * Use for any element entering the viewport on mount/route change.
 */
export const enterTransition: Transition = {
  duration: motionDurations.base,
  ease: motionEasing.enter,
}

/**
 * Slightly slower hero transition for above-the-fold page heroes and modals
 * where a more pronounced entrance is appropriate.
 */
export const heroTransition: Transition = {
  duration: motionDurations.hero,
  ease: motionEasing.enter,
}

/** Subtle fade — for swapping skeleton ↔ content without movement. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: enterTransition },
  exit: { opacity: 0, transition: { duration: motionDurations.fast, ease: motionEasing.exit } },
}

/** Fade + 8px translateY rise — default for content blocks entering the page. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: enterTransition },
  exit: { opacity: 0, y: 4, transition: { duration: motionDurations.fast, ease: motionEasing.exit } },
}

/** Scale-in for cards and tiles. Keeps the centre of mass stable. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: enterTransition },
  exit: { opacity: 0, scale: 0.98, transition: { duration: motionDurations.fast, ease: motionEasing.exit } },
}

/**
 * Stagger container — apply to a parent and use `fadeUp`/`scaleIn` on children
 * to get a smooth cascade without writing per-child delays.
 */
export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

/** Whole-page transitions used by the router-aware shell. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: heroTransition },
  exit: { opacity: 0, y: -4, transition: { duration: motionDurations.fast, ease: motionEasing.exit } },
}
