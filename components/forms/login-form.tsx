'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Locale } from '@/lib/i18n'

interface LoginFormProps {
  locale: Locale
}

const STRINGS = {
  pt: {
    logoSub:        'ECONÔMICA',
    heading:        'Entrar na minha conta',
    labelEmail:     'E-mail',
    placeholderEmail: 'voce@email.com',
    labelPassword:  'Senha',
    placeholderPassword: '••••••••',
    submit:         'ENTRAR →',
    submitting:     'Entrando…',
    errorCredentials: 'E-mail ou senha inválidos.',
    errorGeneric:   'Não foi possível entrar agora. Tente novamente.',
    noAccount:      'Não tem conta?',
    register:       'Cadastre-se',
  },
  es: {
    logoSub:        'ECONÔMICA',
    heading:        'Entrar en mi cuenta',
    labelEmail:     'Correo electrónico',
    placeholderEmail: 'tu@correo.com',
    labelPassword:  'Contraseña',
    placeholderPassword: '••••••••',
    submit:         'ENTRAR →',
    submitting:     'Entrando…',
    errorCredentials: 'Correo electrónico o contraseña inválidos.',
    errorGeneric:   'No se pudo iniciar sesión ahora. Intenta nuevamente.',
    noAccount:      '¿No tienes cuenta?',
    register:       'Regístrate',
  },
} as const

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter()
  const s = STRINGS[locale]
  const [credError, setCredError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setCredError('')
    const form = new FormData(e.currentTarget)
    try {
      const result = await signIn('credentials', {
        email: form.get('email'),
        password: form.get('password'),
        redirect: false,
      })
      if (result?.error) {
        setCredError(s.errorCredentials)
        return
      }
      router.push(`/${locale}/auth/redirect`)
    } catch {
      // signIn lançou (rede/servidor): feedback em vez de falha silenciosa.
      setCredError(s.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm py-8 px-7">
      {/* Brand lockup */}
      <div className="mb-6 text-center">
        <p className="text-2xl font-extrabold tracking-tight text-navy">
          Bombinhas<span className="text-teal">+</span>
        </p>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold">{s.logoSub}</p>
      </div>

      <h1 className="mb-6 text-center text-xl font-extrabold text-navy">{s.heading}</h1>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label={s.labelEmail}
          placeholder={s.placeholderEmail}
          required
          disabled={loading}
          autoComplete="email"
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={s.labelPassword}
          placeholder={s.placeholderPassword}
          required
          disabled={loading}
          autoComplete="current-password"
          error={credError || undefined}
        />

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 text-sm tracking-wide"
        >
          {loading ? s.submitting : s.submit}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-muted">
        {s.noAccount}{' '}
        <Link
          href={`/${locale}/cadastro`}
          className="font-semibold text-navy underline underline-offset-2 transition-colors hover:text-navy-800"
        >
          {s.register}
        </Link>
      </p>
    </Card>
  )
}
