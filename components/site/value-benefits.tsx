import { CheckCircle2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

// hotfix: feature list alinhada às regras novas — cartão 100% digital,
// +4 dependentes, PIX (sem Mercado Pago), crédito 12 meses (sem "cancele").
const PROOFS: { pt: string; es: string }[] = [
  { pt: 'Ativação imediata, cartão digital na hora.', es: 'Activación inmediata, tarjeta digital al instante.' },
  // Cliente (12/08) trocou "mais 4 dependentes" pelos três planos.
  {
    pt: 'Plano individual, casal e para sua família',
    es: 'Plan individual, pareja y para tu familia',
  },
  { pt: 'Sem app: o parceiro verifica por CPF ou DNI', es: 'Sin app: el socio verifica por CPF o DNI' },
  { pt: 'Pagamento seguro via PIX', es: 'Pago seguro vía PIX' },
  { pt: 'Crédito válido por 12 meses', es: 'Crédito válido por 12 meses' },
  // Cliente (05/08): incluir a telemedicina na lista.
  {
    pt: 'Se precisar, telemedicina 24 horas pelo celular',
    es: 'Si lo necesitás, telemedicina 24 horas por el celular',
  },
]

export function ValueBenefits({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          {/* hotfix: sem "Pague R$ 99" (precificação dinâmica) e sem sufixo temporal */}
          <h3 className="text-[1.85rem] font-extrabold leading-[1.1] text-navy sm:text-5xl">
            {es ? (
              <>
                Más de <span className="text-gold-deep">R$ 1.500</span>
                <br />
                en ahorro.
              </>
            ) : (
              <>
                Mais de <span className="text-gold-deep">R$ 1.500</span>
                <br />
                em economia.
              </>
            )}
          </h3>
          <p className="mt-4 max-w-sm text-muted">
            {es
              ? 'Descuentos reales en los socios de Bombinhas, con tu tarjeta digital.'
              : 'Descontos reais nos parceiros de Bombinhas, com seu cartão digital.'}
          </p>
        </div>

        <Reveal as="ul" group className="grid gap-3.5">
          {PROOFS.map((p) => (
            <li key={p.pt} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-check" />
              <span className="font-medium text-ink">{es ? p.es : p.pt}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
