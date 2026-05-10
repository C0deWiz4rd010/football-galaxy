import { memo } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDate } from '@/lib/utils'
import type { FormResult } from '@/services/types'

const resultClass = {
  W: 'bg-green-500',
  D: 'bg-yellow-400',
  L: 'bg-red-500',
}

export const FormDot = memo(function FormDot({ result }: { result: FormResult }) {
  const label = `${result.result === 'W' ? 'Win' : result.result === 'D' ? 'Draw' : 'Loss'} vs ${result.opponent} ${result.score}`

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={`${label}, ${formatDate(result.date)}`}
            className={cn(
              'inline-block h-3 w-3 rounded-full ring-1 ring-white/30',
              resultClass[result.result],
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          {label}, {formatDate(result.date)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

export function FormDots({ form }: { form: FormResult[] }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {form.slice(-5).map((result, index) => (
        <FormDot key={`${result.date}-${index}`} result={result} />
      ))}
    </div>
  )
}
