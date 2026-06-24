import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? 'Tu pago está en proceso. Te avisaremos por email cuando se apruebe y tu tarjeta se active.'
      : 'Seu pagamento está em processamento. Avisaremos por email quando for aprovado e o cartão ativar.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? 'Pago pendiente' : 'Pagamento pendente'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
