// tests/actions/register.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const insertReturning = vi.fn()
const insertValues = vi.fn(() => ({ returning: insertReturning }))
const insert = vi.fn(() => ({ values: insertValues }))
vi.mock('@/lib/db', () => ({ db: { insert } }))

const createPref = vi.fn()
vi.mock('@/lib/mercadopago', () => ({
  createCheckoutPreference: createPref,
  CARD_PRICE_CENTS: 9900,
  // registerClient checa isto antes de gravar; aqui o checkout está configurado.
  mercadoPagoMissingEnv: () => [],
}))

const sendConfirmed = vi.fn()
vi.mock('@/lib/email', () => ({ sendRegistrationConfirmed: sendConfirmed }))

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }))

beforeEach(() => {
  vi.clearAllMocks()
  insertReturning
    .mockResolvedValueOnce([{ id: 'user_1' }]) // users (test 1)
    .mockResolvedValueOnce([{ id: 'client_1' }]) // clients (test 1)
    .mockResolvedValueOnce([{ id: 'pay_1' }]) // payments (test 1)
    .mockResolvedValueOnce([{ id: 'user_2' }]) // users (test 2)
    .mockResolvedValueOnce([{ id: 'client_2' }]) // clients (test 2)
    .mockResolvedValueOnce([{ id: 'pay_2' }]) // payments (test 2)
    .mockResolvedValueOnce([{ id: 'user_3' }]) // users (test 3)
    .mockResolvedValueOnce([{ id: 'client_3' }]) // clients (test 3)
    .mockResolvedValueOnce([{ id: 'pay_3' }]) // payments (test 3)
  insert.mockReturnValue({ values: insertValues })
  createPref.mockResolvedValue({ preferenceId: 'pref_1', initPoint: 'https://mp/checkout' })
  sendConfirmed.mockResolvedValue(undefined)
})

describe('registerClient', () => {
  it('creates user/client/payment, opens a preference with the payment id, returns initPoint', async () => {
    const { registerClient } = await import('@/lib/actions/register')
    const res = await registerClient({
      email: 'a@b.com',
      password: 'secret123',
      fullName: 'Ana',
      phone: '+5547999990000',
      country: 'AR',
      clientType: 'foreigner',
      documentType: 'passport',
      documentNumber: 'X123',
      locale: 'es',
      plan: 'individual',
      dependentsList: [],
    })

    expect(res).toEqual({ success: true, initPoint: 'https://mp/checkout' })
    // Valor literal de propósito: derivar de PLANS deixaria o teste tautológico
    // e incapaz de pegar uma tabela de preços errada.
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 4990, status: 'pending' })
    )
    expect(createPref).toHaveBeenCalledWith(
      expect.objectContaining({ externalReference: 'pay_1', payerEmail: 'a@b.com', locale: 'es' })
    )
    expect(sendConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', name: 'Ana', locale: 'es' })
    )
  })

  it('inserts dependents when provided', async () => {
    const { registerClient } = await import('@/lib/actions/register')
    await registerClient({
      email: 'a@b.com',
      password: 'secret123',
      fullName: 'Ana',
      phone: '+5547999990000',
      country: 'AR',
      clientType: 'foreigner',
      documentType: 'passport',
      documentNumber: 'X123',
      locale: 'es',
      plan: 'casal',
      dependentsList: [
        { fullName: 'Child', phone: '+5547988887777', country: 'AR', documentType: 'passport', documentNumber: 'Y999' },
      ],
    })
    // db.insert called 4 times: users, clients, dependents, payments
    expect(insert).toHaveBeenCalledTimes(4)
  })

  // O dominio do remetente nao existe (NXDOMAIN), entao o Resend recusa o envio.
  // Antes do try/catch isso derrubava a action DEPOIS de gravar tudo: o assinante
  // ficava no banco sem receber o link, e nao conseguia refazer o cadastro porque
  // users.email e unique. Uma cortesia que falha nao pode custar a venda.
  it('ainda devolve o initPoint quando o e-mail de confirmacao falha', async () => {
    sendConfirmed.mockRejectedValueOnce(new Error('domain is not verified'))
    const { registerClient } = await import('@/lib/actions/register')

    const res = await registerClient({
      email: 'a@b.com',
      password: 'secret123',
      fullName: 'Ana',
      phone: '+5547999990000',
      country: 'BR',
      clientType: 'brazilian',
      documentType: 'cpf',
      documentNumber: '12345678901',
      locale: 'pt',
      plan: 'individual',
      dependentsList: [],
    })

    expect(sendConfirmed).toHaveBeenCalled()
    expect(res).toEqual({ success: true, initPoint: 'https://mp/checkout' })
  })
})
