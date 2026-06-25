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

type Cat = { icon: LucideIcon; color: string; pt: string; es: string }

const CATS: Cat[] = [
  { icon: ShoppingCart, color: '#14b8b8', pt: 'Mercado', es: 'Mercado' },
  { icon: Plus, color: '#157a3a', pt: 'Farmácia', es: 'Farmacia' },
  { icon: Utensils, color: '#d11f1f', pt: 'Restaurante', es: 'Restaurante' },
  { icon: Fuel, color: '#1e40af', pt: 'Combustível', es: 'Combustible' },
  { icon: IceCreamCone, color: '#ec4899', pt: 'Sorveteria', es: 'Heladería' },
  { icon: Coffee, color: '#92400e', pt: 'Cafeteria', es: 'Cafetería' },
  { icon: Croissant, color: '#eab308', pt: 'Padaria', es: 'Panadería' },
  { icon: Umbrella, color: '#7c3aed', pt: 'Lazer', es: 'Ocio' },
  { icon: TreePalm, color: '#0891b2', pt: 'Artigos de praia', es: 'Artículos de playa' },
  { icon: Scissors, color: '#db2777', pt: 'Beleza', es: 'Belleza' },
]

export function Categories({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="text-center text-lg font-extrabold tracking-wide text-navy">
          {es
            ? 'CATEGORÍAS DE DESCUENTOS POR UBICACIÓN'
            : 'CATEGORIAS DE DESCONTOS POR LOCALIZAÇÃO'}
        </h3>
        <div className="mt-8 grid grid-cols-3 gap-x-2 gap-y-7 sm:grid-cols-5 lg:grid-cols-10">
          {CATS.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.pt} className="flex flex-col items-center gap-2 text-center">
                <span
                  className="grid h-16 w-16 place-items-center rounded-full border-2 bg-surface"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  <Icon className="h-7 w-7" strokeWidth={2} />
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
