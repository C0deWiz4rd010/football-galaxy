import { Menu, Moon, Search, Settings, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'

import { HandbookDialog } from '@/components/shared/HandbookDialog'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'

interface HeaderProps {
  title: string
  subtitle: string
  onSearch: () => void
  onMenu: () => void
}

export function Header({ title, subtitle, onSearch, onMenu }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useLocale()

  return (
    <header className="surface-panel sticky top-3 z-30 mx-3 flex min-h-16 items-center justify-between gap-3 rounded-fg-xl px-4 py-3 md:ml-[17.25rem] md:mr-6 md:px-6">
      <div className="min-w-0 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('openMenu')}
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate font-semibold tracking-tight">{title}</h1>
          <p className="hidden text-xs text-muted-foreground md:block">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <LanguageToggle />
        <HandbookDialog />
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('toggleTheme')}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label={t('settings')}>
          <Link to="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="px-2 sm:px-3" onClick={onSearch}>
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t('search')}</span>
          <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] sm:inline">Cmd+K</kbd>
        </Button>
      </div>
    </header>
  )
}
