import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { clients, dependents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DigitalCard } from '@/components/card/digital-card'

export default async function CartaoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, session.user.id))
    .limit(1)

  if (!client) redirect('/auth/login')

  const clientDependents = await db
    .select()
    .from(dependents)
    .where(eq(dependents.clientId, client.id))

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center py-12 px-4 gap-4">
      <DigitalCard
        holderName={client.fullName}
        status={client.status}
        dependents={clientDependents}
      />
      <form action={handleSignOut}>
        <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Sair
        </button>
      </form>
    </main>
  )
}
