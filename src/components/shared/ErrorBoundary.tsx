import { Component, type ErrorInfo, type ReactNode } from 'react'

import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useOptionalLocale } from '@/contexts/LocaleContext'
import type { MessageKey } from '@/i18n/de'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Heading of the default fallback, already translated. */
  title?: string
  /** Heading as a message key, for boundaries above the locale provider. */
  titleKey?: MessageKey
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render/runtime errors in its subtree and shows a recoverable fallback
 * instead of unmounting the whole app to a blank white screen. Placed at the app
 * root (fatal safety net) and around the routed <Outlet> (per-page recovery).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface to the console for local debugging; a real backend hook could go
    // here later. Never rethrow — that would defeat the boundary.
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  reset = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset)
    }

    return <DefaultFallback error={error} title={this.props.title} titleKey={this.props.titleKey} onReset={this.reset} />
  }
}

/**
 * The root boundary sits above the locale provider, so translations are
 * optional here: without a provider the English copy is shown.
 */
const FALLBACK_COPY = {
  errorBoundaryFallbackTitle: 'Something went wrong',
  errorBoundaryTitle: 'Football Galaxy hit an unexpected error',
  errorBoundaryFallbackBody: 'An unexpected error occurred while rendering this view.',
  errorTryAgain: 'Try again',
  errorReload: 'Reload',
} as const satisfies Partial<Record<MessageKey, string>>

function DefaultFallback({ error, title, titleKey, onReset }: { error: Error; title?: string; titleKey?: MessageKey; onReset: () => void }) {
  const locale = useOptionalLocale()
  const text = (key: keyof typeof FALLBACK_COPY) => locale?.t(key) ?? FALLBACK_COPY[key]
  const heading =
    title ?? (titleKey && titleKey in FALLBACK_COPY ? text(titleKey as keyof typeof FALLBACK_COPY) : text('errorBoundaryFallbackTitle'))
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="surface-panel w-full max-w-md rounded-2xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || text('errorBoundaryFallbackBody')}</p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {text('errorTryAgain')}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {text('errorReload')}
          </Button>
        </div>
      </div>
    </div>
  )
}
