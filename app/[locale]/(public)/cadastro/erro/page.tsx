import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? 'No pudimos procesar tu pago. Puedes intentarlo de nuevo desde la página de registro.'
      : 'Não conseguimos processar seu pagamento. Você pode tentar novamente na página de cadastro.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? 'Pago no completado' : 'Pagamento não concluído'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
