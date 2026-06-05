import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SessionRedirectPage() {
  const session = await auth()

  if (!session) redirect('/auth/login')

  switch (session.user.role) {
    case 'admin':
      redirect('/admin/dashboard')
    case 'partner':
      redirect('/parceiro/historico')
    case 'client':
    default:
      redirect('/cliente/cartao')
  }
}
