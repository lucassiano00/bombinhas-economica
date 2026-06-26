import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { SiteFooter } from '@/components/site/footer'
import { LoginForm } from '@/components/forms/login-form'

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <>
      <SiteHeader locale={locale} />

      <main className="min-h-[calc(100vh-140px)] bg-section flex items-center justify-center py-16 px-4">
        <LoginForm locale={locale} />
      </main>

      <SiteFooter locale={locale} />
    </>
  )
}
