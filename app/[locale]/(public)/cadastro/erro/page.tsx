import Link from 'next/link'
import { XCircle } from 'lucide-react'
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
            {/* Icon — red error */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-danger/10">
              <XCircle className="h-12 w-12 text-danger" strokeWidth={1.5} />
            </div>

            {/* Status Badge — locale-aware label */}
            <div className="mb-5 flex justify-center">
              <Badge status="error" label={es ? 'ERROR' : 'ERRO'} />
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {es ? 'Pago no completado' : 'Pagamento não concluído'}
            </h1>

            {/* Body */}
            <p className="mt-4 leading-relaxed text-ink">
              {es
                ? 'No pudimos procesar tu pago. Puedes intentarlo de nuevo — el proceso toma solo unos minutos.'
                : 'Não conseguimos processar seu pagamento. Você pode tentar novamente — o processo leva apenas alguns minutos.'}
            </p>

            {/* Possible reasons */}
            <div className="mt-6 rounded-lg bg-section px-5 py-4 text-left">
              <p className="mb-3 text-sm font-semibold text-navy">
                {es ? 'Posibles razones' : 'Possíveis motivos'}
              </p>
              <ul className="space-y-1.5 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <span className="text-danger" aria-hidden>·</span>
                  <span>{es ? 'Fondos insuficientes en la tarjeta.' : 'Saldo insuficiente no cartão.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger" aria-hidden>·</span>
                  <span>{es ? 'El banco rechazó la transacción.' : 'O banco recusou a transação.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger" aria-hidden>·</span>
                  <span>{es ? 'Datos de pago incorrectos.' : 'Dados de pagamento incorretos.'}</span>
                </li>
              </ul>
            </div>

            {/* Primary CTA — gold action to retry */}
            <Link
              href={`/${locale}/cadastro`}
              className="mt-8 block w-full rounded-full bg-gold px-8 py-3.5 text-center text-sm font-extrabold tracking-wide text-navy transition-colors hover:bg-gold-deep"
            >
              {es ? 'INTENTAR DE NUEVO →' : 'TENTAR NOVAMENTE →'}
            </Link>

            {/* Home link */}
            <div className="mt-4">
              <Link
                href={`/${locale}`}
                className="text-sm text-muted transition-colors hover:text-navy"
              >
                {es ? 'Volver al inicio' : 'Voltar ao início'}
              </Link>
            </div>
          </Card>

          {/* Support note */}
          <p className="mt-6 text-center text-xs text-muted">
            {es
              ? '¿Necesitas ayuda? contato@bombinhaseconomica.com.br'
              : 'Precisa de ajuda? contato@bombinhaseconomica.com.br'}
          </p>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
