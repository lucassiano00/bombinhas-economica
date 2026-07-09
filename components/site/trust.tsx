import type { Locale } from '@/lib/i18n'
import { Reveal } from './reveal'

export function Trust({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h3 className="text-3xl font-extrabold text-navy sm:text-4xl">
            {es ? 'Pagá tranquilo, verificá al instante' : 'Pague tranquilo, verifique na hora'}
          </h3>
          <span className="mx-auto mt-4 block h-1 w-12 rounded-full bg-gold" />
        </div>

        <Reveal group className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* Verification — light card */}
          <div className="rounded-2xl border border-border bg-surface p-9">
            <h4 className="text-2xl font-extrabold text-navy">
              {es ? 'Verificación de estado' : 'Verificação de status'}
            </h4>
            <p className="mt-3 text-muted">
              {es
                ? 'Cualquier socio confirma tu tarjeta por CPF o DNI — sin app, sin complicaciones. Mostrás, confirma, sale el descuento.'
                : 'Qualquer parceiro confirma seu cartão por CPF ou DNI — sem app, sem complicação. Você mostra, ele confere, o desconto sai.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {/* hotfix: sem Passaporte — verificação só por CPF ou DNI */}
              {['CPF', 'DNI', es ? 'Estado activo' : 'Status ativo'].map(
                (b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-section px-3.5 py-2 text-sm font-semibold text-ink"
                  >
                    <span className="h-2 w-2 rounded-full bg-check" />
                    {b}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Audience — dark navy card */}
          <div className="rounded-2xl bg-gradient-to-b from-navy to-navy-900 p-9 text-white">
            <h4 className="text-2xl font-extrabold">
              {es ? 'Hecho para quien está de paso' : 'Feito para quem está de passagem'}
            </h4>
            <p className="mt-3 text-white/75">
              {es
                ? 'Turista brasileño, argentino o residente — la experiencia en español es tan completa como en portugués. Pago seguro y empresa local con CNPJ a la vista.'
                : 'Turista brasileiro, argentino ou morador — a jornada em espanhol é tão completa quanto em português. Pagamento seguro e empresa local com CNPJ à vista.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-5">
              <div>
                <div className="font-display text-2xl font-extrabold text-gold sm:text-3xl">WCAG AA</div>
                <div className="mt-1 text-sm text-white/70">{es ? 'accesible' : 'acessível'}</div>
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold text-gold sm:text-3xl">100%</div>
                <div className="mt-1 text-sm text-white/70">{es ? 'digital' : 'digital'}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
