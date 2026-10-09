import { useState } from 'react'

import { normalizeImageSrc } from '@/lib/visualAssets'

type AssetImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string
  /**
   * One or more fallback image sources, tried left to right when the
   * preceding one fails. The last entry should be a known-good SVG data URI
   * so the UI never shows a broken-image icon.
   */
  fallbackSrc: string | Array<string | undefined>
  /** Above-the-fold hero image: load eagerly with high fetch priority. */
  priority?: boolean
}

function buildSourceChain(src: string | undefined, fallback: string | Array<string | undefined>) {
  const chain: string[] = []
  for (const value of [src, ...(Array.isArray(fallback) ? fallback : [fallback])]) {
    const normalized = normalizeImageSrc(value)
    if (normalized && !chain.includes(normalized)) chain.push(normalized)
  }
  return chain
}

function AssetImageElement({ sources, ...props }: Omit<AssetImageProps, 'src' | 'fallbackSrc' | 'priority'> & { sources: string[] }) {
  const [index, setIndex] = useState(0)
  return (
    <img
      {...props}
      src={sources[index] ?? sources[sources.length - 1]}
      onError={() => setIndex((current) => (current < sources.length - 1 ? current + 1 : current))}
    />
  )
}

/**
 * Remote image with a fallback chain. No fade-in: images paint as soon as
 * they decode (an opacity transition delays LCP and hides images when
 * animations are paused).
 */
export function AssetImage({ src, fallbackSrc, className, priority = false, loading, ...props }: AssetImageProps) {
  const sources = buildSourceChain(src, fallbackSrc)
  if (sources.length === 0) return null

  return (
    <AssetImageElement
      // Restart from the first source whenever the chain changes.
      key={sources.join('|')}
      {...props}
      sources={sources}
      loading={priority ? 'eager' : (loading ?? 'lazy')}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
    />
  )
}
