// lib/i18n.ts
export const locales = ['pt', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

// Only the first Accept-Language tag is checked; quality values are ignored.
export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const primary = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? ''
  if (primary.startsWith('es')) return 'es'
  return defaultLocale
}
