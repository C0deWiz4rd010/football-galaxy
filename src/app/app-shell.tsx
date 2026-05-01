import type { PropsWithChildren } from 'react'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-canvas)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-10">
        <header className="border-b border-[var(--color-border-subtle)] pb-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
              Football Galaxy
            </p>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Standings Dashboard
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
                Phase 1 foundation is in place. League data, standings, and
                feature modules will be added in the next phase.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8">{children}</main>
      </div>
    </div>
  )
}
