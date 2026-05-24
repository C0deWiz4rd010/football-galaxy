import { StandingsState } from './standings-state'
import {
  getDashboardCopy,
  type LanguageCode,
} from '../../shared/i18n/dashboard-locale'

type StandingsLoadingProps = {
  leagueLabel: string
  language: LanguageCode
}

export function StandingsLoading({
  leagueLabel,
  language,
}: StandingsLoadingProps) {
  const copy = getDashboardCopy(language)

  return (
    <div className="space-y-6">
      <StandingsState
        eyebrow={copy.loadingEyebrow}
        title={copy.loadingTitle(leagueLabel)}
        message={copy.loadingMessage}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="dashboard-surface rounded-[26px] p-5 sm:p-6"
            >
              <div className="loading-shimmer h-3 w-20 rounded-full" />
              <div className="loading-shimmer mt-4 h-8 w-32 rounded-full" />
              <div className="loading-shimmer mt-3 h-4 w-28 rounded-full" />
            </div>
          ))}
        </div>

        <div className="dashboard-panel mt-6 rounded-[30px] p-5 sm:p-6">
          <div className="loading-shimmer h-6 w-40 rounded-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[48px_minmax(0,2fr)_repeat(4,52px)] items-center gap-3"
              >
                <div className="loading-shimmer h-11 rounded-2xl" />
                <div className="loading-shimmer h-11 rounded-2xl" />
                {Array.from({ length: 4 }).map((__, cellIndex) => (
                  <div
                    key={cellIndex}
                    className="loading-shimmer h-11 rounded-2xl"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </StandingsState>
    </div>
  )
}
