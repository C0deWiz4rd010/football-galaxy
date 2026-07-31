import { Component, type ErrorInfo, type ReactNode } from 'react'

import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /** Short label describing the boundary, used in the default fallback copy. */
  title?: string
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

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="surface-panel w-full max-w-md rounded-fg-2xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {this.props.title ?? 'Something went wrong'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred while rendering this view.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button onClick={this.reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
