type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-11 w-11 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="fg-orbit" x1="8" y1="12" x2="54" y2="52">
            <stop
              offset="0%"
              stopColor="var(--league-accent, var(--color-accent))"
            />
            <stop
              offset="100%"
              stopColor="var(--league-accent-strong, var(--color-accent-strong))"
            />
          </linearGradient>
        </defs>
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="18"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.1)"
        />
        <path
          d="M17 36.5c5.1-11.2 20.2-17.8 31-12.2"
          stroke="url(#fg-orbit)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M19 21h13.5M19 21v22M19 32h11"
          stroke="var(--color-text-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 21h8.5c4.1 0 6.5 2.3 6.5 5.7 0 2.8-1.8 4.8-4.5 5.4 3 .4 5 2.5 5 5.9 0 3.8-2.8 6-7.1 6H35"
          stroke="var(--color-text-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="font-[var(--font-display)] text-base font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
          Football Galaxy
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          Match Center
        </span>
      </span>
    </span>
  )
}
