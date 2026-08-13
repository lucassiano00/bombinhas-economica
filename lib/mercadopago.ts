// lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { planFor, type PlanId } from '@/lib/plans'

function client() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, '')
}

export type CreatePreferenceArgs = {
  externalReference: string
  payerEmail: string
  payerName: string
  locale: 'pt' | 'es'
  plan: PlanId
}

export async function createCheckoutPreference(
  args: CreatePreferenceArgs
): Promise<{ preferenceId: string; initPoint: string }> {
  const preference = new Preference(client())
  const base = appUrl()
  const plan = planFor(args.plan)
  const result = await preference.create({
    body: {
      items: [
        {
          id: `cartao-anual-${args.plan}`,
          title: `Cartão Bombinhas+ Econômica — plano ${plan.pt} (1 ano)`,
          quantity: 1,
          unit_price: plan.priceBrl,
          currency_id: 'BRL',
        },
      ],
      payer: { name: args.payerName, email: args.payerEmail },
      external_reference: args.externalReference,
      back_urls: {
        success: `${base}/${args.locale}/cadastro/sucesso`,
        pending: `${base}/${args.locale}/cadastro/pendente`,
        failure: `${base}/${args.locale}/cadastro/erro`,
      },
      auto_return: 'approved',
      notification_url: `${base}/api/webhooks/mercadopago`,
    },
  })
  // Sem init_point não há checkout — e String(undefined) === 'undefined' passaria
  // como link válido, deixando o cadastro "concluir" sem pagamento.
  if (!result.init_point) {
    throw new Error('Mercado Pago did not return an init_point for this preference')
  }
  return { preferenceId: String(result.id), initPoint: result.init_point }
}

export async function getMercadoPagoPayment(
  paymentId: string
): Promise<{ id: string; status: string; externalReference: string | null }> {
  const payment = new Payment(client())
  const p = await payment.get({ id: paymentId })
  return {
    id: String(p.id),
    status: String(p.status),
    externalReference: p.external_reference ?? null,
  }
}
