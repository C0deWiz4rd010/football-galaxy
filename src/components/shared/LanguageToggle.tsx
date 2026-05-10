import deFlag from '@/assets/flags/de.svg'
import enFlag from '@/assets/flags/en.svg'
import { useLocale } from '@/contexts/LocaleContext'

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div className="app-pill hidden items-center gap-1 p-1 sm:flex" aria-label={t('language')}>
      {[
        { id: 'de', label: 'Deutsch', flag: deFlag },
        { id: 'en', label: 'English', flag: enFlag },
      ].map((item) => {
        const active = locale === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLocale(item.id as 'de' | 'en')}
            className={[
              'flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            aria-pressed={active}
            title={item.label}
          >
            <img src={item.flag} alt={item.label} className="h-3.5 w-5 rounded-[3px] object-cover" />
          </button>
        )
      })}
    </div>
  )
}
