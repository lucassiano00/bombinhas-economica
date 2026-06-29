import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

type Loc = { t: string; d: string }
type Step = { no: string; pt: Loc; es: Loc }

const STEPS: Step[] = [
  {
    no: '01',
    pt: { t: 'Cadastre-se', d: 'Nome, documento (CPF ou DNI/passaporte), WhatsApp e e-mail. Em português ou espanhol.' },
    es: { t: 'Registrate', d: 'Nombre, documento (CPF o DNI/pasaporte), WhatsApp y e-mail. En portugués o español.' },
  },
  {
    no: '02',
    pt: { t: 'Pague e ative', d: 'R$ 99/ano via Mercado Pago. Seu cartão digital fica ativo na hora, direto no celular.' },
    es: { t: 'Pagá y activá', d: 'R$ 99/año vía Mercado Pago. Tu tarjeta digital queda activa al instante, en el celular.' },
  },
  {
    no: '03',
    pt: { t: 'Mostre e economize', d: 'Em qualquer parceiro, informe o documento. O desconto é aplicado na hora, sem app.' },
    es: { t: 'Mostrá y ahorrá', d: 'En cualquier socio, informá el documento. El descuento se aplica al instante, sin app.' },
  },
]

export function Steps({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h3 className="text-2xl font-extrabold text-navy sm:text-4xl">
            {es ? 'Del registro al descuento en minutos' : 'Do cadastro ao desconto em minutos'}
          </h3>
          <span className="mx-auto mt-4 block h-1 w-12 rounded-full bg-gold" />
        </div>

        <Reveal as="ol" group className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => {
            const c = es ? s.es : s.pt
            return (
              <li key={s.no} className="relative pt-2">
                {i < STEPS.length - 1 && (
                  <span className="absolute left-[54px] right-[-18px] top-[29px] hidden h-0.5 bg-gradient-to-r from-gold/40 to-transparent sm:block" />
                )}
                <span className="grid h-[42px] w-[42px] place-items-center rounded-xl border border-gold/30 bg-gold/10 font-display text-base font-extrabold text-gold-deep">
                  {s.no}
                </span>
                <h4 className="mt-5 text-xl font-extrabold text-navy">{c.t}</h4>
                <p className="mt-2 text-muted">{c.d}</p>
              </li>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
