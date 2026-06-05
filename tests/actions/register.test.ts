import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockReturning, mockInsert, mockSendRegistrationConfirmed, mockHash } = vi.hoisted(() => ({
  mockReturning: vi.fn(),
  mockInsert: vi.fn(),
  mockSendRegistrationConfirmed: vi.fn().mockResolvedValue(undefined),
  mockHash: vi.fn().mockResolvedValue('hashed-password'),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: mockInsert,
  },
}))

vi.mock('@/lib/email', () => ({
  sendRegistrationConfirmed: mockSendRegistrationConfirmed,
}))

vi.mock('bcryptjs', () => ({
  default: { hash: mockHash },
}))

import { registerClient } from '@/lib/actions/register'
import { sendRegistrationConfirmed } from '@/lib/email'

const validInput = {
  email: 'test@test.com',
  password: 'password123',
  fullName: 'João Silva',
  documentType: 'rg' as const,
  documentNumber: '12345678',
  paymentMethod: 'pix' as const,
  dependentsList: [],
}

describe('registerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReturning
      .mockResolvedValueOnce([{ id: 'user-id', email: 'test@test.com', role: 'client' }])
      .mockResolvedValueOnce([{ id: 'client-id', userId: 'user-id' }])
    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: mockReturning,
      }),
    })
  })

  it('creates a user record', async () => {
    await registerClient(validInput)
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })

  it('sends confirmation email', async () => {
    await registerClient(validInput)
    expect(sendRegistrationConfirmed).toHaveBeenCalledWith({
      to: 'test@test.com',
      name: 'João Silva',
      paymentMethod: 'pix',
    })
  })

  it('returns success true', async () => {
    const result = await registerClient(validInput)
    expect(result.success).toBe(true)
  })

  it('inserts dependents when provided', async () => {
    mockReturning
      .mockResolvedValueOnce([{ id: 'user-id', email: 'test@test.com', role: 'client' }])
      .mockResolvedValueOnce([{ id: 'client-id', userId: 'user-id' }])

    const inputWithDependents = {
      ...validInput,
      dependentsList: [{ fullName: 'Maria', documentType: 'rg' as const, documentNumber: '99999' }],
    }
    await registerClient(inputWithDependents)
    expect(mockInsert).toHaveBeenCalledTimes(3)
  })
})
