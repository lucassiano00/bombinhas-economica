'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { registerClient } from '@/lib/actions/register'
import { PLANS, PLAN_IDS, formatPrice, type PlanId } from '@/lib/plans'
import type { Locale } from '@/lib/i18n'

// Cadastro sem passaporte na UI (backend segue aceitando 'passport' em registros
// legados). Regra: titular + 4 dependentes, todos com telefone e país.
type DependentInput = {
  fullName: string
  phone: string
  country: string
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
}

// ponytail: lista curta e fechada — é o público que a própria landing declara
// (brasileiro, argentino ou morador). Novo mercado = mais uma linha aqui.
const COUNTRIES = [
  { code: 'BR', pt: 'Brasil', es: 'Brasil' },
  { code: 'AR', pt: 'Argentina', es: 'Argentina' },
  { code: 'UY', pt: 'Uruguai', es: 'Uruguay' },
  { code: 'PY', pt: 'Paraguai', es: 'Paraguay' },
  { code: 'CL', pt: 'Chile', es: 'Chile' },
] as const

interface RegisterFormProps {
  locale?: Locale
}

const STRINGS = {
  pt: {
    labelEmail: 'E-mail',
    labelPassword: 'Senha (mínimo 8 caracteres)',
    labelFullName: 'Nome completo',
    labelPhone: 'Telefone / WhatsApp',
    labelClientType: 'Tipo de cliente',
    optionBrazilian: 'Brasileiro',
    optionForeigner: 'Estrangeiro',
    labelDocumentType: 'Tipo de documento',
    optionCpf: 'CPF (brasileiros)',
    optionDni: 'DNI (estrangeiros hispânicos)',
    optionPassport: 'Passaporte',
    labelDocumentNumber: 'Número do documento',
    labelCountry: 'País',
    labelPlan: 'Plano',
    labelDependents: (count: number, max: number) => `Dependentes (${count}/${max})`,
    labelDependentName: (n: number) => `Nome do dependente ${n}`,
    labelDependentPhone: (n: number) => `Telefone do dependente ${n}`,
    labelDependentCountry: (n: number) => `País do dependente ${n}`,
    labelDependentDoc: (n: number) => `Documento do dependente ${n}`,
    removeDependent: 'Remover dependente',
    addDependent: '+ Adicionar dependente',
    submit: 'Finalizar cadastro',
    submitting: 'Cadastrando…',
    errorNoCheckout: 'Não foi possível abrir o pagamento. Nada foi cobrado — tente novamente.',
    errorFallback: 'Erro ao cadastrar. Tente novamente.',
  },
  es: {
    labelEmail: 'Correo electrónico',
    labelPassword: 'Contraseña (mínimo 8 caracteres)',
    labelFullName: 'Nombre completo',
    labelPhone: 'Teléfono / WhatsApp',
    labelClientType: 'Tipo de cliente',
    optionBrazilian: 'Brasileño',
    optionForeigner: 'Extranjero',
    labelDocumentType: 'Tipo de documento',
    optionCpf: 'CPF (brasileños)',
    optionDni: 'DNI (extranjeros hispanos)',
    optionPassport: 'Pasaporte',
    labelDocumentNumber: 'Número de documento',
    labelCountry: 'País',
    labelPlan: 'Plan',
    labelDependents: (count: number, max: number) => `Dependientes (${count}/${max})`,
    labelDependentName: (n: number) => `Nombre del dependiente ${n}`,
    labelDependentPhone: (n: number) => `Teléfono del dependiente ${n}`,
    labelDependentCountry: (n: number) => `País del dependiente ${n}`,
    labelDependentDoc: (n: number) => `Documento del dependiente ${n}`,
    removeDependent: 'Eliminar dependiente',
    addDependent: '+ Agregar dependiente',
    submit: 'Finalizar registro',
    submitting: 'Registrando…',
    errorNoCheckout: 'No pudimos abrir el pago. No se cobró nada — intentá nuevamente.',
    errorFallback: 'Error al registrarse. Intenta nuevamente.',
  },
} as const

const SELECT_CLASS =
  'w-full bg-field text-ink text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors'

export function RegisterForm({ locale = 'pt' }: RegisterFormProps) {
  const s = STRINGS[locale]
  // Padrão no plano de entrada: quem quer mais dependentes sobe de plano de
  // propósito, em vez de descobrir no checkout que pagou o mais caro.
  const [plan, setPlan] = useState<PlanId>('individual')
  const [dependentsList, setDependentsList] = useState<DependentInput[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const maxDependents = PLANS[plan].maxDependents

  // Descer de plano tem que cortar o excesso aqui — se sobrar dependente além
  // do teto, o servidor recusa o cadastro inteiro.
  function changePlan(next: PlanId) {
    setPlan(next)
    setDependentsList((list) => list.slice(0, PLANS[next].maxDependents))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      const documentType = form.get('documentType') as 'cpf' | 'dni'
      const result = await registerClient({
        locale,
        email: form.get('email') as string,
        // hotfix demo: cadastro coleta só 3 dados — senha provisória gerada aqui.
        // ponytail: fluxo real = magic link / definir senha por e-mail, próxima sprint.
        password: crypto.randomUUID(),
        fullName: form.get('fullName') as string,
        phone: form.get('phone') as string,
        country: form.get('country') as string,
        clientType: documentType === 'cpf' ? 'brazilian' : 'foreigner', // derivado do documento
        documentType,
        documentNumber: form.get('documentNumber') as string,
        plan,
        dependentsList,
      })
      // Cliente (05/08): trava — cadastro só "termina" no checkout. Sem link de
      // pagamento isto é erro, nunca uma tela de sucesso.
      if (!result.success || !result.initPoint) {
        setError(s.errorNoCheckout)
        return
      }
      window.location.href = result.initPoint
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : s.errorFallback)
    } finally {
      setLoading(false)
    }
  }

  function addDependent() {
    if (dependentsList.length < maxDependents) {
      setDependentsList([
        ...dependentsList,
        { fullName: '', phone: '', country: 'BR', documentType: 'cpf', documentNumber: '' },
      ])
    }
  }

  function updateDependent(i: number, field: keyof DependentInput, value: string) {
    setDependentsList(dependentsList.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)))
  }

  function removeDependent(i: number) {
    setDependentsList(dependentsList.filter((_, idx) => idx !== i))
  }

  return (
    <Card className="max-w-md mx-auto">
      {/* validação básica nativa (required/email) — noValidate removido */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg" role="alert">
            {error}
          </p>
        )}

        {/* hotfix demo: estritamente 3 dados, nesta ordem — Nome, Documento, E-mail.
            Senha saiu da UI (gerada no submit); sem telefone, sem Passaporte. */}
        {/* Cliente (12/08): individual R$ 49,90 · casal R$ 79,90 (1 dependente)
            · família R$ 99,90 (4 dependentes). O plano vem primeiro porque
            define o preço e quantos dependentes o resto do form aceita. */}
        <div className="flex flex-col gap-1">
          <label htmlFor="plan" className="text-sm font-semibold text-ink">
            {s.labelPlan}
          </label>
          <select
            id="plan"
            name="plan"
            value={plan}
            onChange={(e) => changePlan(e.target.value as PlanId)}
            disabled={loading}
            className={SELECT_CLASS}
          >
            {PLAN_IDS.map((id) => (
              <option key={id} value={id}>
                {`${locale === 'es' ? PLANS[id].es : PLANS[id].pt} — ${formatPrice(id)}`}
              </option>
            ))}
          </select>
        </div>

        <Input id="fullName" name="fullName" label={s.labelFullName} required disabled={loading} />

        <div className="flex flex-col gap-1">
          <label htmlFor="documentType" className="text-sm font-semibold text-ink">
            {s.labelDocumentType}
          </label>
          <select id="documentType" name="documentType" disabled={loading} className={SELECT_CLASS}>
            <option value="cpf">{s.optionCpf}</option>
            <option value="dni">{s.optionDni}</option>
          </select>
        </div>

        <Input id="documentNumber" name="documentNumber" label={s.labelDocumentNumber} required disabled={loading} />

        <Input id="email" name="email" type="email" label={s.labelEmail} required disabled={loading} />

        <Input id="phone" name="phone" type="tel" label={s.labelPhone} required disabled={loading} />

        <div className="flex flex-col gap-1">
          <label htmlFor="country" className="text-sm font-semibold text-ink">
            {s.labelCountry}
          </label>
          <select id="country" name="country" defaultValue="BR" disabled={loading} className={SELECT_CLASS}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {locale === 'es' ? c.es : c.pt}
              </option>
            ))}
          </select>
        </div>

        {dependentsList.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">
              {s.labelDependents(dependentsList.length, maxDependents)}
            </p>
            {dependentsList.map((dep, i) => (
              <div key={i} className="p-3 border border-border rounded-lg space-y-2 bg-section">
                {/* id em todos: sem ele o <label htmlFor> do Input fica solto e o
                    campo perde nome acessível (valia pros campos que já existiam). */}
                <Input
                  id={`dep-name-${i}`}
                  label={s.labelDependentName(i + 1)}
                  value={dep.fullName}
                  onChange={(e) => updateDependent(i, 'fullName', e.target.value)}
                  required
                />
                <Input
                  id={`dep-phone-${i}`}
                  type="tel"
                  label={s.labelDependentPhone(i + 1)}
                  value={dep.phone}
                  onChange={(e) => updateDependent(i, 'phone', e.target.value)}
                  required
                />
                <div className="flex flex-col gap-1">
                  <label htmlFor={`dep-country-${i}`} className="text-sm font-semibold text-ink">
                    {s.labelDependentCountry(i + 1)}
                  </label>
                  <select
                    id={`dep-country-${i}`}
                    value={dep.country}
                    onChange={(e) => updateDependent(i, 'country', e.target.value)}
                    className={SELECT_CLASS}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {locale === 'es' ? c.es : c.pt}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  aria-label={s.labelDocumentType}
                  value={dep.documentType}
                  onChange={(e) => updateDependent(i, 'documentType', e.target.value as 'cpf' | 'dni')}
                  className={SELECT_CLASS}
                >
                  <option value="cpf">CPF</option>
                  <option value="dni">DNI</option>
                </select>
                <Input
                  id={`dep-doc-${i}`}
                  label={s.labelDependentDoc(i + 1)}
                  value={dep.documentNumber}
                  onChange={(e) => updateDependent(i, 'documentNumber', e.target.value)}
                  required
                />
                <Button type="button" variant="danger" onClick={() => removeDependent(i)} className="text-xs px-2 py-1">
                  {s.removeDependent}
                </Button>
              </div>
            ))}
          </div>
        )}

        {dependentsList.length < maxDependents && (
          <Button type="button" variant="secondary" onClick={addDependent} className="text-sm">
            {s.addDependent}
          </Button>
        )}

        <Button type="submit" disabled={loading} className="w-full py-3 text-sm tracking-wide">
          {loading ? s.submitting : s.submit}
        </Button>
        <p className="text-center text-xs text-muted">
          {locale === 'es' ? 'Pago seguro vía PIX' : 'Pagamento seguro via PIX'}
        </p>
      </form>
    </Card>
  )
}
