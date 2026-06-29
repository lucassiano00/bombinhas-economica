import type { Locale } from '@/lib/i18n'

// Faux wordmarks until real logo assets exist. A trustworthy partner wall reads as
// one cohesive monochrome row, not six mismatched colors — so they all share the
// same muted-navy tone and weight. Swap each for the real SVG logo when available.
const PARTNERS = ['Kkoch', 'Beto Carrero World', 'PanVel', 'Becker', 'Oceanic', 'Restaurante do Zé']

export function Partners({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="empresas" className="bg-section pb-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-border bg-surface px-6 py-8 shadow-sm">
          <h3 className="text-center text-xl font-extrabold text-navy">
            {es ? 'Nuestros socios en Bombinhas' : 'Nossos parceiros em Bombinhas'}
          </h3>
          <p className="mt-1 text-center text-sm text-muted">
            {es
              ? 'Establecimientos reales, descuentos reales.'
              : 'Estabelecimentos reais, descontos reais.'}
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {PARTNERS.map((name) => (
              <li
                key={name}
                className="text-lg font-bold tracking-tight text-navy/55 transition-colors hover:text-navy"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
