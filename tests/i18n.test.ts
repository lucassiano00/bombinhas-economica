// tests/i18n.test.ts
import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, isLocale, resolveLocale } from '@/lib/i18n'
import pt from '@/app/[locale]/dictionaries/pt.json'
import es from '@/app/[locale]/dictionaries/es.json'

describe('i18n helpers', () => {
  it('exposes pt and es with pt as default', () => {
    expect(locales).toEqual(['pt', 'es'])
    expect(defaultLocale).toBe('pt')
  })

  it('isLocale narrows valid locales only', () => {
    expect(isLocale('pt')).toBe(true)
    expect(isLocale('es')).toBe(true)
    expect(isLocale('en')).toBe(false)
    expect(isLocale('')).toBe(false)
  })

  it('resolveLocale picks es for spanish accept-language, pt otherwise', () => {
    expect(resolveLocale('es-AR,es;q=0.9')).toBe('es')
    expect(resolveLocale('es')).toBe('es')
    expect(resolveLocale('pt-BR,pt;q=0.9')).toBe('pt')
    expect(resolveLocale('en-US,en;q=0.9')).toBe('pt')
    expect(resolveLocale(null)).toBe('pt')
  })
})

describe('dictionary parity', () => {
  it('pt and es share the exact same key paths', () => {
    const paths = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object'
          ? paths(v as Record<string, unknown>, `${prefix}${k}.`)
          : [`${prefix}${k}`]
      )
    expect(paths(pt).sort()).toEqual(paths(es).sort())
  })
})
