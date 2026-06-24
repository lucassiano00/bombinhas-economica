import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DigitalCard } from '@/components/card/digital-card'

describe('DigitalCard', () => {
  const baseProps = {
    holderName: 'João Silva',
    status: 'active' as const,
    dependents: [],
  }

  it('renders holder name', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('renders ATIVO badge for active status', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
  })

  it('renders INATIVO badge for inactive status', () => {
    render(<DigitalCard {...baseProps} status="inactive" />)
    expect(screen.getByText('INATIVO')).toBeInTheDocument()
  })

  it('renders dependents list', () => {
    const props = {
      ...baseProps,
      dependents: [
        { id: '1', clientId: 'c1', fullName: 'Maria Silva', documentType: 'cpf' as const, documentNumber: '11111' },
      ],
    }
    render(<DigitalCard {...props} />)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
  })

  it('does not render dependents section when empty', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.queryByText('Dependentes')).not.toBeInTheDocument()
  })
})
