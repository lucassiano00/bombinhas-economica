import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const HERO_IMG =
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80'
const KOCH_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
const PARK_IMG =
  'https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&w=800&q=80'
const VILLA_IMG =
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'

export function Hero({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section">
      {/* Hero banner */}
      <div
        className="relative min-h-[480px] bg-cover bg-center sm:min-h-[560px]"
        style={{ backgroundImage: `url('${HERO_IMG}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        <div className="relative mx-auto flex min-h-[480px] max-w-6xl items-center px-4 pb-28 pt-12 sm:min-h-[560px] sm:pb-32">
          <div className="max-w-xl text-white">
            <h2
              className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {es ? (
                <>
                  Ahorra
                  <br />
                  de verdad en
                  <br />
                  <span className="text-gold">Bombinhas SC</span>
                </>
              ) : (
                <>
                  Economize
                  <br />
                  de verdade em
                  <br />
                  <span className="text-gold">Bombinhas SC</span>
                </>
              )}
            </h2>

            {/* Sub-copy with price anchor — converts visitors before they scroll */}
            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/90">
              {es
                ? 'Acceso a descuentos exclusivos en mercados, farmacias, restaurantes y más — por solo R$ 99,00/año.'
                : 'Acesso a descontos exclusivos em mercados, farmácias, restaurantes e mais — por apenas R$ 99,00/ano.'}
            </p>

            <Link
              href={`/${locale}/cadastro`}
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-navy shadow-lg transition-colors hover:bg-gold-deep"
            >
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              {es ? 'QUIERO AHORRAR AHORA' : 'QUERO ECONOMIZAR AGORA'}
            </Link>
          </div>
        </div>
      </div>

      {/* Discount cards — overlapping the banner */}
      <div className="mx-auto -mt-12 grid max-w-6xl gap-5 px-4 sm:grid-cols-3">
        {/* Koch */}
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div
            className="h-44 bg-cover bg-center"
            style={{ backgroundImage: `url('${KOCH_IMG}')` }}
          />
          <div className="px-5 pb-5 pt-4 text-center">
            <span className="inline-block text-xl font-black italic tracking-tight text-red">
              <span className="text-red">K</span>koch
              <span className="ml-1 align-top text-[0.6rem] font-semibold not-italic text-muted">
                supermercados
              </span>
            </span>
            <p className="mt-2 text-sm text-ink">
              {es ? 'Descuentos exclusivos en' : 'Descontos exclusivos no'}{' '}
              <strong className="font-bold">Bombinhas SC</strong>
            </p>
          </div>
        </article>

        {/* Beto Carrero */}
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div
            className="relative h-44 bg-cover bg-center"
            style={{ backgroundImage: `url('${PARK_IMG}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-navy/90 via-navy/40 to-transparent" />
            <div className="absolute right-4 top-4 text-right text-white">
              <div className="text-4xl font-black leading-none text-gold">20%</div>
              <div className="text-xs font-semibold">
                {es ? 'de descuento en' : 'de desconto no'}
                <br />
                <span className="font-bold">Beto Carrero</span>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4 text-center">
            <span className="text-base font-black tracking-tight text-navy">
              BETO CARRERO <span className="text-gold">WORLD</span>
            </span>
            <p className="mt-1 text-sm font-bold text-ink">Beto Carrero</p>
          </div>
        </article>

        {/* Imóvel de temporada */}
        <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div
            className="relative h-44 bg-cover bg-center"
            style={{ backgroundImage: `url('${VILLA_IMG}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-navy/85 via-navy/30 to-transparent" />
            <div className="absolute right-4 top-4 text-right text-white">
              <div className="text-4xl font-black leading-none text-gold">5%</div>
              <div className="text-xs font-semibold">
                {es ? 'de descuento en' : 'de desconto no'}
                <br />
                <span className="font-bold">{es ? 'tu alquiler' : 'seu imóvel'}</span>
              </div>
            </div>
            <div className="absolute bottom-3 right-4 grid h-12 w-12 place-items-center rounded-xl bg-green text-white shadow-md">
              <Home className="h-6 w-6" />
            </div>
          </div>
          <div className="px-5 pb-5 pt-4 text-center">
            <p className="text-sm text-ink">
              {es
                ? 'de descuento en tu alquiler de temporada'
                : 'de desconto no seu imóvel de temporada'}
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
