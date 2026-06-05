'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerClient } from '@/lib/actions/register'

type DependentInput = { fullName: string; documentType: 'rg' | 'dni'; documentNumber: string }

export function RegisterForm() {
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'western_union'>('pix')
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
        documentType: form.get('documentType') as 'rg' | 'dni',
        documentNumber: form.get('documentNumber') as string,
        paymentMethod,
        dependentsList,
      })
      if (result.success) setStep('payment')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function addDependent() {
    if (dependentsList.length < 5) {
      setDependentsList([...dependentsList, { fullName: '', documentType: 'rg', documentNumber: '' }])
    }
  }

  function updateDependent(i: number, field: keyof DependentInput, value: string) {
    setDependentsList(dependentsList.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  function removeDependent(i: number) {
    setDependentsList(dependentsList.filter((_, idx) => idx !== i))
  }

  if (step === 'payment') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Instruções de Pagamento</h2>
        {paymentMethod === 'pix' ? (
          <div className="space-y-3 text-gray-700">
            <p><strong>Chave PIX (CNPJ):</strong> {process.env.NEXT_PUBLIC_PIX_KEY}</p>
            <p><strong>Valor:</strong> R$ 49,90</p>
          </div>
        ) : (
          <div className="space-y-3 text-gray-700">
            <p><strong>Beneficiário:</strong> {process.env.NEXT_PUBLIC_WU_BENEFICIARY}</p>
            <p><strong>Valor equivalente a:</strong> R$ 49,90</p>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Após o pagamento, aguarde a confirmação por e-mail em até 24h.
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
      <div className="flex flex-col gap-1">
        <label htmlFor="documentType" className="text-sm font-medium text-gray-700">Tipo de documento</label>
        <select id="documentType" name="documentType" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="rg">RG (brasileiros)</option>
          <option value="dni">DNI (estrangeiros)</option>
        </select>
      </div>
      <Input id="documentNumber" name="documentNumber" label="Número do documento" required />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Forma de pagamento</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'western_union')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pix">PIX (brasileiros)</option>
          <option value="western_union">Western Union (estrangeiros)</option>
        </select>
      </div>
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
                onChange={(e) => updateDependent(i, 'documentType', e.target.value as 'rg' | 'dni')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="rg">RG</option>
                <option value="dni">DNI</option>
              </select>
              <Input
                label="Número do documento"
                value={dep.documentNumber}
                onChange={(e) => updateDependent(i, 'documentNumber', e.target.value)}
                required
              />
              <button type="button" onClick={() => removeDependent(i)} className="text-xs text-red-500 hover:text-red-700">
                Remover dependente
              </button>
            </div>
          ))}
        </div>
      )}
      {dependentsList.length < 5 && (
        <button type="button" onClick={addDependent} className="text-sm text-blue-600 hover:underline">
          + Adicionar dependente
        </button>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Cadastrando...' : 'Criar meu cartão'}
      </Button>
    </form>
  )
}
