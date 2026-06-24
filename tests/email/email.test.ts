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
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João' })
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend.mock.calls[0][0].to).toBe('user@test.com')
  })

  it('includes payment instructions in body', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João' })
    expect(mockSend.mock.calls[0][0].text).toContain('R$ 49,90')
  })

  it('includes the holder name in body', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'Maria' })
    expect(mockSend.mock.calls[0][0].text).toContain('Maria')
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
