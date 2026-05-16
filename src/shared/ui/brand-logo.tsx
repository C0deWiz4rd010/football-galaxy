type BrandLogoProps = {
  className?: string
  subtitle?: string
}

export function BrandLogo({ className = '', subtitle = 'Live football dashboard' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-11 w-11 shrink-0"
        fill="none"
      >
        <defs>
          <linearGradient id="fg-shell" x1="10" y1="8" x2="54" y2="56">
            <stop offset="0%" stopColor="#f4c54f" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#0ea5a4" />
          </linearGradient>
          <linearGradient id="fg-orbit" x1="12" y1="14" x2="52" y2="48">
            <stop offset="0%" stopColor="#7dd3a5" />
            <stop offset="100%" stopColor="#0ea5a4" />
          </linearGradient>
        </defs>
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="18"
          fill="#0b1523"
          stroke="rgba(255,255,255,0.12)"
        />
        <circle cx="32" cy="32" r="15.5" fill="url(#fg-shell)" opacity="0.18" />
        <path
          d="M16.5 38.5c5.8-12.3 21.9-18.7 32.4-12.4"
          stroke="url(#fg-orbit)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M22 19.5h12M22 19.5v25M22 31.5h10"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 19.5h8.5c4.2 0 6.5 2.3 6.5 5.8 0 2.8-1.7 4.7-4.5 5.3 3 .5 5.1 2.6 5.1 6 0 3.8-2.9 6.1-7.3 6.1H34"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="44.5" cy="22.5" r="3.5" fill="#f4c54f" />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="text-base tracking-[-0.03em] text-foreground">
          Football Galaxy
        </span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {subtitle}
        </span>
      </span>
    </span>
  )
}
