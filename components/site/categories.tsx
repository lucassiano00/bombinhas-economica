import {
  ShoppingCart,
  Plus,
  Utensils,
  Fuel,
  IceCreamCone,
  Coffee,
  Croissant,
  Smile,
  TreePalm,
  Scissors,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

type Cat = {
  icon: LucideIcon
  pt: string
  es: string
}

// One disciplined system — no per-category confetti colors. Structure is navy,
// icons are neutral (white); gold stays reserved for action (design.json rule).
const CATS: Cat[] = [
  { icon: ShoppingCart, pt: 'Mercado',          es: 'Mercado' },
  { icon: Plus,         pt: 'Farmácia',          es: 'Farmacia' },
  { icon: Utensils,     pt: 'Restaurante',       es: 'Restaurante' },
  { icon: Fuel,         pt: 'Combustível',       es: 'Combustible' },
  { icon: IceCreamCone, pt: 'Sorveteria',        es: 'Heladería' },
  { icon: Coffee,       pt: 'Cafeteria',         es: 'Cafetería' },
  { icon: Croissant,    pt: 'Padaria',           es: 'Panadería' },
  // hotfix: fallback sem logo = smiley (era guarda-chuva)
  { icon: Smile,        pt: 'Lazer',             es: 'Ocio' },
  { icon: TreePalm,     pt: 'Artigos de praia',  es: 'Artículos de playa' },
  { icon: Scissors,     pt: 'Beleza',            es: 'Belleza' },
]

export function Categories({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="moradores" className="scroll-mt-4 bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section heading — gold accent rule instead of an uppercase eyebrow */}
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-extrabold sm:text-4xl">
            {es ? 'Descuentos en toda la ciudad' : 'Descontos em toda a cidade'}
          </h3>
          <span className="mx-auto mt-4 block h-1 w-12 rounded-full bg-gold" />
          <p className="mt-4 text-base text-white/70">
            {es
              ? 'Dondequiera que vayas en Bombinhas, tu tarjeta ahorra.'
              : 'Onde quer que você vá em Bombinhas, seu cartão economiza.'}
          </p>
        </div>

        <Reveal as="ul" group className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-5 lg:grid-cols-10">
          {CATS.map((cat) => {
            const Icon = cat.icon
            return (
              <li key={cat.pt} className="flex flex-col items-center gap-3 text-center">
                {/* Uniform frosted tile — consistent, larger, generous tap target */}
                <span className="lift grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-semibold leading-tight text-white/90">
                  {es ? cat.es : cat.pt}
                </span>
              </li>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
