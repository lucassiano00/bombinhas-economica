import type { Locale } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

type Dependent = {
  id: string
  clientId: string
  fullName: string
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
}

interface DigitalCardProps {
  holderName: string
  status: 'active' | 'inactive' | 'pending'
  dependents: Dependent[]
  /** Locale for i18n labels. Defaults to 'pt'. */
  locale?: Locale
}

type StatusKey = 'active' | 'inactive' | 'pending'

interface CardStrings {
  brandSub: string
  holderLabel: string
  dependentsLabel: string
  footer: string
  statusLabels: Record<StatusKey, string>
}

const CARD_STRINGS: Record<Locale, CardStrings> = {
  pt: {
    brandSub: 'Cartão de Descontos · Bombinhas/SC',
    holderLabel: 'Titular',
    dependentsLabel: 'Dependentes',
    footer: 'Apresente ao estabelecimento parceiro para ativar seu desconto',
    statusLabels: { active: 'ATIVO', pending: 'PENDENTE', inactive: 'INATIVO' },
  },
  es: {
    brandSub: 'Tarjeta de Descuentos · Bombinhas/SC',
    holderLabel: 'Titular',
    dependentsLabel: 'Dependientes',
    footer: 'Presente en el establecimiento socio para activar su descuento',
    statusLabels: { active: 'ACTIVO', pending: 'PENDIENTE', inactive: 'INACTIVO' },
  },
}

export function DigitalCard({ holderName, status, dependents, locale = 'pt' }: DigitalCardProps) {
  const t = CARD_STRINGS[locale]

  return (
    // Navy base — the trust artifact. Shadow-xl reinforces physical card feel (DESIGN.md §4 exception).
    <div className="relative max-w-sm mx-auto bg-navy rounded-2xl shadow-xl overflow-hidden">

      {/* Gold top stripe — physical card signature; gold ≤15% of card area ✓ */}
      <div className="h-1.5 bg-gold" aria-hidden="true" />

      <div className="px-6 pb-6 pt-5">

        {/* Brand header */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-extrabold text-gold tracking-tight leading-tight">
            Bombinhas+ Econômica
          </h2>
          <p className="text-xs text-surface/60 mt-0.5 tracking-wide">
            {t.brandSub}
          </p>
        </div>

        <div className="border-t border-surface/10 mb-5" aria-hidden="true" />

        {/* Holder */}
        <div className="mb-4">
          <p className="text-xs text-surface/60 font-semibold tracking-widest uppercase mb-1">
            {t.holderLabel}
          </p>
          <p className="text-lg font-semibold text-surface leading-tight">{holderName}</p>
        </div>

        {/* Status — three channels: color + dot + text label (via Badge) */}
        <div className="mb-5">
          <Badge status={status} label={t.statusLabels[status]} />
        </div>

        {/* Dependents */}
        {dependents.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-surface/60 font-semibold tracking-widest uppercase mb-2">
              {t.dependentsLabel}
            </p>
            <ul className="space-y-1.5">
              {dependents.map((d) => (
                <li key={d.id} className="text-sm text-surface/80 font-medium">
                  {d.fullName}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer instruction */}
        <p className="text-xs text-center text-surface/60 mt-4 pt-4 border-t border-surface/10 leading-relaxed">
          {t.footer}
        </p>
      </div>
    </div>
  )
}
