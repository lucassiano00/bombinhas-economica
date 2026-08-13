'use client'
import { useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n'

// Mesma velocidade da marquee antiga (26s p/ percorrer uma cópia da lista).
// ponytail: piso prático ~40px/s — abaixo disso o incremento por frame cai de
// meio pixel e o scrollLeft arredonda pra zero em tela DPR 1, travando a esteira.
const SPEED = 59 // px/s
const HOLD_MS = 1500 // pausa depois que o dedo/scroll encosta

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
  // Duplicate the set so the loop is seamless; the copy is hidden from a11y.
  const loop = [...OFFERS, ...OFFERS]

  const ref = useRef<HTMLUListElement>(null)
  const stop = useRef(false) // mouse em cima ou foco no teclado
  const holdUntil = useRef(0) // dedo/roda acabou de mexer

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    // Onde a segunda cópia começa = ponto exato de wrap. Não uso scrollWidth/2
    // porque ele inclui o padding do container e desalinharia alguns px por volta.
    const lapWidth = () => {
      const first = el.children[0] as HTMLElement | undefined
      const clone = el.children[OFFERS.length] as HTMLElement | undefined
      return first && clone ? clone.offsetLeft - first.offsetLeft : 0
    }
    let lap = lapWidth()
    let last = performance.now()
    let raf = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05) // clamp: aba volta do background
      last = now
      if (!lap) lap = lapWidth() // imagens ainda carregando na 1ª frame
      if (!reduce.matches && !stop.current && now > holdUntil.current) {
        el.scrollLeft += SPEED * dt
      }
      if (lap && el.scrollLeft >= lap) el.scrollLeft -= lap
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // ponytail: sem wrap pra trás. Quem arrasta até o começo encosta na borda e o
  // auto-scroll traz de volta em 1,5s — não vale o estado extra pra evitar isso.
  const hold = () => {
    holdUntil.current = performance.now() + HOLD_MS
  }

  return (
    <section className="overflow-hidden bg-surface py-20">
      <div className="mx-auto mb-10 flex max-w-6xl items-end justify-between gap-6 px-4">
        <h3 className="max-w-[16ch] text-3xl font-extrabold text-navy sm:text-4xl">
          {es ? 'Descuentos en tus lugares favoritos' : 'Descontos nos seus lugares favoritos'}
        </h3>
        {/* hotfix: CTA "Clique aqui" → rola até a grade de parceiros (#empresas) */}
        <a
          href="#empresas"
          className="press inline-flex shrink-0 items-center rounded-full bg-gold px-5 py-2.5 text-xs font-extrabold tracking-wide text-navy hover:bg-gold-deep"
        >
          {es ? 'Hacé clic aquí' : 'Clique aqui'}
        </a>
      </div>

      <ul
        ref={ref}
        className="swipe-x flex w-full gap-5 px-4"
        tabIndex={0}
        role="region"
        aria-label={es ? 'Descuentos de socios' : 'Descontos de parceiros'}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') stop.current = true
        }}
        onPointerLeave={() => {
          stop.current = false
        }}
        onFocus={() => {
          stop.current = true
        }}
        onBlur={() => {
          stop.current = false
        }}
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={hold}
        onKeyDown={hold}
      >
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
    </section>
  )
}
