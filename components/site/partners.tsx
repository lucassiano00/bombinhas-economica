import type { Locale } from '@/lib/i18n'

export function Partners({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section id="empresas" className="bg-section pb-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-border bg-surface px-6 py-7 shadow-sm">
          <h3 className="text-center text-base font-extrabold tracking-wide text-navy">
            {es ? 'ALGUNOS DE NUESTROS SOCIOS' : 'ALGUNS DE NOSSOS PARCEIROS'}
          </h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            <span className="text-xl font-black italic text-red">
              K<span className="text-navy">koch</span>
              <span className="ml-1 align-top text-[0.55rem] not-italic text-muted">
                supermercados
              </span>
            </span>
            <span className="text-sm font-black uppercase tracking-tight text-navy">
              Beto Carrero <span className="text-red">World</span>
            </span>
            <span className="text-xl font-extrabold text-blue">
              Pan<span className="text-red">Vel</span>
              <span className="ml-1 block text-[0.55rem] font-semibold tracking-widest text-muted">
                FARMÁCIAS
              </span>
            </span>
            <span className="text-xl font-black italic tracking-tight text-ink">Becker</span>
            <span className="text-lg font-bold uppercase text-teal">
              Oceanic{' '}
              <span className="block text-[0.55rem] tracking-[0.3em] text-muted">AQUÁRIO</span>
            </span>
            <span className="rounded-md bg-red px-3 py-1 text-center text-xs font-black uppercase leading-tight text-white">
              Restaurante
              <br />
              <span className="text-gold">Do Zé</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
