import { useEffect, useState } from 'react'
import { normalizeImageSrc } from '@/lib/visualAssets'

type AssetImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string
  fallbackSrc: string
}

export function AssetImage({ src, fallbackSrc, alt, ...props }: AssetImageProps) {
  const [currentSrc, setCurrentSrc] = useState(() => normalizeImageSrc(src) ?? fallbackSrc)

  useEffect(() => {
    setCurrentSrc(normalizeImageSrc(src) ?? fallbackSrc)
  }, [src, fallbackSrc])

  return <img {...props} alt={alt} src={currentSrc} onError={() => setCurrentSrc(fallbackSrc)} />
}
