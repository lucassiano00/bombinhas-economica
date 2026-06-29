import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { CardReel } from './card-reel'

// Aerial coast — green hills meeting a turquoise bay, the iconic litoral-SC / Bombinhas look.
const HERO_IMG =
  'https://images.unsplash.com/photo-1508971607899-a238a095d417?auto=format&fit=crop&w=1600&q=80'

export function Hero({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section">
      {/* Hero banner */}
      <div className="relative min-h-[560px] overflow-hidden sm:min-h-[620px]">
        {/* Dedicated photo layer so the Ken Burns push scales the image, not the text. */}
        <div
          className="ken-burns absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMG}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/20" />
        <div className="relative mx-auto grid min-h-[560px] max-w-6xl items-center gap-8 px-4 pb-28 pt-12 sm:min-h-[620px] sm:pb-32 lg:grid-cols-2">
          <div className="max-w-xl text-white">
            <p className="hero-in mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gold" style={{ '--i': 0 } as React.CSSProperties}>
              Bombinhas · Santa Catarina
            </p>
            <h2
              className="hero-in text-[2.4rem] font-black leading-[1.02] tracking-tight sm:text-5xl sm:leading-[0.98] lg:text-6xl"
              style={{ textWrap: 'balance', '--i': 1 } as React.CSSProperties}
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
            <p className="hero-in mt-5 max-w-sm text-base leading-relaxed text-white/90" style={{ '--i': 2 } as React.CSSProperties}>
              {es
                ? 'Acceso a descuentos exclusivos en mercados, farmacias, restaurantes y más — por solo R$ 99,00/año.'
                : 'Acesso a descontos exclusivos em mercados, farmácias, restaurantes e mais — por apenas R$ 99,00/ano.'}
            </p>

            <div className="hero-in mt-7 flex flex-wrap items-center gap-3" style={{ '--i': 3 } as React.CSSProperties}>
              <Link
                href={`/${locale}/cadastro`}
                className="press inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-navy shadow-lg hover:bg-gold-deep"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                {es ? 'QUIERO AHORRAR AHORA' : 'QUERO ECONOMIZAR AGORA'}
              </Link>
              <a
                href="#turistas"
                className="press inline-flex items-center rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20"
              >
                {es ? 'Cómo funciona' : 'Ver como funciona'}
              </a>
            </div>

            {/* Trust stats — all real claims (no invented numbers) */}
            <div className="hero-in mt-9 flex flex-wrap gap-x-6 gap-y-4" style={{ '--i': 4 } as React.CSSProperties}>
              <div>
                <div className="font-display text-2xl font-extrabold leading-none">+R$ 1.500</div>
                <div className="mt-1 text-xs text-white/70">{es ? 'ahorro por año' : 'economia por ano'}</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold leading-none">PT · ES</div>
                <div className="mt-1 text-xs text-white/70">{es ? 'bilingüe de verdad' : 'bilíngue de verdade'}</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold leading-none">24h</div>
                <div className="mt-1 text-xs text-white/70">{es ? 'telemedicina incluida' : 'telemedicina inclusa'}</div>
              </div>
            </div>
          </div>

          {/* 3D card reel — desktop only (motion-heavy); coastal bg carries mobile */}
          <div className="hidden lg:block">
            <CardReel />
          </div>
        </div>
      </div>
    </section>
  )
}
