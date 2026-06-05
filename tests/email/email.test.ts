import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: 'email-id' }),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } }
  }),
}))

import { sendRegistrationConfirmed, sendCardActivated } from '@/lib/email'

describe('sendRegistrationConfirmed', () => {
  beforeEach(() => mockSend.mockClear())

  it('sends email to correct recipient', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'pix' })
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend.mock.calls[0][0].to).toBe('user@test.com')
  })

  it('includes PIX instructions for pix payment', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'pix' })
    expect(mockSend.mock.calls[0][0].text).toContain('PIX')
  })

  it('includes Western Union instructions for western_union payment', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'western_union' })
    expect(mockSend.mock.calls[0][0].text).toContain('Western Union')
  })
})

describe('sendCardActivated', () => {
  beforeEach(() => mockSend.mockClear())

  it('sends activation email with app URL', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.economizesc.com.br'
    await sendCardActivated({ to: 'user@test.com', name: 'João' })
    expect(mockSend.mock.calls[0][0].text).toContain('/cliente/cartao')
  })
})
