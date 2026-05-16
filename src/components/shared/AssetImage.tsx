import { useMemo, useState } from 'react'
import { normalizeImageSrc } from '@/lib/visualAssets'

type AssetImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string
  /**
   * One or more fallback image sources. They are tried left-to-right when the
   * preceding source fails to load. The final entry should always be a known-good
   * SVG/data-URI so the UI never shows a broken-image icon.
   */
  fallbackSrc: string | Array<string | undefined>
}

function buildSourceChain(src: string | undefined, fallback: string | Array<string | undefined>) {
  const chain: string[] = []
  const push = (value: string | undefined) => {
    const normalized = normalizeImageSrc(value)
    if (normalized && !chain.includes(normalized)) {
      chain.push(normalized)
    }
  }

  push(src)
  if (Array.isArray(fallback)) {
    fallback.forEach(push)
  } else {
    push(fallback)
  }

  return chain
}

function AssetImageElement({
  sources,
  alt,
  ...props
}: Omit<AssetImageProps, 'src' | 'fallbackSrc'> & { sources: string[] }) {
  const [index, setIndex] = useState(0)
  const currentSrc = sources[index] ?? sources[sources.length - 1]

  return (
    <img
      {...props}
      alt={alt}
      src={currentSrc}
      onError={() => {
        setIndex((current) => (current < sources.length - 1 ? current + 1 : current))
      }}
    />
  )
}

export function AssetImage({ src, fallbackSrc, alt, ...props }: AssetImageProps) {
  const sources = useMemo(() => buildSourceChain(src, fallbackSrc), [src, fallbackSrc])

  // Re-mount when the source chain changes so we restart from index 0.
  const chainKey = sources.join('|')

  if (sources.length === 0) {
    return <img {...props} alt={alt} src="" />
  }

  return <AssetImageElement key={chainKey} {...props} alt={alt} sources={sources} />
}
