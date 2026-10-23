import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LocaleProvider } from '@/contexts/LocaleContext'

import { Toaster, toast } from './toast'

describe('Toaster', () => {
  it('shows a translated toast once even when the same failure is reported twice', () => {
    render(
      <LocaleProvider>
        <Toaster />
      </LocaleProvider>,
    )

    act(() => {
      toast({ titleKey: 'loadFailedTitle', description: 'Upstream 503' })
      toast({ titleKey: 'loadFailedTitle', description: 'Upstream 503' })
    })

    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByText('Upstream 503')).toBeInTheDocument()
  })
})
