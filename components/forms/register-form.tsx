'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { registerClient } from '@/lib/actions/register'
import type { Locale } from '@/lib/i18n'

type DependentInput = { fullName: string; documentType: 'cpf' | 'dni' | 'passport'; documentNumber: string }

interface RegisterFormProps {
  locale?: Locale
}

const STRINGS = {
  pt: {
    heading: 'Criar meu cartão',
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
    labelDependents: (count: number) => `Dependentes (${count}/5)`,
    labelDependentName: (n: number) => `Nome do dependente ${n}`,
    labelDependentDoc: 'Número do documento',
    removeDependent: 'Remover dependente',
    addDependent: '+ Adicionar dependente',
    submit: 'Criar meu cartão',
    submitting: 'Cadastrando…',
    pendingTitle: 'Cadastro recebido!',
    pendingBody:
      'Seu cadastro foi recebido. O pagamento será processado em breve e você receberá uma confirmação por e-mail.',
    errorFallback: 'Erro ao cadastrar. Tente novamente.',
  },
  es: {
    heading: 'Crear mi tarjeta',
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
    labelDependents: (count: number) => `Dependientes (${count}/5)`,
    labelDependentName: (n: number) => `Nombre del dependiente ${n}`,
    labelDependentDoc: 'Número de documento',
    removeDependent: 'Eliminar dependiente',
    addDependent: '+ Agregar dependiente',
    submit: 'Crear mi tarjeta',
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
      const result = await registerClient({
        locale,
        email: form.get('email') as string,
        password: form.get('password') as string,
        fullName: form.get('fullName') as string,
        phone: form.get('phone') as string,
        clientType: form.get('clientType') as 'brazilian' | 'foreigner',
        documentType: form.get('documentType') as 'cpf' | 'dni' | 'passport',
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
    if (dependentsList.length < 5) {
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <h2 className="text-xl font-extrabold text-navy">{s.heading}</h2>

        {error && (
          <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg" role="alert">
            {error}
          </p>
        )}

        <Input id="email" name="email" type="email" label={s.labelEmail} required disabled={loading} />
        <Input
          id="password"
          name="password"
          type="password"
          label={s.labelPassword}
          required
          minLength={8}
          disabled={loading}
        />
        <Input id="fullName" name="fullName" label={s.labelFullName} required disabled={loading} />
        <Input id="phone" name="phone" type="tel" label={s.labelPhone} required disabled={loading} />

        <div className="flex flex-col gap-1">
          <label htmlFor="clientType" className="text-sm font-semibold text-ink">
            {s.labelClientType}
          </label>
          <select id="clientType" name="clientType" disabled={loading} className={SELECT_CLASS}>
            <option value="brazilian">{s.optionBrazilian}</option>
            <option value="foreigner">{s.optionForeigner}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="documentType" className="text-sm font-semibold text-ink">
            {s.labelDocumentType}
          </label>
          <select id="documentType" name="documentType" disabled={loading} className={SELECT_CLASS}>
            <option value="cpf">{s.optionCpf}</option>
            <option value="dni">{s.optionDni}</option>
            <option value="passport">{s.optionPassport}</option>
          </select>
        </div>

        <Input id="documentNumber" name="documentNumber" label={s.labelDocumentNumber} required disabled={loading} />

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
                  onChange={(e) => updateDependent(i, 'documentType', e.target.value as 'cpf' | 'dni' | 'passport')}
                  className={SELECT_CLASS}
                >
                  <option value="cpf">CPF</option>
                  <option value="dni">DNI</option>
                  <option value="passport">{s.optionPassport}</option>
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

        {dependentsList.length < 5 && (
          <Button type="button" variant="secondary" onClick={addDependent} className="text-sm">
            {s.addDependent}
          </Button>
        )}

        <Button type="submit" disabled={loading} className="w-full py-3 text-sm tracking-wide">
          {loading ? s.submitting : s.submit}
        </Button>
      </form>
    </Card>
  )
}
