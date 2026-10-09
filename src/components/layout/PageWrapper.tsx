import type { ReactNode } from 'react'

/**
 * Page root. Route transitions are animated once by the app shell
 * (router.tsx); pages must not add a second entrance animation on top.
 */
export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>
}
