// tests/proxy-locale.test.ts
import { describe, it, expect } from 'vitest'
import { needsLocalePrefix } from '@/lib/i18n'

describe('needsLocalePrefix', () => {
  it('returns false for paths already prefixed with a locale', () => {
    expect(needsLocalePrefix('/pt')).toBe(false)
    expect(needsLocalePrefix('/es/cadastro')).toBe(false)
    expect(needsLocalePrefix('/pt/cliente/cartao')).toBe(false)
  })

  it('returns true for unprefixed paths', () => {
    expect(needsLocalePrefix('/')).toBe(true)
    expect(needsLocalePrefix('/cadastro')).toBe(true)
    expect(needsLocalePrefix('/auth/login')).toBe(true)
  })
})
