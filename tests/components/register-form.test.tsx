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
    // senha é gerada no submit; telefone e país voltaram ao form (pedido 05/08)
    // labelDocumentNumber: 'Número do documento'
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    await userEvent.type(screen.getByLabelText(/telefone/i), '47999998888')
    // submit button: s.submit = 'Finalizar cadastro'
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'pt', fullName: 'Ana' })
      )
      expect(window.location.href).toBe('https://mp/checkout/abc')
    })
  })

  it('sends phone and country for the holder', async () => {
    vi.mocked(registerClient).mockResolvedValue({ success: true, initPoint: 'https://mp/checkout/abc' })
    render(<RegisterForm locale="pt" />)

    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    await userEvent.type(screen.getByLabelText(/telefone/i), '47999998888')
    await userEvent.selectOptions(screen.getByLabelText(/país/i), 'AR')
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '47999998888', country: 'AR' })
      )
    })
  })

  it('sends phone and country for each dependent', async () => {
    vi.mocked(registerClient).mockResolvedValue({ success: true, initPoint: 'https://mp/checkout/abc' })
    render(<RegisterForm locale="pt" />)

    // Plano individual (padrão) não tem dependente — precisa subir de plano.
    await userEvent.selectOptions(screen.getByLabelText(/^plano$/i), 'familia')
    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    await userEvent.type(screen.getByLabelText(/telefone/i), '47999998888')

    await userEvent.click(screen.getByRole('button', { name: /adicionar dependente/i }))
    await userEvent.type(screen.getByLabelText(/nome do dependente 1/i), 'Beto')
    await userEvent.type(screen.getByLabelText(/telefone do dependente 1/i), '47911112222')
    await userEvent.type(screen.getByLabelText(/documento do dependente 1/i), '98765432100')
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({
          dependentsList: [expect.objectContaining({ phone: '47911112222', country: 'BR' })],
        })
      )
    })
  })

  it('envia o plano escolhido', async () => {
    vi.mocked(registerClient).mockResolvedValue({ success: true, initPoint: 'https://mp/checkout/abc' })
    render(<RegisterForm locale="pt" />)

    await userEvent.selectOptions(screen.getByLabelText(/^plano$/i), 'casal')
    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/^número do documento$/i), '12345678900')
    await userEvent.type(screen.getByLabelText(/^telefone \/ whatsapp$/i), '47999998888')
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(vi.mocked(registerClient)).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'casal' })
      )
    })
  })

  it('corta dependentes que não cabem ao descer de plano', async () => {
    render(<RegisterForm locale="pt" />)

    await userEvent.selectOptions(screen.getByLabelText(/^plano$/i), 'familia')
    await userEvent.click(screen.getByRole('button', { name: /adicionar dependente/i }))
    await userEvent.click(screen.getByRole('button', { name: /adicionar dependente/i }))
    expect(screen.getByLabelText(/nome do dependente 2/i)).toBeTruthy()

    // Casal aceita 1: o segundo dependente tem que desaparecer, senão o
    // servidor recusa o cadastro todo por exceder o plano.
    await userEvent.selectOptions(screen.getByLabelText(/^plano$/i), 'casal')
    expect(screen.queryByLabelText(/nome do dependente 2/i)).toBeNull()
    expect(screen.getByLabelText(/nome do dependente 1/i)).toBeTruthy()

    // Individual não aceita nenhum.
    await userEvent.selectOptions(screen.getByLabelText(/^plano$/i), 'individual')
    expect(screen.queryByLabelText(/nome do dependente 1/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /adicionar dependente/i })).toBeNull()
  })

  // Cliente (05/08): "não pode finalizar sem pagar, tem que ter uma trava".
  it('never reports success when there is no checkout link', async () => {
    vi.mocked(registerClient).mockResolvedValue({ success: true, initPoint: '' })
    render(<RegisterForm locale="pt" />)

    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/número do documento/i), '12345678900')
    await userEvent.type(screen.getByLabelText(/telefone/i), '47999998888')
    await userEvent.click(screen.getByRole('button', { name: /finalizar cadastro/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })
    expect(screen.queryByText(/cadastro recebido/i)).toBeNull()
    expect(window.location.href).toBe('')
  })

  it('renders Spanish labels when locale="es"', () => {
    render(<RegisterForm locale="es" />)
    // labelEmail in ES
    expect(screen.getByLabelText(/correo electrónico/i)).toBeTruthy()
    // submit button in ES (heading is now at page level, not in component)
    expect(screen.getByRole('button', { name: /finalizar registro/i })).toBeTruthy()
  })
})
