import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders ATIVO for active status', () => {
    render(<Badge status="active" />)
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
  })

  it('renders INATIVO for inactive status', () => {
    render(<Badge status="inactive" />)
    expect(screen.getByText('INATIVO')).toBeInTheDocument()
  })

  it('renders PENDENTE for pending status', () => {
    render(<Badge status="pending" />)
    expect(screen.getByText('PENDENTE')).toBeInTheDocument()
  })

  it('applies brand green bg for active (bg-green, not bg-green-100)', () => {
    const { container } = render(<Badge status="active" />)
    // Tasks 1-3 aligned badge to on-brand tokens: bg-green (--color-green #157a3a) with white text
    expect(container.firstChild).toHaveClass('bg-green')
  })
})
