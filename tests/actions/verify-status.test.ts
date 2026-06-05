import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

import { resolveStatus } from '@/lib/actions/verify-status'

describe('resolveStatus', () => {
  it('returns active when client status is active', () => {
    expect(resolveStatus({ status: 'active' }, null)).toBe('active')
  })

  it('returns inactive when client status is inactive', () => {
    expect(resolveStatus({ status: 'inactive' }, null)).toBe('inactive')
  })

  it('returns inactive when client status is pending', () => {
    expect(resolveStatus({ status: 'pending' }, null)).toBe('inactive')
  })

  it('returns not_found when no client and no dependent', () => {
    expect(resolveStatus(null, null)).toBe('not_found')
  })

  it('uses dependent parent status when client is null', () => {
    expect(resolveStatus(null, { status: 'active' })).toBe('active')
  })

  it('returns inactive for pending parent client', () => {
    expect(resolveStatus(null, { status: 'pending' })).toBe('inactive')
  })
})
