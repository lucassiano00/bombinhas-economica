'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { verifyStatus } from '@/lib/actions/verify-status'
import type { Locale } from '@/lib/i18n'

interface StatusCheckFormProps {
  locale?: Locale
}

const STRINGS = {
  pt: {
    label: 'CPF ou DNI',
    placeholder: 'Ex: 123.456.789-00 ou 12345678',
    submit: 'Verificar status',
    loading: 'Verificando…',
    errorEmpty: 'Por favor, informe o número do documento.',
    errorInvalid: 'Documento inválido. Verifique o número e tente novamente.',
    notFound: 'Documento não encontrado. Verifique o número ou entre em contato com o suporte.',
    resultTitle: 'Status do seu cartão',
    badgeActive: 'ATIVO',
    badgeInactive: 'INATIVO',
  },
  es: {
    label: 'CPF o DNI',
    placeholder: 'Ej: 12345678 o 123.456.789-00',
    submit: 'Verificar estado',
    loading: 'Verificando…',
    errorEmpty: 'Por favor, ingresa el número de documento.',
    errorInvalid: 'Documento inválido. Verifica el número e intenta nuevamente.',
    notFound: 'Documento no encontrado. Verifica el número o contacta con soporte.',
    resultTitle: 'Estado de tu tarjeta',
    badgeActive: 'ACTIVO',
    badgeInactive: 'INACTIVO',
  },
} as const

/** Accept CPF (11 digits), DNI (7-8 digits), or passport (6-12 alphanumeric). */
function isValidDocument(value: string): boolean {
  const cleaned = value.replace(/[\s.\-/]/g, '')
  return /^[A-Za-z0-9]{6,14}$/.test(cleaned)
}

export function StatusCheckForm({ locale = 'pt' }: StatusCheckFormProps) {
  const s = STRINGS[locale]
  const [result, setResult] = useState<'active' | 'inactive' | 'not_found' | null>(null)
  const [loading, setLoading] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)

    const form = new FormData(e.currentTarget)
    const raw = (form.get('document') as string).trim()

    if (!raw) {
      setInputError(s.errorEmpty)
      return
    }
    if (!isValidDocument(raw)) {
      setInputError(s.errorInvalid)
      return
    }

    setInputError(null)
    setLoading(true)
    try {
      const status = await verifyStatus(raw)
      setResult(status)
    } finally {
      setLoading(false)
    }
  }

  function handleChange() {
    if (inputError) setInputError(null)
    if (result) setResult(null)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="document"
          name="document"
          label={s.label}
          placeholder={s.placeholder}
          error={inputError ?? undefined}
          onChange={handleChange}
          autoComplete="off"
          inputMode="text"
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-sm font-extrabold tracking-wide"
        >
          {loading ? s.loading : s.submit}
        </Button>
      </form>

      {result && (
        <Card className="mt-8 text-center py-6">
          <p className="mb-3 text-sm font-semibold text-navy">
            {s.resultTitle}
          </p>
          {result === 'not_found' ? (
            <p className="text-sm text-ink">{s.notFound}</p>
          ) : (
            <Badge
              status={result}
              label={result === 'active' ? s.badgeActive : s.badgeInactive}
            />
          )}
        </Card>
      )}
    </div>
  )
}
