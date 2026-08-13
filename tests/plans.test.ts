import { describe, it, expect } from 'vitest'
import { PLANS, isPlanId, planFor, assertPlanAllowsDependents } from '@/lib/plans'

describe('planos (cliente 12/08: individual / casal / família)', () => {
  it('cobra o preço combinado em cada plano', () => {
    expect(PLANS.individual.priceCents).toBe(4990)
    expect(PLANS.casal.priceCents).toBe(7990)
    expect(PLANS.familia.priceCents).toBe(9990)
  })

  it('mantém reais e centavos coerentes — divergência aqui cobra valor errado', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Math.round(plan.priceBrl * 100)).toBe(plan.priceCents)
    }
  })

  it('limita dependentes por plano', () => {
    expect(PLANS.individual.maxDependents).toBe(0)
    expect(PLANS.casal.maxDependents).toBe(1)
    expect(PLANS.familia.maxDependents).toBe(4)
  })

  it('reconhece apenas planos válidos', () => {
    expect(isPlanId('casal')).toBe(true)
    expect(isPlanId('premium')).toBe(false)
    expect(isPlanId('')).toBe(false)
  })

  it('planFor rejeita plano desconhecido em vez de cair num default silencioso', () => {
    expect(planFor('familia').priceCents).toBe(9990)
    expect(() => planFor('premium')).toThrow(/unknown plan/i)
  })

  describe('assertPlanAllowsDependents — trava de fronteira', () => {
    it('aceita a contagem exata do plano', () => {
      expect(() => assertPlanAllowsDependents('individual', 0)).not.toThrow()
      expect(() => assertPlanAllowsDependents('casal', 1)).not.toThrow()
      expect(() => assertPlanAllowsDependents('familia', 4)).not.toThrow()
    })

    it('recusa dependente além do limite — é a brecha de pagar barato e levar mais', () => {
      expect(() => assertPlanAllowsDependents('individual', 1)).toThrow(/dependent/i)
      expect(() => assertPlanAllowsDependents('casal', 2)).toThrow(/dependent/i)
      expect(() => assertPlanAllowsDependents('familia', 5)).toThrow(/dependent/i)
    })

    it('recusa contagem negativa', () => {
      expect(() => assertPlanAllowsDependents('familia', -1)).toThrow()
    })
  })
})
