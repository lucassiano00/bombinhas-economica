import { Badge } from '@/components/ui/badge'

type Dependent = {
  id: string
  clientId: string
  fullName: string
  documentType: 'rg' | 'dni'
  documentNumber: string
}

interface DigitalCardProps {
  holderName: string
  status: 'active' | 'inactive' | 'pending'
  dependents: Dependent[]
}

export function DigitalCard({ holderName, status, dependents }: DigitalCardProps) {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Economize SC</h1>
        <p className="text-sm text-gray-500">Cartão de Descontos</p>
      </div>
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Titular</p>
        <p className="text-lg font-semibold text-gray-800">{holderName}</p>
      </div>
      <div className="mb-4">
        <Badge status={status} />
      </div>
      {dependents.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dependentes</p>
          <ul className="space-y-1">
            {dependents.map((d) => (
              <li key={d.id} className="text-sm text-gray-700">{d.fullName}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-center text-gray-400 mt-6 pt-4 border-t border-gray-100">
        Apresente este cartão ao estabelecimento parceiro
      </p>
    </div>
  )
}
