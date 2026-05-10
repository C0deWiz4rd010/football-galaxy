import { useState } from 'react'
import { normalizeImageSrc } from '@/lib/visualAssets'

type AssetImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string
  fallbackSrc: string
}

function AssetImageElement({
  initialSrc,
  fallbackSrc,
  alt,
  ...props
}: Omit<AssetImageProps, 'src'> & { initialSrc: string }) {
  const [currentSrc, setCurrentSrc] = useState(initialSrc)

  return (
    <img
      {...props}
      alt={alt}
      src={currentSrc}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  )
}

export function AssetImage({ src, fallbackSrc, alt, ...props }: AssetImageProps) {
  const normalizedSrc = normalizeImageSrc(src) ?? fallbackSrc

  return (
    <AssetImageElement
      key={`${normalizedSrc}|${fallbackSrc}`}
      {...props}
      alt={alt}
      initialSrc={normalizedSrc}
      fallbackSrc={fallbackSrc}
    />
  )
}
