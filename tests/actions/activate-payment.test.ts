import { describe, it, expect, vi, beforeEach } from 'vitest'

const getPayment = vi.fn()
vi.mock('@/lib/mercadopago', () => ({ getMercadoPagoPayment: getPayment }))

const sendActivated = vi.fn()
vi.mock('@/lib/email', () => ({ sendCardActivated: sendActivated }))

// Chainable drizzle mock:
// First select: db.select().from().where().limit()
// Second select: db.select().from().innerJoin().where().limit()
// Both chains share the `limit` mock (called once per query via mockResolvedValueOnce)
const limit = vi.fn()
const where2 = vi.fn(() => ({ limit }))
const innerJoin = vi.fn(() => ({ where: where2 }))
const where1 = vi.fn(() => ({ limit }))
const from = vi.fn(() => ({ where: where1, innerJoin }))
const select = vi.fn(() => ({ from }))
const setWhere = vi.fn()
const set = vi.fn(() => ({ where: setWhere }))
const update = vi.fn(() => ({ set }))
vi.mock('@/lib/db', () => ({ db: { select, update } }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('applyPaymentNotification', () => {
  it('activates the client when MP reports approved and payment is still pending', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'pay_1' })
    // first select → payment row (pending); second select → client row + user email
    limit
      .mockResolvedValueOnce([{ id: 'pay_1', clientId: 'client_1', status: 'pending' }])
      .mockResolvedValueOnce([{ fullName: 'Ana', locale: 'pt', email: 'a@b.com', status: 'pending' }])

    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    const result = await applyPaymentNotification('999')

    expect(result).toBe('activated')
    expect(update).toHaveBeenCalled() // payment + client updated
    expect(sendActivated).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', name: 'Ana', locale: 'pt' })
    )
  })

  it('is idempotent: already-approved payment does nothing', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'pay_1' })
    limit.mockResolvedValueOnce([{ id: 'pay_1', clientId: 'client_1', status: 'approved' }])

    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    const result = await applyPaymentNotification('999')

    expect(result).toBe('ignored')
    expect(sendActivated).not.toHaveBeenCalled()
  })

  it('returns not_found when the external_reference matches no payment', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'missing' })
    limit.mockResolvedValueOnce([])
    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    expect(await applyPaymentNotification('999')).toBe('not_found')
  })
})
