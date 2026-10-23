import type { Locale } from '@/contexts/LocaleContext'

import type { LocalizedText } from './types'

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale]
}
