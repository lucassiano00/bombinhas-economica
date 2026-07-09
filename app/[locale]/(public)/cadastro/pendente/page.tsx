import Link from 'next/link'
import { Clock } from 'lucide-react'
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
            {/* Icon — amber pending */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-12 w-12 text-warning-deep" strokeWidth={1.5} />
            </div>

            {/* Status Badge — locale-aware label */}
            <div className="mb-5 flex justify-center">
              <Badge status="pending" label={es ? 'PENDIENTE' : 'PENDENTE'} />
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {es ? 'Pago en proceso' : 'Pagamento em processamento'}
            </h1>

            {/* Body */}
            <p className="mt-4 leading-relaxed text-ink">
              {/* hotfix: sem menção ao gateway */}
              {es
                ? 'Tu pago está siendo procesado. Te avisaremos por email cuando se apruebe y tu tarjeta se active automáticamente.'
                : 'Seu pagamento está sendo processado. Avisaremos por email quando for aprovado e o cartão ativar automaticamente.'}
            </p>

            {/* What to expect — light section tint */}
            <div className="mt-6 rounded-lg bg-section px-5 py-4 text-left">
              <p className="mb-3 text-sm font-semibold text-navy">
                {es ? 'Próximos pasos' : 'Próximos passos'}
              </p>
              <ol className="space-y-2 text-sm text-ink">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-warning-deep">1.</span>
                  <span>
                    {es
                      ? 'El pago se confirma (puede tardar hasta 2 días hábiles).'
                      : 'O pagamento é confirmado (pode levar até 2 dias úteis).'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-warning-deep">2.</span>
                  <span>
                    {es
                      ? 'Recibes un email con acceso a tu área de miembro.'
                      : 'Você recebe um email com acesso à área do cliente.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-warning-deep">3.</span>
                  <span>
                    {es
                      ? 'Tu tarjeta está lista para usar en todos los comercios asociados.'
                      : 'Seu cartão está pronto para usar em todos os estabelecimentos parceiros.'}
                  </span>
                </li>
              </ol>
            </div>

            {/* Verify link */}
            <div className="mt-6">
              <Link
                href={`/${locale}/verificar`}
                className="text-sm font-semibold text-navy underline underline-offset-2 transition-colors hover:text-navy-800"
              >
                {es ? 'Verificar estado de mi tarjeta →' : 'Verificar status do meu cartão →'}
              </Link>
            </div>

            {/* Home link */}
            <div className="mt-3">
              <Link
                href={`/${locale}`}
                className="text-sm text-muted transition-colors hover:text-navy"
              >
                {es ? 'Volver al inicio' : 'Voltar ao início'}
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
