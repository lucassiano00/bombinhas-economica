'use server'

import { db } from '@/lib/db'
import { clients, dependents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { resolveStatus } from '@/lib/utils/resolve-status'

export async function verifyStatus(documentNumber: string): Promise<'active' | 'inactive' | 'not_found'> {
  const [client] = await db
    .select({ status: clients.status })
    .from(clients)
    .where(eq(clients.documentNumber, documentNumber))
    .limit(1)

  if (client) return resolveStatus(client, null)

  const [dependent] = await db
    .select({ clientId: dependents.clientId })
    .from(dependents)
    .where(eq(dependents.documentNumber, documentNumber))
    .limit(1)

  if (!dependent) return 'not_found'

  const [parentClient] = await db
    .select({ status: clients.status })
    .from(clients)
    .where(eq(clients.id, dependent.clientId))
    .limit(1)

  return resolveStatus(null, parentClient ?? null)
}
