import type { Metadata } from 'next'
import { Bricolage_Grotesque, Figtree } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import '../globals.css'

// Display: characterful contemporary grotesque — warm but confident, carries the headlines.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
})

// Body/UI: humanist sans — friendly, highly legible. Pairs with the display on a contrast axis.
const body = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Bombinhas+ Econômica — Cartão de Descontos',
  description: 'Economize de verdade em Bombinhas/SC com o cartão de descontos digital.',
  // PWA: experiência standalone no iOS (Android usa o manifest)
  appleWebApp: { capable: true, title: 'Bombinhas+', statusBarStyle: 'default' },
  icons: { apple: '/apple-touch-icon.png' },
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
    <html
      lang={locale === 'pt' ? 'pt-BR' : 'es'}
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca .js antes do paint: o motion só "esconde" conteúdo quando JS está ativo,
            então sem-JS / SSR / renderers headless nunca mostram a página em branco. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              // PWA: registra o service worker (habilita Add to Home Screen)
              "'serviceWorker' in navigator&&addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
