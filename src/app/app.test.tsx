import { render, screen } from '@testing-library/react'

import { App } from './app'

describe('App', () => {
  it('renders the project foundation shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /standings dashboard/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /fetching premier league/i }),
    ).toBeInTheDocument()
  })
})
