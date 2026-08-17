// tests/checkout-indisponivel.test.ts
//
// Deploy de 17/08/2026: o site subiu sem as credenciais do Mercado Pago (só o
// cliente tem). Sem guarda, o comportamento era pior que um erro visível:
// `registerClient` grava users/clients/dependents/payments PRIMEIRO e só depois
// chama o Mercado Pago — então um cadastro sem credencial deixava registro órfão
// no banco e estourava `TypeError` em `NEXT_PUBLIC_APP_URL!.replace(...)`.
//
// Contrato: sem credencial, nada é gravado e a falha diz o que falta.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const ORIGINAL = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL }
  vi.resetModules()
})

describe('mercadoPagoMissingEnv', () => {
  beforeEach(() => vi.resetModules())

  it('lista o que falta quando nenhuma env esta definida', async () => {
    delete process.env.MP_ACCESS_TOKEN
    delete process.env.NEXT_PUBLIC_APP_URL
    const { mercadoPagoMissingEnv, mercadoPagoConfigured } = await import('@/lib/mercadopago')

    expect(mercadoPagoMissingEnv()).toEqual(['MP_ACCESS_TOKEN', 'NEXT_PUBLIC_APP_URL'])
    expect(mercadoPagoConfigured()).toBe(false)
  })

  it('trata string vazia e espaco como ausente', async () => {
    process.env.MP_ACCESS_TOKEN = '   '
    process.env.NEXT_PUBLIC_APP_URL = ''
    const { mercadoPagoConfigured } = await import('@/lib/mercadopago')

    expect(mercadoPagoConfigured()).toBe(false)
  })

  it('fica configurado com as duas presentes', async () => {
    process.env.MP_ACCESS_TOKEN = 'APP_USR-abc'
    process.env.NEXT_PUBLIC_APP_URL = 'https://bombinhas-economica.netlify.app'
    const { mercadoPagoMissingEnv, mercadoPagoConfigured } = await import('@/lib/mercadopago')

    expect(mercadoPagoMissingEnv()).toEqual([])
    expect(mercadoPagoConfigured()).toBe(true)
  })
})

describe('registerClient sem credencial do Mercado Pago', () => {
  it('recusa antes de gravar qualquer coisa no banco', async () => {
    vi.resetModules()

    const insert = vi.fn()
    vi.doMock('@/lib/db', () => ({ db: { insert } }))
    vi.doMock('@/lib/mercadopago', () => ({
      createCheckoutPreference: vi.fn(),
      mercadoPagoConfigured: () => false,
      mercadoPagoMissingEnv: () => ['MP_ACCESS_TOKEN'],
    }))
    vi.doMock('@/lib/email', () => ({ sendRegistrationConfirmed: vi.fn() }))
    vi.doMock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }))

    const { registerClient } = await import('@/lib/actions/register')

    await expect(
      registerClient({
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
    ).rejects.toThrow(/MP_ACCESS_TOKEN/)

    // O ponto do teste: nada de registro orfao.
    expect(insert).not.toHaveBeenCalled()
  })
})
