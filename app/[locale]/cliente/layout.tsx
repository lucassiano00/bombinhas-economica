import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ClienteLayout({ children, params }: LayoutProps<'/[locale]/cliente'>) {
  const { locale } = await params
  const session = await auth()
  if (session?.user?.role !== 'client') redirect(`/${locale}/auth/login`)
  return <>{children}</>
}
