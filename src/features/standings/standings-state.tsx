type StandingsStateProps = {
  eyebrow: string
  title: string
  message: string
  tone?: 'neutral' | 'danger'
  actionLabel?: string
  onAction?: () => void
  children?: React.ReactNode
}

export function StandingsState({
  eyebrow,
  title,
  message,
  tone = 'neutral',
  actionLabel,
  onAction,
  children,
}: StandingsStateProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-[rgba(255,107,107,0.35)]'
      : 'border-[var(--color-border-subtle)]'

  return (
    <section
      className={`dashboard-panel rounded-[30px] p-6 sm:p-8 ${toneClasses}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-4xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
              {message}
            </p>
          </div>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="dashboard-pill inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  )
}
