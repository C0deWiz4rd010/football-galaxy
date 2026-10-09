import { Link, NavLink } from 'react-router-dom'

import { exploreNav, toolsNav, worldCupNav } from '@/app/navigation'
import { useLocale } from '@/contexts/LocaleContext'
import { leagues } from '@/lib/leagues'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/shared/ui/brand-logo'

import { FavoritesList } from './FavoritesList'
import { iconTone, navLinkClass } from './navStyles'

function SectionLabel({ children }: { children: string }) {
  return <p className="px-5 pb-1 pt-3 text-2xs font-semibold uppercase tracking-eyebrow text-muted-foreground">{children}</p>
}

export function Sidebar() {
  const { t } = useLocale()
  const [wcOverview, ...wcSections] = worldCupNav

  return (
    <aside
      aria-label={t('navigation')}
      data-sidebar
      className="surface-panel fixed left-shell-gutter top-shell-gutter z-nav hidden h-[calc(100dvh-2*var(--fg-shell-gutter))] w-sidebar overflow-hidden rounded-2xl md:flex md:flex-col"
    >
      <Link
        to="/premier-league"
        className="app-grid-lines relative flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <BrandLogo subtitle={t('liveDashboard')} />
      </Link>

      {/* Scrolls on short viewports instead of clipping the league list. */}
      <nav aria-label={t('mainNavigation')} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
        <SectionLabel>{t('explore')}</SectionLabel>
        <div className="space-y-0.5 px-3">
          {exploreNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(item.tone, isActive)}>
              <item.icon className={cn('h-4 w-4', iconTone[item.tone ?? 'default'])} aria-hidden />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </div>

        <SectionLabel>{t('worldCup2026')}</SectionLabel>
        <div className="space-y-1 px-3">
          {wcOverview ? (
            <NavLink to={wcOverview.to} end className={({ isActive }) => navLinkClass(wcOverview.tone, isActive)}>
              <wcOverview.icon className="h-4 w-4 text-warning-fg" aria-hidden />
              {t('worldCup2026')}
            </NavLink>
          ) : null}
          <div className="grid grid-cols-2 gap-1">
            {wcSections.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkClass(item.tone, isActive, 'min-h-9 gap-1.5 px-2 py-1.5 text-xs')}
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{t(item.shortLabelKey ?? item.labelKey)}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <SectionLabel>{t('leagues')}</SectionLabel>
        <div className="space-y-0.5 px-3">
          {leagues.map((league) => (
            <NavLink key={league.id} to={`/${league.id}`} className={({ isActive }) => navLinkClass(undefined, isActive, 'py-1.5')}>
              <img src={league.logo} alt="" width={32} height={32} decoding="async" className="h-8 w-8 shrink-0 rounded-sm bg-white/90 object-contain p-1" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{league.name}</span>
                <span className="block truncate text-2xs text-muted-foreground">{league.country}</span>
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="shrink-0 space-y-1 border-t border-border/60 p-2.5">
        {toolsNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClass(item.tone, isActive)}>
            <item.icon className="h-4 w-4" aria-hidden />
            {t(item.labelKey)}
          </NavLink>
        ))}
        <FavoritesList limit={2} />
      </div>
    </aside>
  )
}
