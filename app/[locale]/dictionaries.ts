import 'server-only'
import type { Locale } from '@/lib/i18n'

const dictionaries = {
  pt: () => import('./dictionaries/pt.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['pt']>>

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
