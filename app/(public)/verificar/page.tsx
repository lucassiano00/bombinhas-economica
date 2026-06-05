import { StatusCheckForm } from '@/components/forms/status-check-form'

export default function VerificarPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Verificar status do cartão
        </h1>
        <StatusCheckForm />
      </div>
    </main>
  )
}
