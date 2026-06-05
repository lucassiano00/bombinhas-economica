import { describe, it, expect, vi } from 'vitest'

function getRedirectPath(pathname: string, role: string | undefined): string | null {
  if (pathname.startsWith('/admin') && role !== 'admin') return '/auth/login'
  if (pathname.startsWith('/parceiro') && role !== 'partner') return '/auth/login'
  if (pathname.startsWith('/cliente') && role !== 'client') return '/auth/login'
  return null
}

describe('middleware redirect logic', () => {
  it('redirects non-admin from /admin', () => {
    expect(getRedirectPath('/admin/dashboard', 'client')).toBe('/auth/login')
    expect(getRedirectPath('/admin/dashboard', undefined)).toBe('/auth/login')
  })

  it('allows admin to /admin', () => {
    expect(getRedirectPath('/admin/dashboard', 'admin')).toBeNull()
  })

  it('redirects non-partner from /parceiro', () => {
    expect(getRedirectPath('/parceiro/historico', 'admin')).toBe('/auth/login')
  })

  it('allows partner to /parceiro', () => {
    expect(getRedirectPath('/parceiro/historico', 'partner')).toBeNull()
  })

  it('redirects non-client from /cliente', () => {
    expect(getRedirectPath('/cliente/cartao', 'admin')).toBe('/auth/login')
  })

  it('allows client to /cliente', () => {
    expect(getRedirectPath('/cliente/cartao', 'client')).toBeNull()
  })
})
