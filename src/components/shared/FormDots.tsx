import { memo } from 'react'

import { useLocale } from '@/contexts/LocaleContext'
import { cn, formatDate } from '@/lib/utils'
import type { FormResult } from '@/services/types'

const tone = {
  W: 'bg-result-win text-white',
  D: 'bg-result-draw text-black',
  L: 'bg-result-loss text-white',
} as const

const word = { W: 'resultWin', D: 'resultDraw', L: 'resultLoss' } as const
const letter = { W: 'resultW', D: 'resultD', L: 'resultL' } as const

/**
 * Last five results as lettered chips (S/U/N or W/D/L), so the result never
 * depends on colour alone. One accessible summary instead of a tab stop per
 * dot; the per-match detail is a native tooltip.
 */
export const FormDots = memo(function FormDots({ form, className }: { form: FormResult[]; className?: string }) {
  const { t } = useLocale()
  const recent = form.slice(-5)
  if (!recent.length) return null

  const describe = (result: FormResult) =>
    [t(word[result.result]), result.opponent ? `${t('versus')} ${result.opponent}` : '', result.score].filter(Boolean).join(' ')

  return (
    <span
      role="img"
      aria-label={t('formSummary', { results: recent.map(describe).join(', ') })}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {recent.map((result, index) => (
        <span
          key={`${result.date}-${index}`}
          aria-hidden
          title={result.opponent ? `${describe(result)} · ${formatDate(result.date)}` : undefined}
          className={cn('grid h-[1.125rem] w-[1.125rem] place-items-center rounded-xs text-2xs font-bold leading-none', tone[result.result])}
        >
          {t(letter[result.result])}
        </span>
      ))}
    </span>
  )
})
