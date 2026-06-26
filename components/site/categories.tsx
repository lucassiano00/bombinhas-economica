import {
  ShoppingCart,
  Plus,
  Utensils,
  Fuel,
  IceCreamCone,
  Coffee,
  Croissant,
  Umbrella,
  TreePalm,
  Scissors,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

type Cat = {
  icon: LucideIcon
  bg: string
  /** icon color — white for dark bgs, navy for light/mid bgs */
  fg: string
  pt: string
  es: string
}

// Dark backgrounds → white icon (contrast ≥ 3:1 on non-text per WCAG 1.4.11)
// Teal (#14b8b8, L~0.70) → navy icon for better contrast on this mid-tone
const CATS: Cat[] = [
  { icon: ShoppingCart, bg: '#14b8b8', fg: '#0c2350', pt: 'Mercado',           es: 'Mercado' },
  { icon: Plus,         bg: '#157a3a', fg: '#ffffff', pt: 'Farmácia',           es: 'Farmacia' },
  { icon: Utensils,     bg: '#0c2350', fg: '#ffffff', pt: 'Restaurante',        es: 'Restaurante' },
  { icon: Fuel,         bg: '#1e40af', fg: '#ffffff', pt: 'Combustível',        es: 'Combustible' },
  { icon: IceCreamCone, bg: '#102a5c', fg: '#ffffff', pt: 'Sorveteria',         es: 'Heladería' },
  { icon: Coffee,       bg: '#0c2350', fg: '#ffffff', pt: 'Cafeteria',          es: 'Cafetería' },
  { icon: Croissant,    bg: '#157a3a', fg: '#ffffff', pt: 'Padaria',            es: 'Panadería' },
  { icon: Umbrella,     bg: '#14b8b8', fg: '#0c2350', pt: 'Lazer',             es: 'Ocio' },
  { icon: TreePalm,     bg: '#1e40af', fg: '#ffffff', pt: 'Artigos de praia',   es: 'Artículos de playa' },
  { icon: Scissors,     bg: '#102a5c', fg: '#ffffff', pt: 'Beleza',             es: 'Belleza' },
]

export function Categories({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface py-14">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section heading — no uppercase eyebrow */}
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-black text-navy sm:text-3xl">
            {es ? 'Descuentos en toda la ciudad' : 'Descontos em toda a cidade'}
          </h3>
          <p className="mt-2 text-sm text-muted">
            {es
              ? 'Dondequiera que vayas en Bombinhas, tu tarjeta ahorra.'
              : 'Onde quer que você vá em Bombinhas, seu cartão economiza.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-5 lg:grid-cols-10">
          {CATS.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.pt} className="flex flex-col items-center gap-2.5 text-center">
                {/* Solid filled icon tile — visually bold, brand palette */}
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl shadow-sm"
                  style={{ backgroundColor: cat.bg, color: cat.fg }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="text-xs font-bold leading-tight text-ink">
                  {es ? cat.es : cat.pt}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
