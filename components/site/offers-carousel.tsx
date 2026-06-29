import type { Locale } from '@/lib/i18n'

// Verified coastal / partner stock (all resolve; swap for real partner photos when available).
const IMG = {
  beto: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&w=600&q=80',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
  koch: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  food: 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?auto=format&fit=crop&w=600&q=80',
  beach: 'https://images.unsplash.com/photo-1550031676-35e3bb00fefe?auto=format&fit=crop&w=600&q=80',
}

type Loc = { name: string; cat: string; tag: string }
type Offer = { img: string; pct: string; pt: Loc; es: Loc }

const OFFERS: Offer[] = [
  { img: IMG.beto, pct: '20%', pt: { name: 'Beto Carrero World', cat: 'Parque · Penha', tag: 'Ingressos' }, es: { name: 'Beto Carrero World', cat: 'Parque · Penha', tag: 'Entradas' } },
  { img: IMG.villa, pct: '5%', pt: { name: 'Imóvel de temporada', cat: 'Hospedagem · Bombinhas', tag: 'Aluguel' }, es: { name: 'Alquiler de temporada', cat: 'Hospedaje · Bombinhas', tag: 'Alquiler' } },
  { img: IMG.koch, pct: '15%', pt: { name: 'Kkoch Supermercados', cat: 'Mercado · Bombinhas', tag: 'Compras' }, es: { name: 'Kkoch Supermercados', cat: 'Mercado · Bombinhas', tag: 'Compras' } },
  { img: IMG.food, pct: '10%', pt: { name: 'Restaurante do Zé', cat: 'Gastronomia · Centro', tag: 'À la carte' }, es: { name: 'Restaurante do Zé', cat: 'Gastronomía · Centro', tag: 'À la carte' } },
  { img: IMG.beach, pct: '25%', pt: { name: 'Oceanic · Lazer', cat: 'Passeios · Praia', tag: 'Stand-up & tours' }, es: { name: 'Oceanic · Ocio', cat: 'Paseos · Playa', tag: 'Stand-up & tours' } },
]

export function OffersCarousel({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  const t = (o: Offer) => (es ? o.es : o.pt)
  // Duplicate the set so the marquee loops seamlessly; the copy is hidden from a11y.
  const loop = [...OFFERS, ...OFFERS]

  return (
    <section className="overflow-hidden bg-surface py-20">
      <div className="mx-auto mb-10 flex max-w-6xl items-end justify-between gap-6 px-4">
        <h3 className="max-w-[16ch] text-3xl font-extrabold text-navy sm:text-4xl">
          {es ? 'Descuentos en tus lugares favoritos' : 'Descontos nos seus lugares favoritos'}
        </h3>
        <p className="hidden max-w-[30ch] text-sm text-muted sm:block">
          {es
            ? 'De parques a restaurantes — pasa el mouse para pausar.'
            : 'De parques a restaurantes — passe o mouse para pausar.'}
        </p>
      </div>

      <div className="marquee-pause">
        <ul className="marquee-track flex w-max gap-5 px-4">
          {loop.map((o, i) => {
            const c = t(o)
            return (
              <li
                key={i}
                aria-hidden={i >= OFFERS.length}
                className="lift relative h-[360px] w-[290px] flex-none overflow-hidden rounded-2xl shadow-xl"
                style={{ backgroundImage: `url('${o.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(12,35,80,.05) 30%, rgba(8,18,40,.92))' }}
                />
                <div
                  className="absolute right-4 top-4 font-display text-4xl font-extrabold text-gold"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,.45)' }}
                >
                  {o.pct}
                </div>
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <div className="font-display text-xl font-extrabold leading-tight">{c.name}</div>
                  <div className="mt-1 text-sm text-white/75">{c.cat}</div>
                  <span className="mt-3 inline-block rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {c.tag}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
