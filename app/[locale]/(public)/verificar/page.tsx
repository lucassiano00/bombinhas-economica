import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { StatusCheckForm } from '@/components/forms/status-check-form'

export default async function VerificarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const es = locale === 'es'

  return (
    <>
      <SiteHeader locale={locale} />

      {/* Navy hero strip */}
      <div className="bg-navy px-4 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {es ? 'Verificar tarjeta' : 'Verificar cartão'}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {es
            ? 'Ingresa tu DNI o CPF para consultar el estado de tu tarjeta.'
            : 'Digite seu CPF ou DNI para consultar o status do seu cartão.'}
        </p>
      </div>

      <main className="min-h-[calc(100vh-280px)] bg-section py-12 px-4">
        <div className="mx-auto max-w-md">
          <StatusCheckForm locale={locale} />
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
