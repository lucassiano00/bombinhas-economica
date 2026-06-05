import { cn } from '@/lib/utils'

type Status = 'active' | 'inactive' | 'pending'

const LABELS: Record<Status, string> = {
  active: 'ATIVO',
  inactive: 'INATIVO',
  pending: 'PENDENTE',
}

const STYLES: Record<Status, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const DOT_STYLES: Record<Status, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  pending: 'bg-yellow-500',
}

export function Badge({ status }: { status: Status }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border', STYLES[status])}>
      <span className={cn('w-2 h-2 rounded-full', DOT_STYLES[status])} />
      {LABELS[status]}
    </span>
  )
}
