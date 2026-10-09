import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { LocaleProvider } from '@/contexts/LocaleContext'

import { Sidebar } from './Sidebar'

function renderSidebar() {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <FavoritesProvider>
          <Sidebar />
        </FavoritesProvider>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('keeps World Cup 2026 in its own navigation group', () => {
    renderSidebar()

    expect(screen.getAllByText('WM 2026').length).toBeGreaterThan(1)
    expect(screen.getByRole('link', { name: /wm 2026/i }).getAttribute('href')).toBe('/world-cup-2026')
    expect(screen.getByRole('link', { name: /^spiele$/i }).getAttribute('href')).toBe('/world-cup-2026/matches')
    expect(screen.getByText('Ligen')).toBeTruthy()
    expect(screen.getByRole('link', { name: /premier league/i }).getAttribute('href')).toBe('/premier-league')
  })
})
