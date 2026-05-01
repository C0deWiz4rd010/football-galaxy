import type { PropsWithChildren } from 'react'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        <header className="dashboard-panel dashboard-glow overflow-hidden rounded-[32px] px-5 py-6 sm:px-7 sm:py-7">
          <div className="dashboard-grid absolute inset-0 opacity-35" />
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="dashboard-pill inline-flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-secondary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[var(--shadow-accent)]" />
                Football Galaxy
              </span>
              <span className="dashboard-pill inline-flex items-center px-3 py-2 text-xs font-medium text-[var(--color-text-muted)]">
                Top 5 Leagues
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Standings Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
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
