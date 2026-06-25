import { Truck, Scale, KeyRound, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const ITEMS: { icon: LucideIcon; pt: string; es: string }[] = [
  { icon: Truck, pt: 'Reboque', es: 'Grúa' },
  { icon: Scale, pt: 'Assessoria Jurídica', es: 'Asesoría Jurídica' },
  { icon: KeyRound, pt: 'Chaveiro', es: 'Cerrajero' },
  { icon: Wrench, pt: 'Oficina mecânica', es: 'Taller mecánico' },
]

export function Emergency({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border-2 border-red/40 bg-surface px-6 py-7">
          <div className="flex items-center justify-center gap-4">
            <span className="hidden h-px flex-1 bg-red/30 sm:block" />
            <h3 className="text-center text-sm font-extrabold tracking-wide text-red sm:whitespace-nowrap sm:text-base">
              {es ? 'EMERGENCIA - SERVICIOS 24 HORAS' : 'EMERGÊNCIA - SERVIÇOS 24 HORAS'}
            </h3>
            <span className="hidden h-px flex-1 bg-red/30 sm:block" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.pt} className="flex items-center justify-center gap-3">
                  <Icon className="h-8 w-8 shrink-0 text-red" strokeWidth={2} />
                  <span className="text-sm font-bold text-ink">{es ? item.es : item.pt}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
