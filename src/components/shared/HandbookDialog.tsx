/**
 * `HandbookDialog` is the in-app user manual. Sections are localized via
 * `useLocale` and rendered into a left-nav / right-content modal.
 */

import { useMemo, useState } from 'react'

import {
  BarChart3,
  BookOpen,
  Compass,
  Globe2,
  Keyboard,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-6 text-muted-foreground">{children}</p>
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold tracking-tight text-foreground">{children}</h3>
}

function Tip({ tipLabel, children }: { tipLabel: string; children: React.ReactNode }) {
  return (
    <div className="surface-soft rounded-fg-md border border-border/60 p-3 text-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{tipLabel}</p>
      <p className="mt-1 text-foreground">{children}</p>
    </div>
  )
}

export function HandbookDialog() {
  const { t } = useLocale()
  const sections = useMemo(
    () => [
      {
        id: 'overview',
        label: t('handbookWelcomeLabel'),
        icon: BookOpen,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookWelcomeTitle')}</H>
            <P>{t('handbookWelcomeBody')}</P>
            <Tip tipLabel={t('tip')}>{t('handbookWelcomeTip')}</Tip>
          </div>
        ),
      },
      {
        id: 'dashboard',
        label: t('handbookDashboardLabel'),
        icon: Layers,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookDashboardTitle')}</H>
            <P>{t('handbookDashboardBody1')}</P>
            <P>{t('handbookDashboardBody2')}</P>
            <Tip tipLabel={t('tip')}>{t('handbookDashboardTip')}</Tip>
          </div>
        ),
      },
      {
        id: 'teams',
        label: t('handbookTeamsLabel'),
        icon: ShieldCheck,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookTeamsTitle')}</H>
            <P>{t('handbookTeamsBody1')}</P>
            <P>{t('handbookTeamsBody2')}</P>
          </div>
        ),
      },
      {
        id: 'explorers',
        label: t('handbookExplorersLabel'),
        icon: Users,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookExplorersTitle')}</H>
            <P>{t('handbookExplorersBody')}</P>
            <Tip tipLabel={t('tip')}>{t('handbookExplorersTip')}</Tip>
          </div>
        ),
      },
      {
        id: 'compare',
        label: t('handbookCompareLabel'),
        icon: BarChart3,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookCompareTitle')}</H>
            <P>{t('handbookCompareBody')}</P>
          </div>
        ),
      },
      {
        id: 'galaxy',
        label: t('handbookGalaxyLabel'),
        icon: Globe2,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookGalaxyTitle')}</H>
            <P>{t('handbookGalaxyBody')}</P>
          </div>
        ),
      },
      {
        id: 'data',
        label: t('handbookDataLabel'),
        icon: Compass,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookDataTitle')}</H>
            <P>{t('handbookDataBody')}</P>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">football-data.org</Badge>
              <Badge variant="outline">TheSportsDB</Badge>
              <Badge variant="outline">ESPN</Badge>
              <Badge variant="outline">Mock data</Badge>
            </div>
            <Tip tipLabel={t('tip')}>{t('handbookDataTip')}</Tip>
          </div>
        ),
      },
      {
        id: 'shortcuts',
        label: t('handbookShortcutsLabel'),
        icon: Keyboard,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookShortcutsTitle')}</H>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Cmd</kbd>/
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Ctrl</kbd> +
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">K</kbd>{' '}
                — {t('shortcutOpenPalette')}
              </li>
              <li>
                <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Esc</kbd> —{' '}
                {t('shortcutCloseDialog')}
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'about',
        label: t('handbookAboutLabel'),
        icon: Sparkles,
        render: () => (
          <div className="space-y-4">
            <H>{t('handbookAboutTitle')}</H>
            <P>{t('handbookAboutBody')}</P>
          </div>
        ),
      },
    ],
    [t],
  )

  const fallback = sections[0]!
  const [activeId, setActiveId] = useState(fallback.id)
  const active = sections.find((section) => section.id === activeId) ?? fallback

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('openHandbook')} title={t('handbook')}>
          <BookOpen className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="grid max-w-4xl gap-0 overflow-hidden p-0 sm:grid-cols-[200px_minmax(0,1fr)]">
        <DialogTitle className="sr-only">{t('handbookTitle')}</DialogTitle>
        <nav className="border-b border-border bg-muted/30 p-3 sm:border-b-0 sm:border-r">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t('handbookNav')}
          </p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = section.id === activeId
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-fg-md px-3 py-2 text-left text-sm transition',
                      isActive
                        ? 'bg-primary/12 text-foreground shadow-fg-1'
                        : 'text-muted-foreground hover:bg-background hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <article className="max-h-[70vh] overflow-y-auto p-6">{active.render()}</article>
      </DialogContent>
    </Dialog>
  )
}
