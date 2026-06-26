import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { clients, dependents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DigitalCard } from '@/components/card/digital-card'
import type { Locale } from '@/lib/i18n'

export default async function CartaoPage({ params }: PageProps<'/[locale]/cliente/cartao'>) {
  const { locale } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/${locale}/auth/login`)

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, session.user.id))
    .limit(1)

  if (!client) redirect(`/${locale}/auth/login`)

  const clientDependents = await db
    .select()
    .from(dependents)
    .where(eq(dependents.clientId, client.id))

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: `/${locale}` })
  }

  const signOutLabel = locale === 'es' ? 'Salir' : 'Sair'

  return (
    <main className="min-h-screen bg-section flex flex-col items-center justify-center py-12 px-4 gap-6">
      <DigitalCard
        holderName={client.fullName}
        status={client.status}
        dependents={clientDependents}
        locale={locale as Locale}
      />
      <form action={handleSignOut}>
        <button
          type="submit"
          className="text-sm text-muted hover:text-ink underline transition-colors"
        >
          {signOutLabel}
        </button>
      </form>
    </main>
  )
}
