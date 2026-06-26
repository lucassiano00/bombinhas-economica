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
            <p className="mt-1 text-xs text-white/60">
              {es ? 'en descuentos durante el año' : 'em descontos ao longo do ano'}
            </p>
          </div>
        </div>

        {/* Status verification */}
        <div className="rounded-2xl border border-border bg-surface px-7 py-6 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-navy" />
            <h3 className="text-lg font-bold text-ink">
              {es ? 'Verificación de status' : 'Verificação de status'}
            </h3>
          </div>
          {/* Explain what this means — reduces confusion */}
          <p className="mt-2 text-sm text-muted">
            {es
              ? 'Cualquier socio verifica tu tarjeta por CPF o DNI — sin app, sin complicación.'
              : 'Qualquer parceiro verifica seu cartão por CPF ou DNI — sem app, sem complicação.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {statuses.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full bg-section px-3 py-1.5 text-xs font-semibold text-ink"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-check" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
