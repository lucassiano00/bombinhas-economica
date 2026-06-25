import { Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

export function SavingsStatus({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  const statuses = es
    ? ['CPF', 'Extranjero', 'DNI activo']
    : ['CPF', 'Estrangeiro', 'DNI ativo']

  return (
    <section className="bg-section py-10">
      <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2">
        {/* Savings */}
        <div className="flex items-center gap-5 rounded-2xl bg-navy px-7 py-7 text-white shadow-md">
          <Wallet className="h-14 w-14 shrink-0 text-gold" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-white/80">
              {es ? 'Podrás ahorrar fácil + de' : 'Você poderá economizar fácil + de'}
            </p>
            <p className="text-4xl font-black text-gold">R$ 1.500,00</p>
          </div>
        </div>

        {/* Status verification */}
        <div className="rounded-2xl border border-border bg-surface px-7 py-6 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-navy" />
            <h3 className="text-lg font-bold text-ink">
              {es ? 'Verificación de estado' : 'Verificação de status'}
            </h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {statuses.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-field px-4 py-2 text-sm font-semibold text-ink"
              >
                {s}
                <CheckCircle2 className="h-5 w-5 text-check" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
