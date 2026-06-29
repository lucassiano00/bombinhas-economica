import Link from 'next/link'
import { CalendarDays, Mail, Building2 } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

export function SiteFooter({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@bombinhaseconomica.com.br'
  const cnpj = process.env.NEXT_PUBLIC_CNPJ ?? '37.123.456/0001-89'
  return (
    <footer id="contato" className="bg-navy text-white">
      {/* Pre-footer CTA — last conversion opportunity before the user leaves */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h4 className="text-2xl font-black text-white sm:text-3xl">
            {es ? '¿Listo para ahorrar?' : 'Pronto para economizar?'}
          </h4>
          <p className="mt-2 text-sm text-white/70">
            {es
              ? 'R$ 99,00 por año · Activación inmediata · Cancela cuando quieras'
              : 'R$ 99,00 por ano · Ativação imediata · Cancele quando quiser'}
          </p>
          <Link
            href={`/${locale}/cadastro`}
            className="press mt-5 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-extrabold tracking-wide text-navy hover:bg-gold-deep"
          >
            {es ? 'QUIERO MI TARJETA' : 'QUERO MEU CARTÃO'}
          </Link>
        </div>
      </div>

      {/* Contact row */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 shrink-0 text-gold" strokeWidth={1.5} />
          <div className="text-sm">
            <p className="font-bold">{es ? 'De lunes a lunes' : 'Segunda a segunda'}</p>
            <p className="text-white/75">{es ? 'Atención 24 horas' : 'Atendimento 24 horas'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-7 w-7 shrink-0 text-gold" strokeWidth={1.5} />
          <div className="text-sm">
            <p className="font-bold">{es ? 'Horario de 9h a 17h' : 'Horário de 9h às 17h'}</p>
            <a href={`mailto:${email}`} className="text-white/75 hover:text-gold">
              {email}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 shrink-0 text-gold" strokeWidth={1.5} />
          <div className="text-sm">
            <p className="font-bold">CNPJ</p>
            <p className="text-white/75">{cnpj}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
