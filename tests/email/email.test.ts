import { describe, it, expect, vi, beforeEach } from 'vitest'

const sendMock = vi.fn().mockResolvedValue({ id: 'email_1' })
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: sendMock } }
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_APP_URL = 'https://bombinhas.example'
})

describe('sendRegistrationConfirmed', () => {
  it('mentions Bombinhas+ Econômica and R$ 99,00, never the old price', async () => {
    const { sendRegistrationConfirmed } = await import('@/lib/email')
    await sendRegistrationConfirmed({ to: 'a@b.com', name: 'Ana', locale: 'pt' })
    const body = sendMock.mock.calls[0][0]
    expect(body.from).toContain('Bombinhas')
    expect(body.text).toContain('R$ 99,00')
    expect(body.text).not.toContain('49,90')
    expect(body.text).not.toMatch(/Western Union|PIX/i)
  })
})

describe('sendCardActivated', () => {
  it('links to the locale-aware card page', async () => {
    const { sendCardActivated } = await import('@/lib/email')
    await sendCardActivated({ to: 'a@b.com', name: 'Ana', locale: 'es' })
    const body = sendMock.mock.calls[0][0]
    expect(body.text).toContain('https://bombinhas.example/es/cliente/cartao')
    expect(body.subject.toLowerCase()).toContain('bombinhas')
  })
})
