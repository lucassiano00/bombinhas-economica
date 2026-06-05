'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      const result = await signIn('credentials', {
        email: form.get('email'),
        password: form.get('password'),
        redirect: false,
      })
      if (result?.error) {
        setError('E-mail ou senha inválidos.')
        return
      }
      router.push('/auth/redirect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded-2xl shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Entrar</h2>
      {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
      <Input id="email" name="email" type="email" label="E-mail" required />
      <Input id="password" name="password" type="password" label="Senha" required />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
