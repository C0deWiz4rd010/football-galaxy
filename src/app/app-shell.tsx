import type { PropsWithChildren } from 'react'

import { BrandLogo } from '../shared/ui/brand-logo'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        <header className="dashboard-panel dashboard-glow overflow-hidden rounded-[32px] px-5 py-6 sm:px-7 sm:py-7">
          <div className="dashboard-grid absolute inset-0 opacity-35" />
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <BrandLogo />
              <span className="dashboard-pill inline-flex items-center px-3 py-2 text-xs font-medium text-[var(--color-text-muted)]">
                Top 5 Leagues
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-[var(--font-display)] text-[2rem] font-semibold tracking-[-0.045em] text-[var(--color-text-primary)] sm:text-[2.35rem] lg:text-[2.75rem]">
                Standings Dashboard
              </h1>
              <p className="max-w-3xl text-[15px] leading-7 text-[var(--color-text-secondary)] sm:text-base">
                A modern football dashboard built for crisp league switching,
                premium standings presentation, and a cleaner sports reading
                experience across desktop and mobile.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
