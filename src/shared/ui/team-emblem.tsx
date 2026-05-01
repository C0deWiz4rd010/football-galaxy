type TeamEmblemProps = {
  crestUrl: string | null
  fallback: string
  teamName: string
  className?: string
}

export function TeamEmblem({
  crestUrl,
  fallback,
  teamName,
  className = '',
}: TeamEmblemProps) {
  if (crestUrl) {
    return (
      <span
        className={`flex items-center justify-center overflow-hidden rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.06)] ${className}`}
      >
        <img
          src={crestUrl}
          alt={`${teamName} crest`}
          className="h-full w-full object-contain p-1"
          loading="lazy"
        />
      </span>
    )
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.06)] text-xs font-semibold text-[var(--color-text-primary)] ${className}`}
      aria-label={teamName}
    >
      {fallback}
    </span>
  )
}
