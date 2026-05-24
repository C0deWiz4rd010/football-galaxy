import {
  LANGUAGE_OPTIONS,
  type LanguageCode,
  getDashboardCopy,
} from '../i18n/dashboard-locale'
import { FlagIcon } from './flag-icon'

type LanguageSelectorProps = {
  language: LanguageCode
  onSelect: (language: LanguageCode) => void
}

export function LanguageSelector({
  language,
  onSelect,
}: LanguageSelectorProps) {
  const copy = getDashboardCopy(language)

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] sm:inline">
        {copy.languageLabel}
      </span>
      <div className="dashboard-surface flex items-center gap-1 rounded-full p-1">
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = option.code === language

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onSelect(option.code)}
              aria-label={option.label}
              aria-pressed={isActive}
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full transition-[background-color,color,transform,border-color,box-shadow] duration-200',
                isActive
                  ? 'bg-[linear-gradient(135deg,var(--league-accent-soft),rgba(255,255,255,0.05))] text-[var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--league-accent-soft)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              <FlagIcon
                code={option.flagCode}
                title={option.label}
                className="h-4 w-4"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
