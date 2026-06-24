import { vi } from 'vitest'
vi.mock('server-only', () => ({}))

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '@/app/[locale]/(public)/page'

describe('localized landing page', () => {
  it('renders the pt hero title', async () => {
    const ui = await HomePage({ params: Promise.resolve({ locale: 'pt' }) })
    render(ui)
    expect(
      screen.getByText('Economize de verdade em Bombinhas SC')
    ).toBeInTheDocument()
  })

  it('renders the es hero title', async () => {
    const ui = await HomePage({ params: Promise.resolve({ locale: 'es' }) })
    render(ui)
    expect(
      screen.getByText('Ahorra de verdad en Bombinhas SC')
    ).toBeInTheDocument()
  })
})
