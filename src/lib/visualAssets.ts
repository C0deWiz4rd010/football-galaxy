type FlagCode = 'england' | 'germany' | 'spain' | 'italy' | 'france' | 'portugal' | 'netherlands' | 'brazil'

function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function escapeSvgText(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function normalizeImageSrc(src?: string) {
  if (!src) {
    return undefined
  }
  const trimmed = src.trim()
  if (!trimmed) {
    return undefined
  }
  if (trimmed.startsWith('data:image/')) {
    return trimmed
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }
  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`
  }
  return trimmed
}

export function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function createLeagueLogo(code: string, color: string, name: string) {
  const safeCode = escapeSvgText(code)
  const safeName = escapeSvgText(name)
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${safeName}">
      <rect width="96" height="96" rx="24" fill="#0a0a0b"/>
      <circle cx="48" cy="48" r="37" fill="${color}"/>
      <circle cx="48" cy="48" r="29" fill="none" stroke="white" stroke-opacity=".24" stroke-width="3"/>
      <path d="M48 20 58 38l20 3-14 14 3 20-19-9-19 9 3-20-14-14 20-3Z" fill="white" opacity=".16"/>
      <text x="48" y="58" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800" fill="white">${safeCode}</text>
    </svg>
  `)
}

export function createTeamCrest(shortName: string, primary: string, secondary: string, index: number) {
  const safeShortName = escapeSvgText(shortName)
  const stripeColor = index % 2 === 0 ? secondary : '#ffffff'
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112" role="img" aria-label="${safeShortName} crest">
      <path d="M48 4 84 16v34c0 28-16 47-36 58C28 97 12 78 12 50V16Z" fill="#111113"/>
      <path d="M48 10 78 20v30c0 23-12 39-30 50C30 89 18 73 18 50V20Z" fill="${primary}"/>
      <path d="M26 25h12v59H26zM58 25h12v59H58z" fill="${stripeColor}" opacity=".24"/>
      <circle cx="48" cy="45" r="16" fill="white" opacity=".18"/>
      <circle cx="48" cy="45" r="7" fill="white" opacity=".32"/>
      <text x="48" y="79" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="21" font-weight="800" fill="white">${safeShortName}</text>
    </svg>
  `)
}

export function createPlayerAvatar(initials: string, color: string) {
  const safeInitials = escapeSvgText(initials)
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${safeInitials}">
      <rect width="96" height="96" rx="48" fill="${color}"/>
      <circle cx="48" cy="35" r="17" fill="white" opacity=".35"/>
      <path d="M20 88c4-20 17-31 28-31s24 11 28 31" fill="white" opacity=".24"/>
      <text x="48" y="58" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="800" fill="white">${safeInitials}</text>
    </svg>
  `)
}

export function createFlag(code: FlagCode) {
  const flags: Record<FlagCode, string> = {
    england: '<rect width="90" height="60" fill="#fff"/><path d="M0 24h90v12H0zM39 0h12v60H39z" fill="#c8102e"/>',
    germany: '<rect width="90" height="20" fill="#000"/><rect y="20" width="90" height="20" fill="#dd0000"/><rect y="40" width="90" height="20" fill="#ffce00"/>',
    spain: '<rect width="90" height="15" fill="#aa151b"/><rect y="15" width="90" height="30" fill="#f1bf00"/><rect y="45" width="90" height="15" fill="#aa151b"/>',
    italy: '<rect width="30" height="60" fill="#009246"/><rect x="30" width="30" height="60" fill="#fff"/><rect x="60" width="30" height="60" fill="#ce2b37"/>',
    france: '<rect width="30" height="60" fill="#0055a4"/><rect x="30" width="30" height="60" fill="#fff"/><rect x="60" width="30" height="60" fill="#ef4135"/>',
    portugal: '<rect width="36" height="60" fill="#006600"/><rect x="36" width="54" height="60" fill="#ff0000"/><circle cx="36" cy="30" r="8" fill="#ffcc00"/>',
    netherlands: '<rect width="90" height="20" fill="#ae1c28"/><rect y="20" width="90" height="20" fill="#fff"/><rect y="40" width="90" height="20" fill="#21468b"/>',
    brazil: '<rect width="90" height="60" fill="#009b3a"/><path d="M45 8 82 30 45 52 8 30Z" fill="#ffdf00"/><circle cx="45" cy="30" r="13" fill="#002776"/>',
  }

  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 60" role="img">
      <rect width="90" height="60" rx="8" fill="#eee"/>
      <clipPath id="clip"><rect width="90" height="60" rx="8"/></clipPath>
      <g clip-path="url(#clip)">${flags[code]}</g>
    </svg>
  `)
}
