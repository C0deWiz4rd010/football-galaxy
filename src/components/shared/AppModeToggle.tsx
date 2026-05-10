import { useAppMode } from '@/hooks/useAppMode'
import { useLocale } from '@/contexts/LocaleContext'

const modes = [
  { id: 'live', labelKey: 'liveMode' },
  { id: 'ea-fc', labelKey: 'eaModeSoon' },
] as const

export function AppModeToggle() {
  const { mode, setMode } = useAppMode()
  const { t } = useLocale()

  return (
    <div className="app-pill relative hidden items-center gap-1 p-1 lg:flex">
      {modes.map((item) => {
        const active = mode === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={[
              'relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
              active
                ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            aria-pressed={active}
          >
            {t(item.labelKey)}
          </button>
        )
      })}
    </div>
  )
}
