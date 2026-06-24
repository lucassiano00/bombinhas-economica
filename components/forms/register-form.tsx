'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerClient } from '@/lib/actions/register'

type DependentInput = { fullName: string; documentType: 'cpf' | 'dni' | 'passport'; documentNumber: string }

export function RegisterForm() {
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
        email: form.get('email') as string,
        password: form.get('password') as string,
        fullName: form.get('fullName') as string,
        phone: form.get('phone') as string,
        clientType: form.get('clientType') as 'brazilian' | 'foreigner',
        documentType: form.get('documentType') as 'cpf' | 'dni' | 'passport',
        documentNumber: form.get('documentNumber') as string,
        dependentsList,
      })
      if (result.success) setStep('pending')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.')
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
    setDependentsList(dependentsList.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  function removeDependent(i: number) {
    setDependentsList(dependentsList.filter((_, idx) => idx !== i))
  }

  if (step === 'pending') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Cadastro recebido!</h2>
        <p className="text-gray-700">
          Seu cadastro foi recebido. O pagamento será processado em breve e você receberá uma confirmação por e-mail.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Criar meu cartão</h2>
      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
      <Input id="email" name="email" type="email" label="E-mail" required />
      <Input id="password" name="password" type="password" label="Senha (mínimo 8 caracteres)" required minLength={8} />
      <Input id="fullName" name="fullName" label="Nome completo" required />
      <Input id="phone" name="phone" type="tel" label="Telefone / WhatsApp" required />
      <div className="flex flex-col gap-1">
        <label htmlFor="clientType" className="text-sm font-medium text-gray-700">Tipo de cliente</label>
        <select id="clientType" name="clientType" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="brazilian">Brasileiro</option>
          <option value="foreigner">Estrangeiro</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="documentType" className="text-sm font-medium text-gray-700">Tipo de documento</label>
        <select id="documentType" name="documentType" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="cpf">CPF (brasileiros)</option>
          <option value="dni">DNI (estrangeiros hispânicos)</option>
          <option value="passport">Passaporte</option>
        </select>
      </div>
      <Input id="documentNumber" name="documentNumber" label="Número do documento" required />
      {dependentsList.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Dependentes ({dependentsList.length}/5)</p>
          {dependentsList.map((dep, i) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
              <Input
                label={`Nome do dependente ${i + 1}`}
                value={dep.fullName}
                onChange={(e) => updateDependent(i, 'fullName', e.target.value)}
                required
              />
              <select
                value={dep.documentType}
                onChange={(e) => updateDependent(i, 'documentType', e.target.value as 'cpf' | 'dni' | 'passport')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="cpf">CPF</option>
                <option value="dni">DNI</option>
                <option value="passport">Passaporte</option>
              </select>
              <Input
                label="Número do documento"
                value={dep.documentNumber}
                onChange={(e) => updateDependent(i, 'documentNumber', e.target.value)}
                required
              />
              <Button type="button" variant="danger" onClick={() => removeDependent(i)} className="text-xs px-2 py-1">
                Remover dependente
              </Button>
            </div>
          ))}
        </div>
      )}
      {dependentsList.length < 5 && (
        <Button type="button" variant="secondary" onClick={addDependent} className="text-sm">
          + Adicionar dependente
        </Button>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Cadastrando...' : 'Criar meu cartão'}
      </Button>
    </form>
  )
}
