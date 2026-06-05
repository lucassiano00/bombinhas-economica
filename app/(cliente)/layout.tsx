import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'client') redirect('/auth/login')
  return <>{children}</>
}
