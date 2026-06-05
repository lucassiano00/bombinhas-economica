import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/landing/hero'

describe('Hero', () => {
  it('renders the brand name', () => {
    render(<Hero />)
    expect(screen.getByText('Economize SC!')).toBeInTheDocument()
  })

  it('renders CTA button with correct text', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /quero meu crédito agora/i })).toBeInTheDocument()
  })

  it('CTA button links to /cadastro', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: /quero meu crédito agora/i })
    expect(link).toHaveAttribute('href', '/cadastro')
  })

  it('renders the value proposition text', () => {
    render(<Hero />)
    expect(screen.getByText(/R\$ 49,90/)).toBeInTheDocument()
  })
})
