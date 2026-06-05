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

  it('applies green color for active', () => {
    const { container } = render(<Badge status="active" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })
})
