import { Truck, Scale, KeyRound, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

// hotfix: fluxo nativo ainda não existe — todos os botões abrem o WhatsApp.
// ponytail: número via env, trocar quando o fluxo nativo for construído.
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5547900000000'

const ITEMS: { icon: LucideIcon; pt: string; es: string }[] = [
  { icon: Truck,    pt: 'Reboque',            es: 'Grúa' },
  { icon: Scale,    pt: 'Assessoria Jurídica', es: 'Asesoría Jurídica' },
  { icon: KeyRound, pt: 'Chaveiro',            es: 'Cerrajero' },
  { icon: Wrench,   pt: 'Oficina mecânica',    es: 'Taller mecánico' },
]

export function Emergency({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface pb-14 pt-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-section px-6 py-8 ring-1 ring-border">
          {/* Reassurance, not alarm — red is one decisive accent (the 24h pill), not the whole frame. */}
          <div className="mb-7 flex flex-col items-center gap-2.5 text-center sm:flex-row sm:justify-center sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-1 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              24h
            </span>
            <h3 className="text-xl font-extrabold text-navy">
              {es ? 'Servicios de emergencia' : 'Serviços de emergência'}
            </h3>
          </div>

          <Reveal group className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {ITEMS.map((item) => {
              const Icon = item.icon
              const label = es ? item.es : item.pt
              return (
                <a
                  key={item.pt}
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(label)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lift flex items-center justify-center gap-3 rounded-xl bg-surface px-4 py-3.5 ring-1 ring-border"
                >
                  <Icon className="h-6 w-6 shrink-0 text-navy" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </a>
              )
            })}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
