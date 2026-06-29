import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

function NeedItem({ text, hint }: { text: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-check" />
      <span className="text-sm leading-snug text-ink">
        {text}
        {hint ? <span className="text-muted"> · {hint}</span> : null}
      </span>
    </li>
  )
}

export function Registration({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="turistas" className="bg-section py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
            {es ? 'Únete en minutos' : 'Faça parte em minutos'}
          </h3>
          <p className="mt-2 text-base text-muted">
            {es
              ? 'Registro simple — tarjeta activa al instante.'
              : 'Cadastro simples — cartão ativo na hora.'}
          </p>
        </div>

        {/* One card — the flow is identical for everyone; the only fork is the document. */}
        <div className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-surface shadow-md">
          <div className="flex items-center gap-2.5 bg-navy px-6 py-4 text-white">
            <span aria-hidden className="text-base">🇧🇷 🌎</span>
            <h4 className="font-extrabold tracking-wide">
              {es ? 'Brasileños y extranjeros' : 'Brasileiros e estrangeiros'}
            </h4>
          </div>
          <div className="px-7 py-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
              {es ? 'Lo que vas a necesitar:' : 'O que você vai precisar:'}
            </p>
            <ul className="space-y-3.5">
              <NeedItem text={es ? 'Nombre completo' : 'Nome completo'} />
              <NeedItem
                text={es ? 'CPF o DNI / Pasaporte' : 'CPF ou DNI / Passaporte'}
                hint={es ? 'según tu país' : 'conforme seu país'}
              />
              <NeedItem text={es ? 'Teléfono (WhatsApp)' : 'Telefone (WhatsApp)'} />
              <NeedItem text="E-mail" />
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-xs text-muted">{es ? 'Pago via' : 'Pagamento via'}</span>
              <span className="rounded border border-[#009ee3] px-2 py-0.5 text-[0.65rem] font-black text-[#009ee3]">
                Mercado Pago
              </span>
              <span className="text-xs text-muted">{es ? '(tarjeta o Pix)' : '(cartão ou Pix)'}</span>
            </div>

            <Link
              href={`/${locale}/cadastro`}
              className="press mt-6 block rounded-full bg-gold py-3.5 text-center text-sm font-extrabold tracking-wide text-navy hover:bg-gold-deep"
            >
              {es ? 'QUIERO PARTICIPAR →' : 'QUERO FAZER PARTE →'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
