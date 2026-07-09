'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { registerClient } from '@/lib/actions/register'
import type { Locale } from '@/lib/i18n'

// hotfix: cadastro enxuto — sem telefone e sem passaporte na UI (backend
// segue aceitando 'passport' em registros legados). Regra: titular + 4 dependentes.
type DependentInput = { fullName: string; documentType: 'cpf' | 'dni' | 'passport'; documentNumber: string }

const MAX_DEPENDENTS = 4

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
    labelDependents: (count: number) => `Dependentes (${count}/4)`,
    labelDependentName: (n: number) => `Nome do dependente ${n}`,
    labelDependentDoc: 'Número do documento',
    removeDependent: 'Remover dependente',
    addDependent: '+ Adicionar dependente',
    submit: 'Finalizar cadastro',
    submitting: 'Cadastrando…',
    pendingTitle: 'Cadastro recebido!',
    pendingBody:
      'Seu cadastro foi recebido. O pagamento será processado em breve e você receberá uma confirmação por e-mail.',
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
    labelDependents: (count: number) => `Dependientes (${count}/4)`,
    labelDependentName: (n: number) => `Nombre del dependiente ${n}`,
    labelDependentDoc: 'Número de documento',
    removeDependent: 'Eliminar dependiente',
    addDependent: '+ Agregar dependiente',
    submit: 'Finalizar registro',
    submitting: 'Registrando…',
    pendingTitle: '¡Registro recibido!',
    pendingBody:
      'Tu registro fue recibido. El pago será procesado pronto y recibirás una confirmación por correo electrónico.',
    errorFallback: 'Error al registrarse. Intenta nuevamente.',
  },
} as const

const SELECT_CLASS =
  'w-full bg-field text-ink text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors'

export function RegisterForm({ locale = 'pt' }: RegisterFormProps) {
  const s = STRINGS[locale]
  const [step, setStep] = useState<'form' | 'pending'>('form')
  const [dependentsList, setDependentsList] = useState<DependentInput[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        phone: '', // hotfix: campo removido da UI; coluna aceita vazio
        clientType: documentType === 'cpf' ? 'brazilian' : 'foreigner', // derivado do documento
        documentType,
        documentNumber: form.get('documentNumber') as string,
        dependentsList,
      })
      if (result.success && result.initPoint) {
        window.location.href = result.initPoint
        return
      }
      if (result.success) setStep('pending')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : s.errorFallback)
    } finally {
      setLoading(false)
    }
  }

  function addDependent() {
    if (dependentsList.length < MAX_DEPENDENTS) {
      setDependentsList([...dependentsList, { fullName: '', documentType: 'cpf', documentNumber: '' }])
    }
  }

  function updateDependent(i: number, field: keyof DependentInput, value: string) {
    setDependentsList(dependentsList.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)))
  }

  function removeDependent(i: number) {
    setDependentsList(dependentsList.filter((_, idx) => idx !== i))
  }

  if (step === 'pending') {
    return (
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-bold text-navy mb-4">{s.pendingTitle}</h2>
        <p className="text-ink">{s.pendingBody}</p>
      </Card>
    )
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

        {dependentsList.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">{s.labelDependents(dependentsList.length)}</p>
            {dependentsList.map((dep, i) => (
              <div key={i} className="p-3 border border-border rounded-lg space-y-2 bg-section">
                <Input
                  label={s.labelDependentName(i + 1)}
                  value={dep.fullName}
                  onChange={(e) => updateDependent(i, 'fullName', e.target.value)}
                  required
                />
                <select
                  value={dep.documentType}
                  onChange={(e) => updateDependent(i, 'documentType', e.target.value as 'cpf' | 'dni')}
                  className={SELECT_CLASS}
                >
                  <option value="cpf">CPF</option>
                  <option value="dni">DNI</option>
                </select>
                <Input
                  label={s.labelDependentDoc}
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

        {dependentsList.length < MAX_DEPENDENTS && (
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
