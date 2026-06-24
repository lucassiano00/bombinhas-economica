import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import crypto from 'crypto'
import { isValidMpSignature } from '@/lib/mp-webhook'

const SECRET = 'test-secret'

beforeAll(() => {
  process.env.MP_WEBHOOK_SECRET = SECRET
})

afterAll(() => {
  delete process.env.MP_WEBHOOK_SECRET
})

describe('isValidMpSignature', () => {
  it('returns true for a valid signature', () => {
    const ts = '123'
    const requestId = 'req-1'
    const dataId = '999'
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
    const v1 = crypto.createHmac('sha256', SECRET).update(manifest).digest('hex')

    const req = new Request('https://x/api', {
      headers: {
        'x-signature': `ts=${ts},v1=${v1}`,
        'x-request-id': requestId,
      },
    })

    expect(isValidMpSignature(req, dataId)).toBe(true)
  })

  it('returns false (and does NOT throw) for a malformed short v1', () => {
    const req = new Request('https://x/api', {
      headers: {
        'x-signature': 'ts=123,v1=abc',
        'x-request-id': 'req-1',
      },
    })

    expect(() => isValidMpSignature(req, '999')).not.toThrow()
    expect(isValidMpSignature(req, '999')).toBe(false)
  })

  it('returns false when x-signature header is missing', () => {
    const req = new Request('https://x/api', {
      headers: {
        'x-request-id': 'req-1',
      },
    })

    expect(isValidMpSignature(req, '999')).toBe(false)
  })
})
