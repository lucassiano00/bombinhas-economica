'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { verifyStatus } from '@/lib/actions/verify-status'

export function StatusCheckForm() {
  const [result, setResult] = useState<'active' | 'inactive' | 'not_found' | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const status = await verifyStatus(form.get('document') as string)
      setResult(status)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="document"
          name="document"
          label="RG ou DNI"
          placeholder="Digite o número do documento"
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Verificando...' : 'Verificar status'}
        </Button>
      </form>
      {result && (
        <div className="mt-6 text-center">
          {result === 'not_found' ? (
            <p className="text-gray-500">Documento não encontrado.</p>
          ) : (
            <Badge status={result as 'active' | 'inactive'} />
          )}
        </div>
      )}
    </div>
  )
}
