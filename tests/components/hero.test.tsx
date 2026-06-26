import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/site/hero'

describe('Hero', () => {
  it('renders the gold brand location heading', () => {
    render(<Hero locale="pt" />)
    // "Bombinhas SC" appears in both the h2 span and a partner card; check the heading span
    const matches = screen.getAllByText('Bombinhas SC')
    expect(matches.length).toBeGreaterThan(0)
    // The heading version is inside a span.text-gold inside h2
    expect(matches.some((el) => el.tagName === 'SPAN' && el.closest('h2'))).toBe(true)
  })

  it('renders PT CTA button with correct text', () => {
    render(<Hero locale="pt" />)
    expect(screen.getByRole('link', { name: /quero economizar agora/i })).toBeInTheDocument()
  })

  it('PT CTA button links to /pt/cadastro', () => {
    render(<Hero locale="pt" />)
    const link = screen.getByRole('link', { name: /quero economizar agora/i })
    expect(link).toHaveAttribute('href', '/pt/cadastro')
  })

  it('renders ES CTA with correct text', () => {
    render(<Hero locale="es" />)
    expect(screen.getByRole('link', { name: /quiero ahorrar ahora/i })).toBeInTheDocument()
  })

  it('renders the price in sub-copy', () => {
    render(<Hero locale="pt" />)
    expect(screen.getByText(/R\$ 99,00\/ano/)).toBeInTheDocument()
  })
})
