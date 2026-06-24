// tests/mercadopago.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const createMock = vi.fn()
const getMock = vi.fn()

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn().mockImplementation(function () { return {} }),
  Preference: vi.fn().mockImplementation(function () { return { create: createMock } }),
  Payment: vi.fn().mockImplementation(function () { return { get: getMock } }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.MP_ACCESS_TOKEN = 'TEST-token'
  process.env.NEXT_PUBLIC_APP_URL = 'https://bombinhas.example'
})

describe('createCheckoutPreference', () => {
  it('sends a R$ 99,00 item, external_reference, locale-aware back_urls and notification_url', async () => {
    createMock.mockResolvedValue({ id: 'pref_1', init_point: 'https://mp/checkout/pref_1' })
    const { createCheckoutPreference, CARD_PRICE_BRL } = await import('@/lib/mercadopago')

    const res = await createCheckoutPreference({
      externalReference: 'pay_123',
      payerEmail: 'a@b.com',
      payerName: 'Ana',
      locale: 'es',
    })

    expect(res).toEqual({ preferenceId: 'pref_1', initPoint: 'https://mp/checkout/pref_1' })
    const body = createMock.mock.calls[0][0].body
    expect(body.items[0].unit_price).toBe(CARD_PRICE_BRL)
    expect(body.items[0].currency_id).toBe('BRL')
    expect(body.external_reference).toBe('pay_123')
    expect(body.back_urls.success).toBe('https://bombinhas.example/es/cadastro/sucesso')
    expect(body.notification_url).toBe('https://bombinhas.example/api/webhooks/mercadopago')
    expect(body.auto_return).toBe('approved')
  })
})

describe('getMercadoPagoPayment', () => {
  it('returns a normalized payment from the MP API', async () => {
    getMock.mockResolvedValue({ id: 999, status: 'approved', external_reference: 'pay_123' })
    const { getMercadoPagoPayment } = await import('@/lib/mercadopago')
    const p = await getMercadoPagoPayment('999')
    expect(p).toEqual({ id: '999', status: 'approved', externalReference: 'pay_123' })
    expect(getMock).toHaveBeenCalledWith({ id: '999' })
  })
})
