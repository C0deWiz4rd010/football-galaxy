import { Check } from 'lucide-react'

import { usePalette, type PaletteId } from '@/contexts/PaletteContext'
import { cn } from '@/lib/utils'

export function ThemePicker() {
  const { palette, setPalette, palettes } = usePalette()

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="grid grid-cols-2 gap-fg-3 sm:grid-cols-3"
    >
      {palettes.map((item) => {
        const active = palette === item.id

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPalette(item.id as PaletteId)}
            className={cn(
              'interactive-card flex flex-col gap-fg-3 rounded-fg-lg border p-fg-4 text-left',
              active
                ? 'border-primary/60 bg-primary/5 shadow-fg-2'
                : 'border-border/55 hover:border-border',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="flex h-9 w-16 items-center overflow-hidden rounded-fg-md border border-border/40"
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
                  <Check className="h-3 w-3" />
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
