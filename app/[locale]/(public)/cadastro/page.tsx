import { isLocale, type Locale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { RegisterForm } from '@/components/forms/register-form'

const PAGE_STRINGS: Record<Locale, { heading: string; subtitle: string }> = {
  pt: {
    heading: 'Criar meu cartão',
    subtitle: 'Preencha o formulário para obter seu cartão Bombinhas+ Econômica.',
  },
  es: {
    heading: 'Crear mi tarjeta',
    subtitle: 'Completa el formulario para obtener tu tarjeta Bombinhas+ Econômica.',
  },
}

export default async function CadastroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <>
      <SiteHeader locale={locale} />

      {/* Navy hero strip — matches verificar/page.tsx pattern */}
      <div className="bg-navy px-4 py-12 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {PAGE_STRINGS[locale].heading}
        </h1>
        <p className="mt-2 text-sm text-white/75">
          {PAGE_STRINGS[locale].subtitle}
        </p>
      </div>

      <main className="min-h-[calc(100vh-280px)] bg-section py-12 px-4">
        <div className="mx-auto max-w-md">
          <RegisterForm locale={locale} />
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
