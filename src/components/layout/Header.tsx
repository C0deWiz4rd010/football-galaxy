import { BookOpen, Moon, Search, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'

import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'

interface HeaderProps {
  title: string
  subtitle: string
  onSearch: () => void
  onHandbook: () => void
}

const isApple = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)

/**
 * Top bar. On phones it only names the page: search, menu, theme and language
 * live in the tab bar and its menu sheet, so the bar never crowds.
 */
export function Header({ title, subtitle, onSearch, onHandbook }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useLocale()

  return (
    <header className="surface-panel sticky top-[calc(var(--fg-shell-gutter)+env(safe-area-inset-top,0px))] z-header mx-shell-gutter flex min-h-header items-center justify-between gap-3 rounded-xl px-4 py-2 md:ml-shell md:px-6">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight">{title}</p>
        <p className="hidden truncate text-xs text-muted-foreground md:block">{subtitle}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-1 md:flex lg:gap-2">
        <div className="hidden lg:block">
          <LanguageToggle />
        </div>
        <Button variant="ghost" size="icon" aria-label={t('openHandbook')} title={t('handbook')} onClick={onHandbook}>
          <BookOpen className="h-5 w-5" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('toggleTheme')}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings" aria-label={t('settings')}>
            <Settings className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 px-3" onClick={onSearch} aria-label={t('search')} aria-keyshortcuts={isApple ? 'Meta+K' : 'Control+K'}>
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden lg:inline">{t('search')}</span>
          <kbd className="hidden rounded-xs bg-muted px-1.5 py-0.5 font-sans text-2xs text-muted-foreground lg:inline">{isApple ? '⌘K' : t('ctrlShortcut')}</kbd>
        </Button>
      </div>
    </header>
  )
}
