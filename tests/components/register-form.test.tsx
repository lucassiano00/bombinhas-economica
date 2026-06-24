// tests/components/register-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/actions/register', () => ({ registerClient: vi.fn() }))
vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'pt' }) }))

import { RegisterForm } from '@/components/forms/register-form'
import { registerClient } from '@/lib/actions/register'

beforeEach(() => {
  vi.clearAllMocks()
  // jsdom has no navigation; stub the assignment target.
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  })
})

describe('RegisterForm', () => {
  it('redirects the browser to the Mercado Pago init_point on success', async () => {
    vi.mocked(registerClient).mockResolvedValue({ success: true, initPoint: 'https://mp/checkout/abc' })
    render(<RegisterForm />)

    // Selectors matched to the REAL labels in register-form.tsx:
    // label="Nome completo" id="fullName"
    await userEvent.type(screen.getByLabelText(/nome/i), 'Ana')
    // label="E-mail" id="email"
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    // label="Senha (mínimo 8 caracteres)" id="password"
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    // label="Telefone / WhatsApp" id="phone"
    await userEvent.type(screen.getByLabelText(/telefone/i), '+5547999990000')
    // label="Número do documento" id="documentNumber"
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    // submit button: "Criar meu cartão"
    await userEvent.click(screen.getByRole('button', { name: /criar meu cartão/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'pt', fullName: 'Ana' })
      )
      expect(window.location.href).toBe('https://mp/checkout/abc')
    })
  })
})
