// TEMP PREVIEW — remover ao final (plano acabamento visual)
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'
import { DigitalCard } from '@/components/card/digital-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default async function PreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const fixtureActive = {
    holderName: 'Maria da Silva',
    status: 'active' as const,
    dependents: [
      { id: '1', clientId: 'c1', fullName: 'João da Silva', documentType: 'cpf' as const, documentNumber: '***.***.***-01' },
      { id: '2', clientId: 'c1', fullName: 'Ana da Silva', documentType: 'cpf' as const, documentNumber: '***.***.***-02' },
    ],
  }

  const fixturePending = {
    holderName: 'Carlos Souza',
    status: 'pending' as const,
    dependents: [],
  }

  const fixtureInactive = {
    holderName: 'Beatriz Lima',
    status: 'inactive' as const,
    dependents: [],
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Preview — Bombinhas+ Econômica</h1>
          <p className="text-gray-500 mt-2">
            Rota temporária para screenshot de componentes DB-dependentes. Locale: <code className="bg-gray-100 px-1 rounded">{locale}</code>
          </p>
        </header>

        {/* Digital Card — variantes */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">DigitalCard — variantes de status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">Ativo (com dependentes)</p>
              <DigitalCard {...fixtureActive} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">Pendente</p>
              <DigitalCard {...fixturePending} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2 text-center">Inativo</p>
              <DigitalCard {...fixtureInactive} />
            </div>
          </div>
        </section>

        {/* Badge primitives */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Badge — todos os estados</h2>
          <div className="flex flex-wrap gap-4">
            <Badge status="active" />
            <Badge status="pending" />
            <Badge status="inactive" />
          </div>
        </section>

        {/* Button primitives */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Button — variantes</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        {/* Card primitive */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Card — primitivo</h2>
          <Card className="max-w-sm">
            <p className="font-semibold text-gray-800">Título do Card</p>
            <p className="text-sm text-gray-500 mt-1">Conteúdo de exemplo para visualização do primitivo.</p>
          </Card>
        </section>

        {/* Input primitives */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Input — variantes</h2>
          <div className="max-w-sm space-y-4">
            <Input id="preview-name" label="Nome completo" placeholder="Maria da Silva" />
            <Input id="preview-cpf" label="CPF" placeholder="000.000.000-00" />
            <Input id="preview-error" label="E-mail" placeholder="contato@example.com" error="E-mail inválido" />
          </div>
        </section>
      </div>
    </main>
  )
}
