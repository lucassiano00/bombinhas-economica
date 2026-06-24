import { describe, it, expect } from 'vitest'
import {
  clients,
  payments,
  documentTypeEnum,
  clientTypeEnum,
  paymentStatusEnum,
} from '@/lib/db/schema'

describe('schema — Bombinhas+ Econômica model', () => {
  it('documentType enum is cpf/dni/passport', () => {
    expect(documentTypeEnum.enumValues).toEqual(['cpf', 'dni', 'passport'])
  })

  it('clientType enum is brazilian/foreigner', () => {
    expect(clientTypeEnum.enumValues).toEqual(['brazilian', 'foreigner'])
  })

  it('payment status enum covers the gateway lifecycle', () => {
    expect(paymentStatusEnum.enumValues).toEqual([
      'pending',
      'approved',
      'rejected',
      'refunded',
    ])
  })

  it('clients has the new fields and dropped paymentMethod', () => {
    expect(clients.phone).toBeDefined()
    expect(clients.clientType).toBeDefined()
    expect(clients.locale).toBeDefined()
    expect(clients.expiresAt).toBeDefined()
    expect('paymentMethod' in clients).toBe(false)
  })

  it('payments table exposes the gateway columns', () => {
    expect(payments.clientId).toBeDefined()
    expect(payments.provider).toBeDefined()
    expect(payments.mpPaymentId).toBeDefined()
    expect(payments.amount).toBeDefined()
    expect(payments.status).toBeDefined()
  })
})
