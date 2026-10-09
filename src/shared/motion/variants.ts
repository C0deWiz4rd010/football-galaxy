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



/** Fade + 8px translateY rise — default for content blocks entering the page. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: enterTransition },
  exit: { opacity: 0, y: 4, transition: { duration: motionDurations.fast, ease: motionEasing.exit } },
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
