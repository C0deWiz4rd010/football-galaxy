import * as DialogPrimitive from '@radix-ui/react-dialog'
import { BookOpen, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { NavLink } from 'react-router-dom'

import { exploreNav, toolsNav, worldCupNav } from '@/app/navigation'
import { useLocale } from '@/contexts/LocaleContext'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'

import { FavoritesList } from './FavoritesList'
import { iconTone, navLinkClass } from './navStyles'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="px-1 text-2xs font-semibold uppercase tracking-eyebrow text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

const chipClass = (active: boolean) =>
  cn(
    'flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    active ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border/60 text-muted-foreground hover:text-foreground',
  )

/**
 * Phone menu as a bottom sheet (Radix Dialog: focus trap, Escape, scroll
 * lock). Holds every destination the five-item tab bar has no room for, plus
 * theme, language and the handbook.
 */
export function MobileNavSheet({
  open,
  onOpenChange,
  onOpenHandbook,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenHandbook: () => void
}) {
  const { t, locale, setLocale } = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const close = () => onOpenChange(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-modal flex max-h-[88dvh] flex-col rounded-t-xl border-t border-border/60 bg-background shadow-fg-5 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:hidden"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3">
            <span aria-hidden className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/20" />
            <DialogPrimitive.Title className="text-base font-semibold">{t('navigation')}</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t('close')}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <nav
            aria-label={t('mainNavigation')}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
          >
            <Section title={t('leagues')}>
              <div className="grid grid-cols-5 gap-1.5">
                {leagues.map((league) => (
                  <NavLink
                    key={league.id}
                    to={`/${league.id}`}
                    onClick={close}
                    aria-label={league.name}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-1 text-2xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive ? 'border-primary/60 bg-primary/10 text-foreground' : 'border-border/60 text-muted-foreground',
                      )
                    }
                  >
                    <img src={league.logo} alt="" width={28} height={28} decoding="async" className="h-7 w-7 rounded-xs bg-white/90 object-contain p-0.5" />
                    {league.abbreviation}
                  </NavLink>
                ))}
              </div>
            </Section>

            <Section title={t('explore')}>
              <div className="grid grid-cols-2 gap-1.5">
                {exploreNav.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => navLinkClass(item.tone, isActive, 'min-h-11 border-border/60')}>
                    <item.icon className={cn('h-4 w-4 shrink-0', iconTone[item.tone ?? 'default'])} aria-hidden />
                    <span className="truncate">{t(item.shortLabelKey ?? item.labelKey)}</span>
                  </NavLink>
                ))}
              </div>
            </Section>

            <Section title={t('worldCup2026')}>
              <div className="grid grid-cols-2 gap-1.5">
                {worldCupNav.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={close} className={({ isActive }) => navLinkClass(item.tone, isActive, 'min-h-11 border-border/60')}>
                    <item.icon className="h-4 w-4 shrink-0 text-warning-fg" aria-hidden />
                    <span className="truncate">{t(item.shortLabelKey ?? item.labelKey)}</span>
                  </NavLink>
                ))}
              </div>
            </Section>

            <Section title={t('tools')}>
              <div className="grid grid-cols-2 gap-1.5">
                {toolsNav.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={close} className={({ isActive }) => navLinkClass(item.tone, isActive, 'min-h-11 border-border/60')}>
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{t(item.shortLabelKey ?? item.labelKey)}</span>
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    close()
                    onOpenHandbook()
                  }}
                  className={navLinkClass(undefined, false, 'min-h-11 border-border/60 text-left')}
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{t('handbook')}</span>
                </button>
              </div>
            </Section>

            <Section title={t('appearance')}>
              <div className="flex gap-1.5">
                <button type="button" aria-pressed={resolvedTheme !== 'dark'} onClick={() => setTheme('light')} className={chipClass(resolvedTheme !== 'dark')}>
                  <Sun className="h-4 w-4" aria-hidden /> {t('lightMode')}
                </button>
                <button type="button" aria-pressed={resolvedTheme === 'dark'} onClick={() => setTheme('dark')} className={chipClass(resolvedTheme === 'dark')}>
                  <Moon className="h-4 w-4" aria-hidden /> {t('darkMode')}
                </button>
              </div>
              <div className="flex gap-1.5" role="group" aria-label={t('language')}>
                {(['de', 'en'] as const).map((id) => (
                  <button key={id} type="button" lang={id} aria-pressed={locale === id} onClick={() => setLocale(id)} className={chipClass(locale === id)}>
                    {id === 'de' ? 'Deutsch' : 'English'}
                  </button>
                ))}
              </div>
            </Section>

            <FavoritesList onNavigate={close} />
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
