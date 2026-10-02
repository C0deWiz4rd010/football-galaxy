/**
 * `StaggerGrid` reveals its children with a smooth cascade so dashboards feel
 * alive on load without each section having to wire up motion props.
 *
 * Wrap the parent grid in `<StaggerGrid>` and wrap each child you want to
 * animate in `<StaggerGridItem>`. Use the `as` prop to keep the rendered
 * element (`section`, `div`, …) sensible for accessibility.
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { motion } from 'framer-motion'

import { fadeUp, staggerParent } from '@/shared/motion/variants'

// Motion components must be created once at module level: creating them during
// render remounts the whole subtree on every re-render (lost input focus,
// reloaded images, restarted animations).
const motionElements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  li: motion.li,
} as const

type StaggerElement = keyof typeof motionElements

type StaggerGridProps<E extends StaggerElement> = {
  as?: E
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<(typeof motionElements)[E]>, 'as' | 'children'>

export function StaggerGrid<E extends StaggerElement = 'div'>({ as, children, ...rest }: StaggerGridProps<E>) {
  const Component: ElementType = motionElements[as ?? 'div']
  return (
    <Component variants={staggerParent} initial="hidden" animate="show" {...rest}>
      {children}
    </Component>
  )
}

export function StaggerGridItem<E extends StaggerElement = 'div'>({ as, children, ...rest }: StaggerGridProps<E>) {
  const Component: ElementType = motionElements[as ?? 'div']
  return (
    <Component variants={fadeUp} {...rest}>
      {children}
    </Component>
  )
}
