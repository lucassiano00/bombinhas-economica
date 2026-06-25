import { Activity } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const DOCTOR_IMG =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'

export function Telemedicine({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-navy px-6 py-6 text-white sm:flex-row">
          <img
            src={DOCTOR_IMG}
            alt={es ? 'Médico de telemedicina' : 'Médico de telemedicina'}
            className="h-32 w-32 shrink-0 rounded-full object-cover object-top ring-4 ring-white/15 sm:h-36 sm:w-36"
          />
          <div className="flex-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 text-lg font-bold sm:justify-start">
              <Activity className="h-6 w-6 text-gold" />
              {es
                ? 'Telemedicina 24h - Atención médica en línea por solo'
                : 'Telemedicina 24h - Atendimento médico on-line por apenas'}
            </p>
            <p className="text-3xl font-black text-gold">R$ 99,90</p>
            <p className="text-sm text-white/75">
              {es
                ? 'Consultas 24 horas al día, donde estés.'
                : 'Consultas 24 horas por dia, onde você estiver.'}
            </p>
          </div>
          <a
            href="#contato"
            className="shrink-0 rounded-full bg-gold px-7 py-3 text-sm font-extrabold tracking-wide text-navy transition-colors hover:bg-gold-deep"
          >
            {es ? 'SABER MÁS' : 'SAIBA MAIS'}
          </a>
        </div>
      </div>
    </section>
  )
}
