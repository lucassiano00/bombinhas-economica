import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'

export default async function SessionRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const session = await auth()

  if (!session) redirect(`/${locale}/auth/login`)

  switch (session.user.role) {
    case 'admin':
      redirect(`/${locale}/admin/dashboard`)
    case 'partner':
      redirect(`/${locale}/parceiro/historico`)
    case 'client':
    default:
      redirect(`/${locale}/cliente/cartao`)
  }
}
