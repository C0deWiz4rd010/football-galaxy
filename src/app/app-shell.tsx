import type { PropsWithChildren, ReactNode } from 'react'

import { BrandLogo } from '../shared/ui/brand-logo'

type AppShellProps = PropsWithChildren<{
  headerActions?: ReactNode
}>

export function AppShell({ children, headerActions }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        <header className="dashboard-panel dashboard-glow overflow-hidden rounded-[30px] px-5 py-4 sm:px-6 sm:py-4.5">
          <div className="dashboard-grid absolute inset-0 opacity-35" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo />
            </div>
            {headerActions}
          </div>
        </header>

        <main className="flex-1 py-4 sm:py-5">{children}</main>
      </div>
    </div>
  )
}
