/**
 * `StaggerGrid` reveals its children with a smooth cascade so dashboards feel
 * alive on load without each section having to wire up motion props.
 *
 * Wrap the parent grid in `<StaggerGrid>` and wrap each child you want to
 * animate in `<StaggerGrid.Item>`. Use the `as` prop to keep the rendered
 * element (`section`, `div`, …) sensible for accessibility.
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

import { motion } from 'framer-motion'

import { fadeUp, staggerParent } from '@/shared/motion/variants'

type StaggerGridProps<E extends ElementType> = {
  as?: E
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'children'>

function StaggerGridRoot<E extends ElementType = 'div'>({
  as,
  children,
  ...rest
}: StaggerGridProps<E>) {
  const Component = motion.create(as ?? 'div') as ElementType
  return (
    <Component
      variants={staggerParent}
      initial="hidden"
      animate="show"
      {...rest}
    >
      {children}
    </Component>
  )
}

function StaggerItem<E extends ElementType = 'div'>({
  as,
  children,
  ...rest
}: StaggerGridProps<E>) {
  const Component = motion.create(as ?? 'div') as ElementType
  return (
    <Component variants={fadeUp} {...rest}>
      {children}
    </Component>
  )
}

export const StaggerGrid = Object.assign(StaggerGridRoot, { Item: StaggerItem })
