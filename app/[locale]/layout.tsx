import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import '../globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Bombinhas+ Econômica — Cartão de Descontos',
  description: 'Economize de verdade em Bombinhas/SC com o cartão de descontos digital.',
}

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'es' }]
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale === 'pt' ? 'pt-BR' : 'es'} className={jakarta.variable}>
      <body>{children}</body>
    </html>
  )
}
