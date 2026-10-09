import { useRef, type KeyboardEvent } from 'react'

import { Check } from 'lucide-react'

import { useLocale } from '@/contexts/LocaleContext'
import { usePalette, type PaletteId } from '@/contexts/PaletteContext'
import { cn } from '@/lib/utils'

export function ThemePicker() {
  const { palette, setPalette, palettes } = usePalette()
  const { t } = useLocale()
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  // Radio-group keyboard pattern: one tab stop, arrows move and select.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = (index + step + palettes.length) % palettes.length
    setPalette(palettes[next]!.id as PaletteId)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('colorTheme')}
      className="grid grid-cols-2 gap-fg-3 sm:grid-cols-3"
    >
      {palettes.map((item, index) => {
        const active = palette === item.id

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            ref={(node) => {
              refs.current[index] = node
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => setPalette(item.id as PaletteId)}
            className={cn(
              'interactive-card flex flex-col gap-fg-3 rounded-lg border p-fg-4 text-left',
              active
                ? 'border-primary/60 bg-primary/5 shadow-fg-2'
                : 'border-border/55 hover:border-border',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="flex h-9 w-16 items-center overflow-hidden rounded-md border border-border/40"
                aria-hidden
              >
                <span
                  className="h-full flex-1"
                  style={{ background: item.swatch.light }}
                />
                <span
                  className="h-full flex-1"
                  style={{ background: item.swatch.dark }}
                />
              </span>
              {active ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">{item.name}</p>
              <p className="truncate text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
