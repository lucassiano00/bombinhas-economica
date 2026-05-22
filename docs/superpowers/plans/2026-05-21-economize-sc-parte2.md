# Economize SC — Implementação Parte 2: Admin + Parceiro

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Pré-requisito:** Parte 1 completa e todos os 40 testes passando.

**Goal:** Painel admin completo (cadastros, parceiros, relatórios + CSV) e painel de parceiros (histórico, confirmar desconto, perfil).

**Architecture:** Server Actions para todas as mutações. Layouts com sidebar para admin e parceiro. Proteção por role em cada layout + validação server-side em cada action.

**Tech Stack:** Mesmo da Parte 1. Sem novas dependências.

---

## Task 11: Server Actions Admin — Clientes

**Files:**
- Create: `lib/actions/admin-clients.ts`
- Test: `tests/actions/admin-clients.test.ts`

- [ ] **Step 1: Escrever testes**

```typescript
// tests/actions/admin-clients.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({ auth: mockAuth }))

const mockUpdate = vi.fn(() => ({
  set: vi.fn(() => ({
    where: vi.fn(() => ({
      returning: vi.fn().mockResolvedValue([{
        id: 'client-id',
        userId: 'user-id',
        fullName: 'João Silva',
        status: 'active',
      }]),
    })),
  })),
}))

const mockSelect = vi.fn(() => ({
  from: vi.fn(() => ({
    where: vi.fn(() => ({
      limit: vi.fn().mockResolvedValue([{ email: 'joao@test.com' }]),
    })),
    innerJoin: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([]),
    })),
  })),
}))

vi.mock('@/lib/db', () => ({
  db: { update: mockUpdate, select: mockSelect },
}))

vi.mock('@/lib/email', () => ({
  sendCardActivated: vi.fn().mockResolvedValue(undefined),
}))

import { activateClient, deactivateClient } from '@/lib/actions/admin-clients'
import { sendCardActivated } from '@/lib/email'

describe('activateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { role: 'admin', id: 'admin-id' } })
  })

  it('throws Unauthorized when not admin', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'client' } })
    await expect(activateClient('client-id')).rejects.toThrow('Unauthorized')
  })

  it('updates client status to active', async () => {
    await activateClient('client-id')
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('sends activation email', async () => {
    await activateClient('client-id')
    expect(sendCardActivated).toHaveBeenCalledWith({
      to: 'joao@test.com',
      name: 'João Silva',
    })
  })

  it('returns success true', async () => {
    const result = await activateClient('client-id')
    expect(result.success).toBe(true)
  })
})

describe('deactivateClient', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { role: 'admin' } })
  })

  it('throws Unauthorized when not admin', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'client' } })
    await expect(deactivateClient('client-id')).rejects.toThrow('Unauthorized')
  })

  it('returns success true', async () => {
    mockUpdate.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })
    const result = await deactivateClient('client-id')
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/actions/admin-clients.test.ts
```

Expected: FAIL

- [ ] **Step 3: Criar lib/actions/admin-clients.ts**

```typescript
// lib/actions/admin-clients.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients, users, dependents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sendCardActivated } from '@/lib/email'

export async function activateClient(clientId: string): Promise<{ success: boolean }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const [client] = await db
    .update(clients)
    .set({ status: 'active' })
    .where(eq(clients.id, clientId))
    .returning()

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, client.userId))
    .limit(1)

  await sendCardActivated({ to: user.email, name: client.fullName })

  return { success: true }
}

export async function deactivateClient(clientId: string): Promise<{ success: boolean }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db.update(clients).set({ status: 'inactive' }).where(eq(clients.id, clientId))

  return { success: true }
}

export async function getClientsWithDependents(statusFilter?: 'pending' | 'active' | 'inactive') {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const query = db
    .select({
      id: clients.id,
      fullName: clients.fullName,
      documentType: clients.documentType,
      documentNumber: clients.documentNumber,
      paymentMethod: clients.paymentMethod,
      status: clients.status,
      createdAt: clients.createdAt,
      email: users.email,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))

  if (statusFilter) {
    return query.where(eq(clients.status, statusFilter))
  }
  return query
}

export async function getClientDetail(clientId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const [client] = await db
    .select({
      id: clients.id,
      fullName: clients.fullName,
      documentType: clients.documentType,
      documentNumber: clients.documentNumber,
      paymentMethod: clients.paymentMethod,
      status: clients.status,
      createdAt: clients.createdAt,
      email: users.email,
    })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.id, clientId))
    .limit(1)

  if (!client) return null

  const clientDependents = await db
    .select()
    .from(dependents)
    .where(eq(dependents.clientId, clientId))

  return { ...client, dependents: clientDependents }
}
```

- [ ] **Step 4: Rodar testes**

```bash
npm run test:run tests/actions/admin-clients.test.ts
```

Expected: `✓ tests/actions/admin-clients.test.ts (6 tests passed)`

- [ ] **Step 5: Commit**

```bash
git add lib/actions/admin-clients.ts tests/actions/admin-clients.test.ts
git commit -m "feat: add admin client management actions (activate, deactivate, list)"
```

---

## Task 12: Server Actions Admin — Parceiros + Relatórios

**Files:**
- Create: `lib/actions/admin-partners.ts`
- Create: `lib/actions/admin-reports.ts`
- Test: `tests/actions/admin-reports.test.ts`

- [ ] **Step 1: Escrever teste de relatórios**

```typescript
// tests/actions/admin-reports.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { role: 'admin' } }),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ count: 42 }]),
        innerJoin: vi.fn(() => ({
          groupBy: vi.fn().mockResolvedValue([
            { partnerName: 'Mercado X', city: 'Itapema', usageCount: 15 },
          ]),
        })),
      })),
    })),
  },
}))

import { exportClientsCsv } from '@/lib/actions/admin-reports'

// Testa a função pura de geração de CSV
import { buildCsv } from '@/lib/actions/admin-reports'

describe('buildCsv', () => {
  it('generates header row', () => {
    const csv = buildCsv([])
    expect(csv).toContain('Nome,Tipo Documento,Documento,Pagamento,Status,Cadastrado em')
  })

  it('generates a row per client', () => {
    const csv = buildCsv([
      {
        fullName: 'João Silva',
        documentType: 'rg',
        documentNumber: '12345',
        paymentMethod: 'pix',
        status: 'active',
        createdAt: new Date('2026-01-15'),
      },
    ])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(2) // header + 1 row
    expect(lines[1]).toContain('João Silva')
    expect(lines[1]).toContain('12345')
  })

  it('returns only header for empty data', () => {
    const csv = buildCsv([])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/actions/admin-reports.test.ts
```

Expected: FAIL

- [ ] **Step 3: Criar lib/actions/admin-reports.ts**

```typescript
// lib/actions/admin-reports.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients, discountUsages, partners } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

type ClientRow = {
  fullName: string
  documentType: string
  documentNumber: string
  paymentMethod: string
  status: string
  createdAt: Date
}

export function buildCsv(rows: ClientRow[]): string {
  const header = 'Nome,Tipo Documento,Documento,Pagamento,Status,Cadastrado em'
  const lines = rows.map((r) =>
    [r.fullName, r.documentType, r.documentNumber, r.paymentMethod, r.status, r.createdAt.toISOString()].join(',')
  )
  return [header, ...lines].join('\n')
}

export async function getReportStats() {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const [totalSales] = await db.select({ count: count() }).from(clients)
  const [activeCards] = await db.select({ count: count() }).from(clients).where(eq(clients.status, 'active'))
  const [pendingCards] = await db.select({ count: count() }).from(clients).where(eq(clients.status, 'pending'))

  const usageByPartner = await db
    .select({
      partnerName: partners.name,
      city: partners.city,
      usageCount: count(discountUsages.id),
    })
    .from(discountUsages)
    .innerJoin(partners, eq(discountUsages.partnerId, partners.id))
    .groupBy(partners.id, partners.name, partners.city)

  return {
    totalSales: Number(totalSales.count),
    activeCards: Number(activeCards.count),
    pendingCards: Number(pendingCards.count),
    usageByPartner,
  }
}

export async function exportClientsCsv(): Promise<string> {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const rows = await db
    .select({
      fullName: clients.fullName,
      documentType: clients.documentType,
      documentNumber: clients.documentNumber,
      paymentMethod: clients.paymentMethod,
      status: clients.status,
      createdAt: clients.createdAt,
    })
    .from(clients)

  return buildCsv(rows)
}
```

- [ ] **Step 4: Criar lib/actions/admin-partners.ts**

```typescript
// lib/actions/admin-partners.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { partners, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function createPartner(input: {
  name: string
  category: string
  city: string
  address?: string
  discountInfo?: string
  email: string
  password: string
}): Promise<{ success: boolean; partnerId: string }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const passwordHash = await bcrypt.hash(input.password, 12)

  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash, role: 'partner' })
    .returning()

  const [partner] = await db
    .insert(partners)
    .values({
      userId: user.id,
      name: input.name,
      category: input.category,
      city: input.city,
      address: input.address,
      discountInfo: input.discountInfo,
    })
    .returning()

  return { success: true, partnerId: partner.id }
}

export async function updatePartner(
  partnerId: string,
  input: { name?: string; category?: string; city?: string; address?: string; discountInfo?: string }
): Promise<{ success: boolean }> {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  await db.update(partners).set(input).where(eq(partners.id, partnerId))

  return { success: true }
}

export async function getPartners() {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  return db
    .select({
      id: partners.id,
      name: partners.name,
      category: partners.category,
      city: partners.city,
      address: partners.address,
      discountInfo: partners.discountInfo,
      email: users.email,
      createdAt: partners.createdAt,
    })
    .from(partners)
    .innerJoin(users, eq(partners.userId, users.id))
}

export async function getPartnerById(partnerId: string) {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized')

  const [partner] = await db
    .select({
      id: partners.id,
      name: partners.name,
      category: partners.category,
      city: partners.city,
      address: partners.address,
      discountInfo: partners.discountInfo,
      email: users.email,
    })
    .from(partners)
    .innerJoin(users, eq(partners.userId, users.id))
    .where(eq(partners.id, partnerId))
    .limit(1)

  return partner ?? null
}
```

- [ ] **Step 5: Rodar testes**

```bash
npm run test:run tests/actions/admin-reports.test.ts
```

Expected: `✓ tests/actions/admin-reports.test.ts (3 tests passed)`

- [ ] **Step 6: Commit**

```bash
git add lib/actions/admin-partners.ts lib/actions/admin-reports.ts tests/actions/admin-reports.test.ts
git commit -m "feat: add admin partner management and reports actions"
```

---

## Task 13: Painel Admin — Páginas e Componentes

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/dashboard/page.tsx`
- Create: `app/(admin)/cadastros/page.tsx`
- Create: `app/(admin)/cadastros/[id]/page.tsx`
- Create: `app/(admin)/parceiros/page.tsx`
- Create: `app/(admin)/parceiros/novo/page.tsx`
- Create: `app/(admin)/parceiros/[id]/page.tsx`
- Create: `app/(admin)/relatorios/page.tsx`
- Create: `components/admin/registration-table.tsx`
- Create: `components/admin/partner-table.tsx`

- [ ] **Step 1: Criar app/(admin)/layout.tsx**

```typescript
// app/(admin)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/auth/login')

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/auth/login' })
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <p className="font-bold text-gray-800">Economize SC</p>
          <p className="text-xs text-gray-500">Painel Admin</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/admin/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
          <Link href="/admin/cadastros" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Cadastros</Link>
          <Link href="/admin/parceiros" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Parceiros</Link>
          <Link href="/admin/relatorios" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Relatórios</Link>
        </nav>
        <div className="p-4 border-t">
          <form action={handleSignOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Criar app/(admin)/dashboard/page.tsx**

```typescript
// app/(admin)/dashboard/page.tsx
import { getReportStats } from '@/lib/actions/admin-reports'
import { Card } from '@/components/ui/card'

export default async function AdminDashboardPage() {
  const stats = await getReportStats()
  const totalUsage = stats.usageByPartner.reduce((sum, p) => sum + Number(p.usageCount), 0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total de Vendas</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalSales}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Cartões Ativos</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeCards}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Aguardando Ativação</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingCards}</p>
        </Card>
      </div>
      {stats.usageByPartner.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uso por Parceiro</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Estabelecimento</th>
                <th className="pb-2">Cidade</th>
                <th className="pb-2 text-right">Usos</th>
              </tr>
            </thead>
            <tbody>
              {stats.usageByPartner.map((p) => (
                <tr key={p.partnerName} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800">{p.partnerName}</td>
                  <td className="py-2 text-gray-600">{p.city}</td>
                  <td className="py-2 text-right font-medium text-gray-800">{String(p.usageCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Criar components/admin/registration-table.tsx**

```typescript
// components/admin/registration-table.tsx
'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type ClientRow = {
  id: string
  fullName: string
  email: string
  documentType: string
  documentNumber: string
  paymentMethod: string
  status: 'pending' | 'active' | 'inactive'
  createdAt: Date
}

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
]

export function RegistrationTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('status') || 'all'

  function setFilter(status: string) {
    router.push(status === 'all' ? '/admin/cadastros' : `/admin/cadastros?status=${status}`)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentFilter === f.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Documento</th>
              <th className="px-4 py-3 text-left">Pagamento</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum cadastro encontrado.</td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-800">{c.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.documentType.toUpperCase()}: {c.documentNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.paymentMethod === 'pix' ? 'PIX' : 'Western Union'}</td>
                <td className="px-4 py-3"><Badge status={c.status} /></td>
                <td className="px-4 py-3">
                  <Link href={`/admin/cadastros/${c.id}`} className="text-sm text-blue-600 hover:underline">
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar app/(admin)/cadastros/page.tsx**

```typescript
// app/(admin)/cadastros/page.tsx
import { getClientsWithDependents } from '@/lib/actions/admin-clients'
import { RegistrationTable } from '@/components/admin/registration-table'

export default async function AdminCadastrosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: 'pending' | 'active' | 'inactive' }>
}) {
  const params = await searchParams
  const clientsList = await getClientsWithDependents(params.status)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Cadastros</h1>
      <RegistrationTable clients={clientsList} />
    </div>
  )
}
```

- [ ] **Step 5: Criar app/(admin)/cadastros/[id]/page.tsx**

```typescript
// app/(admin)/cadastros/[id]/page.tsx
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getClientDetail, activateClient, deactivateClient } from '@/lib/actions/admin-clients'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default async function AdminCadastroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClientDetail(id)
  if (!client) redirect('/admin/cadastros')

  async function handleActivate(formData: FormData) {
    'use server'
    await activateClient(id)
    revalidatePath(`/admin/cadastros/${id}`)
  }

  async function handleDeactivate(formData: FormData) {
    'use server'
    await deactivateClient(id)
    revalidatePath(`/admin/cadastros/${id}`)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/cadastros" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-800">Detalhe do Cadastro</h1>
      </div>
      <Card className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 uppercase">Nome</p>
            <p className="font-semibold text-gray-800">{client.fullName}</p>
          </div>
          <Badge status={client.status} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">E-mail</p>
          <p className="text-gray-700">{client.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Documento</p>
          <p className="text-gray-700">{client.documentType.toUpperCase()}: {client.documentNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Forma de Pagamento</p>
          <p className="text-gray-700">{client.paymentMethod === 'pix' ? 'PIX' : 'Western Union'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Cadastrado em</p>
          <p className="text-gray-700">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        {client.dependents.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Dependentes</p>
            <ul className="space-y-1">
              {client.dependents.map((d) => (
                <li key={d.id} className="text-sm text-gray-700">
                  {d.fullName} — {d.documentType.toUpperCase()}: {d.documentNumber}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          {client.status !== 'active' && (
            <form action={handleActivate}>
              <Button type="submit">Ativar cartão</Button>
            </form>
          )}
          {client.status === 'active' && (
            <form action={handleDeactivate}>
              <Button type="submit" variant="danger">Desativar cartão</Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Criar components/admin/partner-table.tsx**

```typescript
// components/admin/partner-table.tsx
import Link from 'next/link'

type PartnerRow = {
  id: string
  name: string
  category: string
  city: string
  email: string
  discountInfo: string | null
}

export function PartnerTable({ partners }: { partners: PartnerRow[] }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">Categoria</th>
            <th className="px-4 py-3 text-left">Cidade</th>
            <th className="px-4 py-3 text-left">E-mail</th>
            <th className="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {partners.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum parceiro cadastrado.</td>
            </tr>
          )}
          {partners.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800">{p.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.city}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.email}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/parceiros/${p.id}`} className="text-sm text-blue-600 hover:underline">Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 7: Criar app/(admin)/parceiros/page.tsx**

```typescript
// app/(admin)/parceiros/page.tsx
import { getPartners } from '@/lib/actions/admin-partners'
import { PartnerTable } from '@/components/admin/partner-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminParceirosPage() {
  const partnersList = await getPartners()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parceiros</h1>
        <Link href="/admin/parceiros/novo">
          <Button>+ Novo Parceiro</Button>
        </Link>
      </div>
      <PartnerTable partners={partnersList} />
    </div>
  )
}
```

- [ ] **Step 8: Criar app/(admin)/parceiros/novo/page.tsx**

```typescript
// app/(admin)/parceiros/novo/page.tsx
import { redirect } from 'next/navigation'
import { createPartner } from '@/lib/actions/admin-partners'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

const CITIES = ['Bombinhas', 'Itapema', 'Meia Praia', 'Balneário Camboriú']
const CATEGORIES = ['Mercado', 'Combustível', 'Farmácia', 'Artigos de praia', 'Bar/Pub', 'Pizzaria', 'Sorveteria', 'Restaurante', 'Açougue', 'Padaria', 'Parque', 'Outros']

export default function AdminNovoParceiro() {
  async function handleCreate(formData: FormData) {
    'use server'
    await createPartner({
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      city: formData.get('city') as string,
      address: formData.get('address') as string || undefined,
      discountInfo: formData.get('discountInfo') as string || undefined,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    redirect('/admin/parceiros')
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/parceiros" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-800">Novo Parceiro</h1>
      </div>
      <Card>
        <form action={handleCreate} className="space-y-4">
          <Input id="name" name="name" label="Nome do estabelecimento" required />
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Categoria</label>
            <select id="category" name="category" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</label>
            <select id="city" name="city" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input id="address" name="address" label="Endereço (opcional)" />
          <div className="flex flex-col gap-1">
            <label htmlFor="discountInfo" className="text-sm font-medium text-gray-700">Descrição do desconto (opcional)</label>
            <textarea id="discountInfo" name="discountInfo" rows={2} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <hr className="border-gray-200" />
          <p className="text-sm font-medium text-gray-700">Acesso ao painel do parceiro</p>
          <Input id="email" name="email" type="email" label="E-mail de login" required />
          <Input id="password" name="password" type="password" label="Senha inicial" required minLength={8} />
          <Button type="submit" className="w-full">Criar parceiro</Button>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 9: Criar app/(admin)/parceiros/[id]/page.tsx**

```typescript
// app/(admin)/parceiros/[id]/page.tsx
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPartnerById, updatePartner } from '@/lib/actions/admin-partners'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

const CITIES = ['Bombinhas', 'Itapema', 'Meia Praia', 'Balneário Camboriú']
const CATEGORIES = ['Mercado', 'Combustível', 'Farmácia', 'Artigos de praia', 'Bar/Pub', 'Pizzaria', 'Sorveteria', 'Restaurante', 'Açougue', 'Padaria', 'Parque', 'Outros']

export default async function AdminEditarParceiro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await getPartnerById(id)
  if (!partner) redirect('/admin/parceiros')

  async function handleUpdate(formData: FormData) {
    'use server'
    await updatePartner(id, {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      city: formData.get('city') as string,
      address: formData.get('address') as string || undefined,
      discountInfo: formData.get('discountInfo') as string || undefined,
    })
    revalidatePath('/admin/parceiros')
    redirect('/admin/parceiros')
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/parceiros" className="text-sm text-gray-500 hover:text-gray-700">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Parceiro</h1>
      </div>
      <Card>
        <form action={handleUpdate} className="space-y-4">
          <Input id="name" name="name" label="Nome do estabelecimento" defaultValue={partner.name} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Categoria</label>
            <select id="category" name="category" defaultValue={partner.category} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">Cidade</label>
            <select id="city" name="city" defaultValue={partner.city} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input id="address" name="address" label="Endereço (opcional)" defaultValue={partner.address ?? ''} />
          <div className="flex flex-col gap-1">
            <label htmlFor="discountInfo" className="text-sm font-medium text-gray-700">Descrição do desconto</label>
            <textarea id="discountInfo" name="discountInfo" rows={2} defaultValue={partner.discountInfo ?? ''} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <Button type="submit" className="w-full">Salvar alterações</Button>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 10: Criar app/(admin)/relatorios/page.tsx**

```typescript
// app/(admin)/relatorios/page.tsx
import { getReportStats, exportClientsCsv } from '@/lib/actions/admin-reports'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminRelatoriosPage() {
  const stats = await getReportStats()

  async function handleExport(formData: FormData) {
    'use server'
    const csv = await exportClientsCsv()
    // O CSV é retornado — o download é disparado via Response no route handler abaixo
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <a
          href="/api/admin/export-csv"
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
        >
          Exportar CSV
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total de Vendas</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalSales}</p>
          <p className="text-xs text-gray-400 mt-1">× R$ 49,90 = R$ {(stats.totalSales * 49.90).toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Cartões Ativos</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeCards}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Aguardando Ativação</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingCards}</p>
        </Card>
      </div>
      {stats.usageByPartner.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Descontos por Parceiro</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Estabelecimento</th>
                <th className="pb-2">Cidade</th>
                <th className="pb-2 text-right">Total de Usos</th>
              </tr>
            </thead>
            <tbody>
              {stats.usageByPartner.map((p) => (
                <tr key={p.partnerName} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800">{p.partnerName}</td>
                  <td className="py-2 text-gray-600">{p.city}</td>
                  <td className="py-2 text-right font-medium">{String(p.usageCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 11: Criar app/api/admin/export-csv/route.ts**

```typescript
// app/api/admin/export-csv/route.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { exportClientsCsv } from '@/lib/actions/admin-reports'

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const csv = await exportClientsCsv()
  const date = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="economize-sc-${date}.csv"`,
    },
  })
}
```

- [ ] **Step 12: Testar painel admin no browser**

```bash
npm run dev
# Login como admin@economizesc.com.br / admin123
# Verificar: /admin/dashboard, /admin/cadastros, /admin/parceiros, /admin/relatorios
# Criar um parceiro de teste
# Exportar CSV (deve fazer download do arquivo)
```

- [ ] **Step 13: Commit**

```bash
git add app/\(admin\)/ components/admin/ app/api/admin/ tests/actions/admin-clients.test.ts
git commit -m "feat: add admin panel (dashboard, registrations, partners, reports)"
```

---

## Task 14: Server Actions Parceiro + Painel

**Files:**
- Create: `lib/actions/partner-usage.ts`
- Create: `app/(parceiro)/layout.tsx`
- Create: `app/(parceiro)/historico/page.tsx`
- Create: `app/(parceiro)/confirmar/page.tsx`
- Create: `app/(parceiro)/perfil/page.tsx`
- Create: `components/partner/usage-history.tsx`
- Create: `components/partner/confirm-discount-form.tsx`
- Test: `tests/actions/partner-usage.test.ts`

- [ ] **Step 1: Escrever teste**

```typescript
// tests/actions/partner-usage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { role: 'partner', id: 'user-partner-id' },
  }),
}))

const mockInsert = vi.fn(() => ({
  values: vi.fn().mockResolvedValue([]),
}))

// Tracks select call count for routing between titular/dependent lookups
let selectCallCount = 0
const mockSelect = vi.fn(() => ({
  from: vi.fn(() => ({
    innerJoin: vi.fn(() => ({
      where: vi.fn().mockResolvedValue([{ id: 'partner-id' }]),
    })),
    where: vi.fn(() => ({
      limit: vi.fn().mockImplementation(() => {
        selectCallCount++
        if (selectCallCount === 2) return Promise.resolve([{ id: 'client-id', status: 'active' }])
        return Promise.resolve([])
      }),
    })),
  })),
}))

vi.mock('@/lib/db', () => ({
  db: { select: mockSelect, insert: mockInsert },
}))

// Test the pure logic functions
import { buildStatusResult } from '@/lib/actions/partner-usage'

describe('buildStatusResult', () => {
  it('returns error when client not found', () => {
    expect(buildStatusResult(null, null)).toEqual({ success: false, error: 'Documento não encontrado' })
  })

  it('returns error when client is inactive', () => {
    expect(buildStatusResult({ id: 'c1', status: 'inactive' }, null)).toEqual({
      success: false,
      error: 'Cartão não está ativo',
    })
  })

  it('returns success when client is active', () => {
    expect(buildStatusResult({ id: 'c1', status: 'active' }, null)).toEqual({
      success: true,
      clientId: 'c1',
    })
  })

  it('returns error when parent client is pending', () => {
    expect(buildStatusResult(null, { id: 'c2', status: 'pending' })).toEqual({
      success: false,
      error: 'Cartão não está ativo',
    })
  })

  it('returns success when parent client is active', () => {
    expect(buildStatusResult(null, { id: 'c2', status: 'active' })).toEqual({
      success: true,
      clientId: 'c2',
    })
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/actions/partner-usage.test.ts
```

Expected: FAIL

- [ ] **Step 3: Criar lib/actions/partner-usage.ts**

```typescript
// lib/actions/partner-usage.ts
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { discountUsages, clients, dependents, partners, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type StatusResult =
  | { success: true; clientId: string }
  | { success: false; error: string }

export function buildStatusResult(
  client: { id: string; status: string } | null,
  parentClient: { id: string; status: string } | null
): StatusResult {
  const resolved = client ?? parentClient
  if (!resolved) return { success: false, error: 'Documento não encontrado' }
  if (resolved.status !== 'active') return { success: false, error: 'Cartão não está ativo' }
  return { success: true, clientId: resolved.id }
}

async function findPartnerByUserId(userId: string) {
  const [partner] = await db
    .select({ id: partners.id })
    .from(partners)
    .innerJoin(users, eq(partners.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1)
  return partner ?? null
}

async function findClientByDocument(documentNumber: string) {
  const [client] = await db
    .select({ id: clients.id, status: clients.status })
    .from(clients)
    .where(eq(clients.documentNumber, documentNumber))
    .limit(1)
  return client ?? null
}

async function findParentClientByDependent(documentNumber: string) {
  const [dep] = await db
    .select({ clientId: dependents.clientId })
    .from(dependents)
    .where(eq(dependents.documentNumber, documentNumber))
    .limit(1)

  if (!dep) return null

  const [parent] = await db
    .select({ id: clients.id, status: clients.status })
    .from(clients)
    .where(eq(clients.id, dep.clientId))
    .limit(1)

  return parent ?? null
}

export async function recordDiscountUsage(
  documentNumber: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (session?.user?.role !== 'partner') throw new Error('Unauthorized')

  const partner = await findPartnerByUserId(session.user.id)
  if (!partner) throw new Error('Partner not found')

  const client = await findClientByDocument(documentNumber)
  const parentClient = client ? null : await findParentClientByDependent(documentNumber)

  const result = buildStatusResult(client, parentClient)
  if (!result.success) return result

  await db.insert(discountUsages).values({
    clientId: result.clientId,
    partnerId: partner.id,
    notes,
  })

  return { success: true }
}

export async function getPartnerUsageHistory() {
  const session = await auth()
  if (session?.user?.role !== 'partner') throw new Error('Unauthorized')

  const partner = await findPartnerByUserId(session.user.id)
  if (!partner) return []

  return db
    .select({
      id: discountUsages.id,
      clientName: clients.fullName,
      documentNumber: clients.documentNumber,
      appliedAt: discountUsages.appliedAt,
      notes: discountUsages.notes,
    })
    .from(discountUsages)
    .innerJoin(clients, eq(discountUsages.clientId, clients.id))
    .where(eq(discountUsages.partnerId, partner.id))
}

export async function getPartnerProfile() {
  const session = await auth()
  if (session?.user?.role !== 'partner') throw new Error('Unauthorized')

  const [profile] = await db
    .select({
      id: partners.id,
      name: partners.name,
      category: partners.category,
      city: partners.city,
      address: partners.address,
      discountInfo: partners.discountInfo,
      email: users.email,
    })
    .from(partners)
    .innerJoin(users, eq(partners.userId, users.id))
    .where(eq(users.id, session.user.id))
    .limit(1)

  return profile ?? null
}
```

- [ ] **Step 4: Criar app/(parceiro)/layout.tsx**

```typescript
// app/(parceiro)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default async function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'partner') redirect('/auth/login')

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/auth/login' })
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <p className="font-bold text-gray-800">Economize SC</p>
          <p className="text-xs text-gray-500">Painel Parceiro</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/parceiro/historico" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Histórico</Link>
          <Link href="/parceiro/confirmar" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Confirmar Desconto</Link>
          <Link href="/parceiro/perfil" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Perfil</Link>
        </nav>
        <div className="p-4 border-t">
          <form action={handleSignOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
```

- [ ] **Step 5: Criar components/partner/usage-history.tsx**

```typescript
// components/partner/usage-history.tsx
type UsageRow = {
  id: string
  clientName: string
  documentNumber: string
  appliedAt: Date
  notes: string | null
}

export function UsageHistory({ usages }: { usages: UsageRow[] }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Documento</th>
            <th className="px-4 py-3 text-left">Data</th>
            <th className="px-4 py-3 text-left">Observações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {usages.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum desconto registrado ainda.</td>
            </tr>
          )}
          {usages.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800">{u.clientName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{u.documentNumber}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{new Date(u.appliedAt).toLocaleString('pt-BR')}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{u.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 6: Criar components/partner/confirm-discount-form.tsx**

```typescript
// components/partner/confirm-discount-form.tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { recordDiscountUsage } from '@/lib/actions/partner-usage'

export function ConfirmDiscountForm() {
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    const form = new FormData(e.currentTarget)
    const res = await recordDiscountUsage(
      form.get('document') as string,
      form.get('notes') as string || undefined
    )
    setResult(res)
    setLoading(false)
    if (res.success) (e.target as HTMLFormElement).reset()
  }

  return (
    <div className="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input id="document" name="document" label="RG ou DNI do cliente" placeholder="Digite o documento" required />
        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-gray-700">Observações (opcional)</label>
          <textarea id="notes" name="notes" rows={2} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Registrando...' : 'Confirmar desconto'}
        </Button>
      </form>
      {result && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success ? 'Desconto registrado com sucesso!' : result.error}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Criar páginas do painel parceiro**

```typescript
// app/(parceiro)/historico/page.tsx
import { getPartnerUsageHistory } from '@/lib/actions/partner-usage'
import { UsageHistory } from '@/components/partner/usage-history'

export default async function ParceiroHistoricoPage() {
  const usages = await getPartnerUsageHistory()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Descontos</h1>
      <UsageHistory usages={usages} />
    </div>
  )
}
```

```typescript
// app/(parceiro)/confirmar/page.tsx
import { ConfirmDiscountForm } from '@/components/partner/confirm-discount-form'

export default function ParceiroConfirmarPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Confirmar Desconto</h1>
      <p className="text-gray-600 mb-6">Digite o documento do cliente para registrar que um desconto foi aplicado.</p>
      <ConfirmDiscountForm />
    </div>
  )
}
```

```typescript
// app/(parceiro)/perfil/page.tsx
import { getPartnerProfile } from '@/lib/actions/partner-usage'
import { Card } from '@/components/ui/card'

export default async function ParceiroPerfilPage() {
  const profile = await getPartnerProfile()
  if (!profile) return <div className="p-8 text-gray-500">Perfil não encontrado.</div>

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
      <Card className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Estabelecimento</p>
          <p className="font-semibold text-gray-800">{profile.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Categoria</p>
          <p className="text-gray-700">{profile.category}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Cidade</p>
          <p className="text-gray-700">{profile.city}</p>
        </div>
        {profile.address && (
          <div>
            <p className="text-xs text-gray-500 uppercase">Endereço</p>
            <p className="text-gray-700">{profile.address}</p>
          </div>
        )}
        {profile.discountInfo && (
          <div>
            <p className="text-xs text-gray-500 uppercase">Desconto Oferecido</p>
            <p className="text-gray-700">{profile.discountInfo}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500 uppercase">E-mail</p>
          <p className="text-gray-700">{profile.email}</p>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 8: Rodar testes**

```bash
npm run test:run tests/actions/partner-usage.test.ts
```

Expected: `✓ tests/actions/partner-usage.test.ts (5 tests passed)`

- [ ] **Step 9: Testar painel parceiro no browser**

```bash
npm run dev
# Criar parceiro de teste pelo painel admin
# Login como parceiro
# Verificar: /parceiro/confirmar, /parceiro/historico, /parceiro/perfil
# Confirmar desconto para um cliente ativo — verificar que aparece no histórico
```

- [ ] **Step 10: Commit**

```bash
git add lib/actions/partner-usage.ts app/\(parceiro\)/ components/partner/ tests/actions/partner-usage.test.ts
git commit -m "feat: add partner panel (history, confirm discount, profile)"
```

---

## Verificação Final — Todos os Testes

- [ ] **Rodar suite completa**

```bash
npm run test:run
```

Expected output:
```
✓ tests/utils.test.ts (3 tests)
✓ tests/db/schema.test.ts (4 tests)
✓ tests/middleware.test.ts (6 tests)
✓ tests/components/badge.test.tsx (4 tests)
✓ tests/components/hero.test.tsx (4 tests)
✓ tests/components/digital-card.test.tsx (5 tests)
✓ tests/email/email.test.ts (4 tests)
✓ tests/actions/register.test.ts (4 tests)
✓ tests/actions/verify-status.test.ts (6 tests)
✓ tests/actions/admin-clients.test.ts (6 tests)
✓ tests/actions/admin-reports.test.ts (3 tests)
✓ tests/actions/partner-usage.test.ts (5 tests)

Test Files: 12 passed
Tests: 54 passed
```

- [ ] **Build de produção**

```bash
npm run build
```

Expected: build completa sem erros TypeScript.

---

## Deploy no Netlify

- [ ] **Criar repositório no GitHub e fazer push**

```bash
git remote add origin https://github.com/seu-usuario/economize-sc.git
git push -u origin master
```

- [ ] **No painel Netlify:**
1. "Add new site" → "Import an existing project" → selecionar repositório
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Adicionar todas as variáveis de ambiente do `.env.example` com valores reais

- [ ] **Rodar seed em produção**

```bash
DATABASE_URL=<url-producao> npm run db:seed
```

- [ ] **Verificar deploy**

Acessar a URL do Netlify e testar o fluxo completo:
1. Landing page carrega
2. Cadastro de cliente funciona
3. Login como admin funciona
4. Ativar um cliente funciona
5. Cliente vê cartão ativo
6. Parceiro confirma desconto
7. Exportação de CSV funciona
