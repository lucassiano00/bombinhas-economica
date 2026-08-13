import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import { formatPrice } from '@/lib/plans'
import { Reveal } from './reveal'

type Loc = { t: string; d: string }
type Step = { no: string; pt: Loc; es: Loc }

// Preços interpolados de PLANS — texto solto aqui já divergiu do que era cobrado.
const IND = formatPrice('individual')
const CAS = formatPrice('casal')
const FAM = formatPrice('familia')

// Texto dos 4 passos definido pelo cliente em 12/08/2026. O passo 04 é novo.
const STEPS: Step[] = [
  {
    no: '01',
    pt: {
      t: 'Cadastre-se',
      d: 'Nome, documento (CPF ou DNI), e-mail, telefone e país. Em português ou espanhol.',
    },
    es: {
      t: 'Registrate',
      d: 'Nombre, documento (CPF o DNI), e-mail, teléfono y país. En portugués o español.',
    },
  },
  {
    no: '02',
    pt: {
      t: 'Pague e ative',
      d: `Pague apenas ${IND} no plano individual, ${CAS} no casal ou ${FAM} no família, via PIX, e tenha seu cartão digital ativado na hora, direto no celular. Com ele, você pode economizar cerca de R$ 1.500,00 durante as suas férias.`,
    },
    es: {
      t: 'Pagá y activá',
      d: `Pagá solo ${IND} en el plan individual, ${CAS} en pareja o ${FAM} en familia, vía PIX, y tené tu tarjeta digital activada al instante, directo en el celular. Con ella podés ahorrar cerca de R$ 1.500,00 durante tus vacaciones.`,
    },
  },
  {
    no: '03',
    pt: {
      t: 'Mostre e economize',
      d: 'Ao comprar em qualquer empresa parceira, abra a plataforma, acesse Consulta de Status, mostre a tela ao caixa e o desconto será aplicado na hora.',
    },
    es: {
      t: 'Mostrá y ahorrá',
      d: 'Al comprar en cualquier empresa socia, abrí la plataforma, entrá en Consulta de Estado, mostrá la pantalla en la caja y el descuento se aplica al instante.',
    },
  },
  {
    no: '04',
    pt: {
      t: 'No mercado é diferente',
      d: 'Nos supermercados parceiros, o desconto é aplicado automaticamente no caixa, sem precisar acessar a plataforma ou verificar o status, pois seus dados já estão cadastrados no sistema.',
    },
    es: {
      t: 'En el súper es diferente',
      d: 'En los supermercados socios, el descuento se aplica automáticamente en la caja, sin abrir la plataforma ni verificar el estado, porque tus datos ya están en el sistema.',
    },
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

        {/* 4 passos agora (era 3): 2 colunas no tablet, 4 no desktop. */}
        <Reveal as="ol" group className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const c = es ? s.es : s.pt
            return (
              <li key={s.no} className="relative pt-2">
                {/* Conector só em lg: no tablet são 2 colunas e a linha
                    apontaria pro vazio no fim da primeira fileira. */}
                {i < STEPS.length - 1 && (
                  <span className="absolute left-[54px] right-[-18px] top-[29px] hidden h-0.5 bg-gradient-to-r from-gold/40 to-transparent lg:block" />
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

        {/* Cliente (12/08): botão de verificação de status logo abaixo do "como funciona". */}
        <div className="mt-14 text-center">
          <Link
            href={`/${locale}/verificar`}
            className="press inline-flex rounded-full bg-navy px-7 py-3.5 text-sm font-extrabold tracking-wide text-white hover:bg-navy-800"
          >
            {es ? 'VERIFICACIÓN DE ESTADO →' : 'VERIFICAÇÃO DE STATUS →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
