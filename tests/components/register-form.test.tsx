// tests/components/register-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/actions/register', () => ({ registerClient: vi.fn() }))

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
    // locale is now a prop (defaulting to 'pt'); no useParams mock needed
    render(<RegisterForm locale="pt" />)

    // Selectors matched to the REAL PT labels in register-form.tsx STRINGS.pt:
    // labelFullName: 'Nome completo'
    await userEvent.type(screen.getByLabelText(/nome/i), 'Ana')
    // labelEmail: 'E-mail'
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    // hotfix demo: senha e telefone saíram da UI (senha é gerada no submit)
    // labelDocumentNumber: 'Número do documento'
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    // submit button: s.submit = 'Finalizar cadastro'
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'pt', fullName: 'Ana' })
      )
      expect(window.location.href).toBe('https://mp/checkout/abc')
    })
  })

  it('renders Spanish labels when locale="es"', () => {
    render(<RegisterForm locale="es" />)
    // labelEmail in ES
    expect(screen.getByLabelText(/correo electrónico/i)).toBeTruthy()
    // submit button in ES (heading is now at page level, not in component)
    expect(screen.getByRole('button', { name: /finalizar registro/i })).toBeTruthy()
  })
})
