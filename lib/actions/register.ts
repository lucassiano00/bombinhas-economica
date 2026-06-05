'use server'

import { db } from '@/lib/db'
import { users, clients, dependents } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { sendRegistrationConfirmed } from '@/lib/email'

type DependentInput = {
  fullName: string
  documentType: 'rg' | 'dni'
  documentNumber: string
}

type RegisterInput = {
  email: string
  password: string
  fullName: string
  documentType: 'rg' | 'dni'
  documentNumber: string
  paymentMethod: 'pix' | 'western_union'
  dependentsList: DependentInput[]
}

export async function registerClient(input: RegisterInput): Promise<{ success: boolean }> {
  const passwordHash = await bcrypt.hash(input.password, 12)

  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash, role: 'client' })
    .returning()

  const [client] = await db
    .insert(clients)
    .values({
      userId: user.id,
      fullName: input.fullName,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      paymentMethod: input.paymentMethod,
      status: 'pending',
    })
    .returning()

  if (input.dependentsList.length > 0) {
    await db.insert(dependents).values(
      input.dependentsList.map((d) => ({
        clientId: client.id,
        fullName: d.fullName,
        documentType: d.documentType,
        documentNumber: d.documentNumber,
      }))
    )
  }

  await sendRegistrationConfirmed({
    to: input.email,
    name: input.fullName,
    paymentMethod: input.paymentMethod,
  })

  return { success: true }
}
