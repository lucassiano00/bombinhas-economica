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
    // hotfix: id de compra — alvo dos links Turistas/Moradores da navbar
    <section id="checkout" className="scroll-mt-4 bg-section py-16">
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
            {/* Cliente (05/08): telefone e país entram na lista, junto do form. */}
            <ul className="space-y-3.5">
              <NeedItem text={es ? 'Nombre completo' : 'Nome completo'} />
              <NeedItem
                text={es ? 'CPF o DNI' : 'CPF ou DNI'}
                hint={es ? 'según tu país' : 'conforme seu país'}
              />
              <NeedItem text="E-mail" />
              <NeedItem text={es ? 'Teléfono / WhatsApp' : 'Telefone / WhatsApp'} />
              <NeedItem text="País" />
            </ul>

            {/* hotfix: sem menção/logo Mercado Pago — copy estrita */}
            <div className="mt-5 border-t border-border pt-4">
              <span className="text-xs font-semibold text-muted">
                {es ? 'Pago seguro vía PIX' : 'Pagamento seguro via PIX'}
              </span>
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
