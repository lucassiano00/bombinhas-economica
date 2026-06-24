import { db } from '@/lib/db'
import { payments, clients, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { sendCardActivated } from '@/lib/email'

function oneYearFromNow(): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}

export async function applyPaymentNotification(
  mpPaymentId: string
): Promise<'activated' | 'ignored' | 'not_found'> {
  const mp = await getMercadoPagoPayment(mpPaymentId)
  if (!mp.externalReference) return 'not_found'

  const [payment] = await db
    .select({ id: payments.id, clientId: payments.clientId, status: payments.status })
    .from(payments)
    .where(eq(payments.id, mp.externalReference))
    .limit(1)

  if (!payment) return 'not_found'
  if (payment.status === 'approved') return 'ignored' // idempotent

  if (mp.status !== 'approved') {
    await db
      .update(payments)
      .set({ status: mp.status === 'rejected' ? 'rejected' : 'pending', mpPaymentId })
      .where(eq(payments.id, payment.id))
    return 'ignored'
  }

  // Approved: mark payment, activate client, email.
  await db
    .update(payments)
    .set({ status: 'approved', mpPaymentId, paidAt: new Date() })
    .where(eq(payments.id, payment.id))

  await db
    .update(clients)
    .set({ status: 'active', expiresAt: oneYearFromNow() })
    .where(eq(clients.id, payment.clientId))

  const [holder] = await db
    .select({ fullName: clients.fullName, locale: clients.locale, email: users.email })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.id, payment.clientId))
    .limit(1)

  if (holder) {
    await sendCardActivated({
      to: holder.email,
      name: holder.fullName,
      locale: holder.locale === 'es' ? 'es' : 'pt',
    })
  }

  return 'activated'
}
