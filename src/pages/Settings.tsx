import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { ThemePicker } from '@/components/settings/ThemePicker'
import { PageSection } from '@/components/shared/PageSection'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t, locale, setLocale } = useLocale()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="mx-auto w-full max-w-fg-narrow space-y-fg-7">
      <PageSection
        eyebrow="Football Galaxy"
        title={t('settings')}
        description={t('appearanceHint')}
      />

      <PageSection eyebrow={t('appearance')} title={t('colorTheme')}>
        <ThemePicker />

        <div className="surface-panel rounded-fg-lg p-fg-4">
          <p className="mb-fg-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t('mode')}
          </p>
          <div className="grid grid-cols-2 gap-fg-2">
            {[
              { id: 'light', label: t('lightMode'), icon: Sun, active: !isDark },
              { id: 'dark', label: t('darkMode'), icon: Moon, active: isDark },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.active}
                  onClick={() => setTheme(item.id)}
                  className={cn(
                    'interactive-card flex items-center justify-center gap-2 rounded-fg-md border px-3 py-2.5 text-sm font-medium',
                    item.active
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border/55 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </PageSection>

      <PageSection eyebrow={t('languageRegion')} title={t('language')}>
        <div className="surface-panel rounded-fg-lg p-fg-4">
          <div className="grid grid-cols-2 gap-fg-2">
            {[
              { id: 'de', label: 'Deutsch' },
              { id: 'en', label: 'English' },
            ].map((item) => {
              const active = locale === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLocale(item.id as 'de' | 'en')}
                  className={cn(
                    'interactive-card rounded-fg-md border px-3 py-2.5 text-sm font-medium',
                    active
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border/55 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </PageSection>

      <PageSection eyebrow="About" title="Version">
        <div className="surface-panel flex items-center justify-between rounded-fg-lg p-fg-4">
          <p className="text-sm text-muted-foreground">Football Galaxy</p>
          <span className="rounded-fg-sm border border-border/55 px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
            v{__APP_VERSION__}
          </span>
        </div>
      </PageSection>
    </div>
  )
}
