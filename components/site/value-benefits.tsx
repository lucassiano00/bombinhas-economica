import { Wallet, Tags, BarChart3, HeartPulse, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const BENEFITS: { icon: LucideIcon; pt: string; es: string }[] = [
  { icon: Tags,       pt: 'Descontos\no ano todo',      es: 'Descuentos\ntodo el año' },
  { icon: BarChart3,  pt: 'Economia\nde verdade',        es: 'Ahorro\nde verdad' },
  { icon: HeartPulse, pt: 'Mais qualidade\nde vida',     es: 'Más calidad\nde vida' },
  { icon: ShieldCheck,pt: 'Pagamento\nrápido e seguro',  es: 'Pago\nrápido y seguro' },
]

export function ValueBenefits({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-stretch gap-6 rounded-2xl bg-navy px-7 py-7 text-white lg:flex-row lg:items-center">
          {/* Price */}
          <div className="flex items-center gap-4 lg:w-1/4">
            <Wallet className="h-12 w-12 shrink-0 text-gold" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {es ? 'Valor de la tarjeta' : 'Valor do cartão'}
              </p>
              <p className="text-3xl font-black leading-none">
                <span className="text-gold">R$ 99,00</span>{' '}
                <span className="text-sm font-semibold text-white/80">
                  {es ? 'por año' : 'por ano'}
                </span>
              </p>
            </div>
          </div>

          <div className="hidden w-px self-stretch bg-white/15 lg:block" />

          {/* Benefits */}
          <div className="grid flex-1 grid-cols-2 gap-5 sm:grid-cols-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.pt} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-gold" />
                  </span>
                  {/* Increased to text-sm for legibility (was text-xs) */}
                  <span className="whitespace-pre-line text-sm font-semibold leading-snug text-white/90">
                    {es ? b.es : b.pt}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
