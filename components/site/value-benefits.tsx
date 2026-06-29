import { CheckCircle2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

// Concrete proofs — each is stated as fact elsewhere on the page, not vague filler.
const PROOFS: { pt: string; es: string }[] = [
  { pt: 'Ativação imediata — cartão na hora', es: 'Activación inmediata — tarjeta al instante' },
  { pt: 'Sem app: o parceiro verifica por CPF ou DNI', es: 'Sin app: el socio verifica por CPF o DNI' },
  { pt: 'Pagamento seguro via Mercado Pago (Pix ou cartão)', es: 'Pago seguro vía Mercado Pago (Pix o tarjeta)' },
  { pt: 'Cancele quando quiser, sem letra miúda', es: 'Cancela cuando quieras, sin letra chica' },
]

export function ValueBenefits({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
        <div>
          <h3 className="text-[1.85rem] font-extrabold leading-[1.1] text-navy sm:text-5xl">
            {es ? (
              <>
                Pagá <span className="text-gold-deep">R$ 99</span>.<br />
                Ahorrá <span className="text-gold-deep">+R$ 1.500</span>.
              </>
            ) : (
              <>
                Pague <span className="text-gold-deep">R$ 99</span>.<br />
                Economize <span className="text-gold-deep">+R$ 1.500</span>.
              </>
            )}
          </h3>

          {/* The math, made literal: pay this → get back that. Stacks on mobile. */}
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="rounded-2xl border border-border bg-surface px-6 py-4 text-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">
                {es ? 'Pagás' : 'Você paga'}
              </div>
              <div className="font-display text-3xl font-extrabold text-navy">
                R$ 99<span className="text-base font-semibold text-muted">/{es ? 'año' : 'ano'}</span>
              </div>
            </div>
            <span className="self-center rotate-90 text-2xl text-muted sm:rotate-0">→</span>
            <div className="rounded-2xl border border-border bg-surface px-6 py-4 text-center shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">
                {es ? 'Ahorrás' : 'Você economiza'}
              </div>
              <div className="font-display text-3xl font-extrabold text-green">+R$ 1.500</div>
            </div>
          </div>
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
