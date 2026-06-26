import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

function NeedItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-check" />
      <span className="text-sm leading-snug text-ink">{text}</span>
    </li>
  )
}

export function Registration({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="turistas" className="bg-section py-14">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section heading */}
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-black text-navy sm:text-3xl">
            {es ? 'Únete en minutos' : 'Faça parte em minutos'}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {es
              ? 'Registro simple — tarjeta activa al instante.'
              : 'Cadastro simples — cartão ativo na hora.'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Brasileiros */}
          <div className="overflow-hidden rounded-2xl bg-surface shadow-md">
            <div className="flex items-center gap-2 bg-green px-5 py-3.5 text-white">
              <span aria-hidden>🇧🇷</span>
              <h4 className="font-extrabold tracking-wide">
                {es ? 'Brasileños' : 'Brasileiros'}
              </h4>
            </div>
            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {es ? 'Lo que vas a necesitar:' : 'O que você vai precisar:'}
              </p>
              <ul className="space-y-3">
                <NeedItem text={es ? 'Nombre completo' : 'Nome completo'} />
                <NeedItem text="CPF" />
                <NeedItem text={es ? 'Teléfono (WhatsApp)' : 'Telefone (WhatsApp)'} />
                <NeedItem text="E-mail" />
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="text-xs text-muted">
                  {es ? 'Pago via' : 'Pagamento via'}
                </span>
                <span className="rounded border border-[#009ee3] px-2 py-0.5 text-[0.65rem] font-black text-[#009ee3]">
                  Mercado Pago
                </span>
                <span className="text-xs text-muted">
                  {es ? '(tarjeta o Pix)' : '(cartão ou Pix)'}
                </span>
              </div>

              <Link
                href={`/${locale}/cadastro`}
                className="mt-5 block rounded-full bg-gold py-3.5 text-center text-sm font-extrabold tracking-wide text-navy transition-colors hover:bg-gold-deep"
              >
                {es ? 'QUIERO PARTICIPAR →' : 'QUERO FAZER PARTE →'}
              </Link>
            </div>
          </div>

          {/* Estrangeiros */}
          <div className="overflow-hidden rounded-2xl bg-surface shadow-md">
            <div className="flex items-center gap-2 bg-blue px-5 py-3.5 text-white">
              <span aria-hidden>🌎</span>
              <h4 className="font-extrabold tracking-wide">
                {es ? 'Extranjeros' : 'Estrangeiros'}
              </h4>
            </div>
            <div className="px-6 py-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
                {es ? 'Lo que vas a necesitar:' : 'O que você vai precisar:'}
              </p>
              <ul className="space-y-3">
                <NeedItem text={es ? 'Nombre completo' : 'Nome completo'} />
                <NeedItem text={es ? 'DNI / Pasaporte' : 'DNI / Passaporte'} />
                <NeedItem text={es ? 'Teléfono (WhatsApp)' : 'Telefone (WhatsApp)'} />
                <NeedItem text="E-mail" />
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="text-xs text-muted">
                  {es ? 'Pago via' : 'Pagamento via'}
                </span>
                <span className="rounded border border-[#009ee3] px-2 py-0.5 text-[0.65rem] font-black text-[#009ee3]">
                  Mercado Pago
                </span>
                <span className="text-xs text-muted">
                  {es ? '(tarjeta o Pix)' : '(cartão ou Pix)'}
                </span>
              </div>

              <Link
                href={`/${locale}/cadastro`}
                className="mt-5 block rounded-full bg-gold py-3.5 text-center text-sm font-extrabold tracking-wide text-navy transition-colors hover:bg-gold-deep"
              >
                {es ? 'QUIERO PARTICIPAR →' : 'QUERO FAZER PARTE →'}
              </Link>
            </div>
          </div>
        </div>

        {/* Price reassurance */}
        <p className="mt-6 text-center text-sm text-muted">
          {es
            ? 'R$ 99,00 por año · Activación inmediata · Cancela cuando quieras'
            : 'Apenas R$ 99,00 por ano · Ativação imediata · Cancele quando quiser'}
        </p>
      </div>
    </section>
  )
}
