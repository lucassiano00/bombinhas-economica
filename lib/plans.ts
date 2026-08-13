// Fonte única dos planos (cliente definiu em 12/08/2026).
// Sem import do SDK do Mercado Pago de propósito: este módulo é usado também
// pelo formulário no cliente, e o SDK não pode ir pro bundle do navegador.

export type PlanId = 'individual' | 'casal' | 'familia'

type Plan = {
  priceBrl: number
  priceCents: number
  maxDependents: number
  pt: string
  es: string
}

export const PLANS: Record<PlanId, Plan> = {
  individual: { priceBrl: 49.9, priceCents: 4990, maxDependents: 0, pt: 'Individual', es: 'Individual' },
  casal: { priceBrl: 79.9, priceCents: 7990, maxDependents: 1, pt: 'Casal', es: 'Pareja' },
  familia: { priceBrl: 99.9, priceCents: 9990, maxDependents: 4, pt: 'Família', es: 'Familia' },
}

export const PLAN_IDS = Object.keys(PLANS) as PlanId[]

export function isPlanId(value: string): value is PlanId {
  return Object.prototype.hasOwnProperty.call(PLANS, value)
}

/** Falha alto em plano desconhecido — um default silencioso aqui cobraria o valor errado. */
export function planFor(value: string): Plan {
  if (!isPlanId(value)) throw new Error(`Unknown plan: ${value}`)
  return PLANS[value]
}

/**
 * Fronteira de confiança: o navegador escolhe o plano E manda a lista de
 * dependentes, então nada impede alguém de pedir o plano individual (R$ 49,90)
 * com 4 dependentes. Esta checagem tem que rodar no servidor.
 */
export function assertPlanAllowsDependents(plan: string, count: number): void {
  const { maxDependents } = planFor(plan)
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(`Invalid dependent count: ${count}`)
  }
  if (count > maxDependents) {
    throw new Error(
      `Plan ${plan} allows ${maxDependents} dependent(s), got ${count}`
    )
  }
}

/**
 * Preço formatado pra UI. Sempre pt-BR: o valor é em real, independente do
 * idioma do leitor — `es-AR` renderizaria "BRL 49,90" em vez de "R$ 49,90".
 */
export function formatPrice(plan: PlanId): string {
  return PLANS[plan].priceBrl.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}
