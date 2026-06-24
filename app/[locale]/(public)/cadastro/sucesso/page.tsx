import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? '¡Pago aprobado! Tu tarjeta Bombinhas+ Econômica está activa. Revisa tu email para acceder.'
      : 'Pagamento aprovado! Seu cartão Bombinhas+ Econômica está ativo. Veja seu email para acessar.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? '¡Listo!' : 'Tudo certo!'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
