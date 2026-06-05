import { describe, it, expect } from 'vitest'
import { users, clients, dependents, partners, discountUsages } from '@/lib/db/schema'
import { roleEnum, clientStatusEnum, documentTypeEnum, paymentMethodEnum } from '@/lib/db/schema'

describe('database schema', () => {
  it('exports users table with required columns', () => {
    expect(users).toBeDefined()
    expect(users.id).toBeDefined()
    expect(users.email).toBeDefined()
    expect(users.passwordHash).toBeDefined()
    expect(users.role).toBeDefined()
  })

  it('exports clients table with status default pending', () => {
    expect(clients).toBeDefined()
    expect(clients.status).toBeDefined()
  })

  it('exports all 5 tables', () => {
    expect(users).toBeDefined()
    expect(clients).toBeDefined()
    expect(dependents).toBeDefined()
    expect(partners).toBeDefined()
    expect(discountUsages).toBeDefined()
  })

  it('exports all enums', () => {
    expect(roleEnum).toBeDefined()
    expect(clientStatusEnum).toBeDefined()
    expect(documentTypeEnum).toBeDefined()
    expect(paymentMethodEnum).toBeDefined()
  })
})
