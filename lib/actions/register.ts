'use server'

import { db } from '@/lib/db'
import { users, clients, dependents, payments } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { sendRegistrationConfirmed } from '@/lib/email'
import { createCheckoutPreference } from '@/lib/mercadopago'
import { assertPlanAllowsDependents, planFor, type PlanId } from '@/lib/plans'

type DependentInput = {
  fullName: string
  phone: string
  country: string
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
}

type RegisterInput = {
  email: string
  password: string
  fullName: string
  phone: string
  country: string
  clientType: 'brazilian' | 'foreigner'
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
  locale: 'pt' | 'es'
  plan: PlanId
  dependentsList: DependentInput[]
}

export async function registerClient(
  input: RegisterInput
): Promise<{ success: boolean; initPoint: string }> {
  // Antes de gravar qualquer coisa: o plano define o preço E o teto de
  // dependentes, e os dois vêm do navegador. Sem esta checagem dá pra pedir o
  // plano individual com 4 dependentes.
  assertPlanAllowsDependents(input.plan, input.dependentsList.length)

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
      phone: input.phone,
      country: input.country,
      plan: input.plan,
      clientType: input.clientType,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      locale: input.locale,
      status: 'pending',
    })
    .returning()

  if (input.dependentsList.length > 0) {
    await db.insert(dependents).values(
      input.dependentsList.map((d) => ({
        clientId: client.id,
        fullName: d.fullName,
        phone: d.phone,
        country: d.country,
        documentType: d.documentType,
        documentNumber: d.documentNumber,
      }))
    )
  }

  const [payment] = await db
    .insert(payments)
    .values({ clientId: client.id, amount: planFor(input.plan).priceCents, status: 'pending' })
    .returning()

  const { initPoint } = await createCheckoutPreference({
    externalReference: payment.id,
    payerEmail: input.email,
    payerName: input.fullName,
    locale: input.locale,
    plan: input.plan,
  })

  await sendRegistrationConfirmed({
    to: input.email,
    name: input.fullName,
    locale: input.locale,
    plan: input.plan,
  })

  return { success: true, initPoint }
}
