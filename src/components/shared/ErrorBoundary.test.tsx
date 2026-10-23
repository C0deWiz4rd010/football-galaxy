import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('kaboom')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress the expected React error log noise for these cases.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows the fallback instead of a blank screen when a child throws', () => {
    render(
      <ErrorBoundary title="Boundary title">
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Boundary title')).toBeInTheDocument()
    expect(screen.getByText('kaboom')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('recovers when reset is triggered and the child no longer throws', async () => {
    let shouldThrow = true
    function Maybe() {
      if (shouldThrow) throw new Error('kaboom')
      return <p>Recovered</p>
    }

    render(
      <ErrorBoundary>
        <Maybe />
      </ErrorBoundary>,
    )

    expect(screen.getByText('kaboom')).toBeInTheDocument()

    shouldThrow = false
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('Recovered')).toBeInTheDocument()
  })
})
