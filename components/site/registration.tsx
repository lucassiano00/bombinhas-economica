import Link from 'next/link'
import { User, Phone, FileText, Mail, CreditCard, IdCard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

function Field({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-field px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span className="text-sm text-muted">{label}</span>
    </div>
  )
}

function PayBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`grid h-7 min-w-[2.75rem] place-items-center rounded border border-border bg-surface px-1.5 text-[0.7rem] font-black ${className}`}
    >
      {label}
    </span>
  )
}

export function Registration({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="turistas" className="bg-section py-12">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
        {/* Brazilians */}
        <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
          <div className="flex items-center gap-2 bg-green px-5 py-3 text-white">
            <span aria-hidden>🇧🇷</span>
            <h3 className="text-sm font-extrabold tracking-wide">
              {es ? 'REGISTRO BRASILEÑOS' : 'CADASTRO BRASILEIROS'}
            </h3>
          </div>
          <div className="space-y-3 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={User} label={es ? 'Nombre completo' : 'Nome completo'} />
              <Field icon={Phone} label={es ? 'Teléfono (WhatsApp)' : 'Telefone (WhatsApp)'} />
              <Field icon={FileText} label="CPF" />
              <Field
                icon={CreditCard}
                label={es ? 'Tarjeta de crédito/débito' : 'Cartão de crédito/débito'}
              />
            </div>
            <Field icon={Mail} label="E-mail" />

            <div className="flex items-center gap-2 pt-1">
              <PayBadge label="VISA" className="italic text-blue" />
              <PayBadge label="MC" className="text-red" />
              <PayBadge label="elo" className="text-ink" />
              <PayBadge label="AMEX" className="text-blue" />
            </div>

            <Link
              href={`/${locale}/cadastro`}
              className="mt-2 block rounded-lg bg-green py-3 text-center text-sm font-extrabold tracking-wide text-white transition-colors hover:bg-green-deep"
            >
              {es ? 'QUIERO PARTICIPAR' : 'QUERO FAZER PARTE'}
            </Link>
          </div>
        </div>

        {/* Foreigners */}
        <div className="overflow-hidden rounded-2xl bg-surface shadow-lg">
          <div className="flex items-center gap-2 bg-blue px-5 py-3 text-white">
            <span aria-hidden>🌎</span>
            <h3 className="text-sm font-extrabold tracking-wide">
              {es ? 'REGISTRO EXTRANJEROS' : 'CADASTRO ESTRANGEIROS'}
            </h3>
          </div>
          <div className="space-y-3 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={User} label={es ? 'Nombre completo' : 'Nome completo'} />
              <Field icon={Mail} label="E-mail" />
              <Field icon={IdCard} label={es ? 'DNI / Pasaporte' : 'DNI / Passaporte'} />
              <Field icon={Phone} label={es ? 'Teléfono (WhatsApp)' : 'Telefone (WhatsApp)'} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 text-sm text-muted">
              <span>{es ? 'Forma de pago:' : 'Forma de pagamento:'}</span>
              <span className="grid h-7 place-items-center rounded bg-[#32bcad] px-3 text-xs font-black text-white">
                pix
              </span>
            </div>

            <Link
              href={`/${locale}/cadastro`}
              className="mt-2 block rounded-lg bg-blue py-3 text-center text-sm font-extrabold tracking-wide text-white transition-colors hover:bg-blue-deep"
            >
              {es ? 'QUIERO PARTICIPAR' : 'QUERO FAZER PARTE'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
