// lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export const CARD_PRICE_BRL = 99.0
export const CARD_PRICE_CENTS = 9900

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
}

export async function createCheckoutPreference(
  args: CreatePreferenceArgs
): Promise<{ preferenceId: string; initPoint: string }> {
  const preference = new Preference(client())
  const base = appUrl()
  const result = await preference.create({
    body: {
      items: [
        {
          id: 'cartao-anual',
          title: 'Cartão Bombinhas+ Econômica (1 ano)',
          quantity: 1,
          unit_price: CARD_PRICE_BRL,
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
  return { preferenceId: String(result.id), initPoint: String(result.init_point) }
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
