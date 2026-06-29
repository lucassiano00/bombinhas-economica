import type { Locale } from '@/lib/i18n'

const DOCTOR_IMG =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80'

export function Telemedicine({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-section py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-9 overflow-hidden rounded-[26px] bg-gradient-to-b from-navy to-navy-900 p-8 text-white sm:grid-cols-[300px_1fr]">
          <img
            src={DOCTOR_IMG}
            alt={es ? 'Médico de telemedicina con bata blanca' : 'Médico de telemedicina de jaleco branco'}
            className="h-60 w-full rounded-[18px] object-cover object-top"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1 text-xs font-bold tracking-wider text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              24h
            </span>
            <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              {es
                ? 'Telemedicina incluida, médico cuando lo necesites'
                : 'Telemedicina incluída, médico quando precisar'}
            </h3>
            <p className="mt-2.5 max-w-[46ch] text-white/75">
              {es ? (
                <>
                  Atención médica online 24 horas al día, donde estés — consultas por solo{' '}
                  <span className="font-display text-xl font-extrabold text-gold">R$ 99,90</span>. Ideal para
                  quien viaja lejos de casa.
                </>
              ) : (
                <>
                  Atendimento médico on-line 24 horas por dia, onde você estiver — consultas por apenas{' '}
                  <span className="font-display text-xl font-extrabold text-gold">R$ 99,90</span>. Ideal para
                  quem está viajando longe de casa.
                </>
              )}
            </p>
            <a
              href="#contato"
              className="press mt-6 inline-flex rounded-full bg-gold px-7 py-3.5 text-sm font-extrabold tracking-wide text-navy hover:bg-gold-deep"
            >
              {es ? 'Saber más →' : 'Saiba mais →'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
