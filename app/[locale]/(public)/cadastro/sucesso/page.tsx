import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const es = locale === 'es'

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="min-h-[calc(100vh-140px)] bg-section py-16 px-4">
        <div className="mx-auto max-w-lg">
          <Card className="py-10 px-8 text-center">
            {/* Icon — green success */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green/10">
              <CheckCircle2 className="h-12 w-12 text-green" strokeWidth={1.5} />
            </div>

            {/* Status Badge — locale-aware label */}
            <div className="mb-5 flex justify-center">
              <Badge status="active" label={es ? 'ACTIVO' : 'ATIVO'} />
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {es ? '¡Listo, estás adentro!' : 'Tudo certo, você é membro!'}
            </h1>

            {/* Body */}
            <p className="mt-4 leading-relaxed text-ink">
              {es
                ? 'Tu pago fue aprobado. Tu tarjeta Bombinhas+ Econômica ya está activa. Revisa tu email para acceder al área de miembro.'
                : 'Seu pagamento foi aprovado. Seu cartão Bombinhas+ Econômica está ativo. Veja seu email para acessar a área do cliente.'}
            </p>

            {/* Primary CTA — gold action */}
            <Link
              href={`/${locale}/auth/login`}
              className="mt-8 block w-full rounded-full bg-gold px-8 py-3.5 text-center text-sm font-extrabold tracking-wide text-navy transition-colors hover:bg-gold-deep"
            >
              {es ? 'ACCEDER AL ÁREA DE MIEMBRO →' : 'ACESSAR ÁREA DO CLIENTE →'}
            </Link>

            {/* Secondary link */}
            <div className="mt-4">
              <Link
                href={`/${locale}`}
                className="text-sm text-muted transition-colors hover:text-navy"
              >
                {es ? 'Volver al inicio' : 'Voltar ao início'}
              </Link>
            </div>
          </Card>

          {/* Trust note */}
          <p className="mt-6 text-center text-xs text-muted">
            {es
              ? '¿Dudas? Escríbenos a contato@bombinhaseconomica.com.br'
              : 'Dúvidas? Escreva para contato@bombinhaseconomica.com.br'}
          </p>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
