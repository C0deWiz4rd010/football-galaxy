type FlagCode = 'de' | 'gb' | 'fr' | 'es' | 'it' | 'england'

type FlagIconProps = {
  code: FlagCode
  className?: string
  title?: string
}

export function FlagIcon({
  code,
  className = '',
  title,
}: FlagIconProps) {
  const label = title ?? code

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-label={label}
      role="img"
    >
      <title>{label}</title>
      <defs>
        <clipPath id={`flag-clip-${code}`}>
          <rect x="2" y="4" width="20" height="16" rx="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-clip-${code})`}>
        {code === 'de' ? (
          <>
            <rect x="2" y="4" width="20" height="5.34" fill="#111827" />
            <rect x="2" y="9.34" width="20" height="5.33" fill="#ef4444" />
            <rect x="2" y="14.67" width="20" height="5.33" fill="#facc15" />
          </>
        ) : null}
        {code === 'fr' ? (
          <>
            <rect x="2" y="4" width="6.67" height="16" fill="#2563eb" />
            <rect x="8.67" y="4" width="6.66" height="16" fill="#f8fafc" />
            <rect x="15.33" y="4" width="6.67" height="16" fill="#ef4444" />
          </>
        ) : null}
        {code === 'it' ? (
          <>
            <rect x="2" y="4" width="6.67" height="16" fill="#16a34a" />
            <rect x="8.67" y="4" width="6.66" height="16" fill="#f8fafc" />
            <rect x="15.33" y="4" width="6.67" height="16" fill="#ef4444" />
          </>
        ) : null}
        {code === 'es' ? (
          <>
            <rect x="2" y="4" width="20" height="16" fill="#f59e0b" />
            <rect x="2" y="4" width="20" height="4.2" fill="#dc2626" />
            <rect x="2" y="15.8" width="20" height="4.2" fill="#dc2626" />
          </>
        ) : null}
        {code === 'gb' ? (
          <>
            <rect x="2" y="4" width="20" height="16" fill="#1d4ed8" />
            <path d="M2 4l20 16M22 4L2 20" stroke="#f8fafc" strokeWidth="3" />
            <path d="M2 4l20 16M22 4L2 20" stroke="#dc2626" strokeWidth="1.5" />
            <path d="M12 4v16M2 12h20" stroke="#f8fafc" strokeWidth="5" />
            <path d="M12 4v16M2 12h20" stroke="#dc2626" strokeWidth="2.5" />
          </>
        ) : null}
        {code === 'england' ? (
          <>
            <rect x="2" y="4" width="20" height="16" fill="#f8fafc" />
            <path d="M12 4v16M2 12h20" stroke="#dc2626" strokeWidth="4" />
          </>
        ) : null}
      </g>
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="4"
        fill="none"
        stroke="rgba(255,255,255,0.16)"
      />
    </svg>
  )
}
