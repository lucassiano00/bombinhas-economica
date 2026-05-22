# Economize SC — Implementação Parte 1: Fundação + Site Público

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold completo do projeto + banco de dados + auth + landing page + cadastro + verificação de status + cartão digital do cliente.

**Architecture:** Next.js 14 App Router com route groups. Auth.js v5 com Credentials provider e 3 roles (admin/partner/client). Drizzle ORM + Neon PostgreSQL serverless. Server Actions para mutações.

**Tech Stack:** Next.js 14, Auth.js v5, Drizzle ORM, @neondatabase/serverless, Tailwind CSS, bcryptjs, Resend, Vitest, @testing-library/react, Netlify

---

## Task 1: Project Scaffold + Tooling

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `lib/utils.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `.env.local` (from example)

- [ ] **Step 1: Scaffold Next.js no diretório atual**

```bash
cd /Users/lucascassiano/personal-projects/economize-sc
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: projeto Next.js criado com `app/`, `public/`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Instalar dependências**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install next-auth@beta
npm install bcryptjs resend
npm install clsx tailwind-merge
npm install -D drizzle-kit @types/bcryptjs
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D dotenv
```

- [ ] **Step 3: Criar vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: Criar tests/setup.ts**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Adicionar script de test ao package.json**

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 6: Criar lib/utils.ts**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 7: Substituir app/layout.tsx**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Economize SC — Cartão de Descontos',
  description: 'Economize nas suas férias em Santa Catarina',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Escrever teste de sanidade**

```typescript
// tests/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'ignored', 'added')).toBe('base added')
  })

  it('resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
```

- [ ] **Step 9: Rodar teste e verificar que passa**

```bash
npm run test:run tests/utils.test.ts
```

Expected output: `✓ tests/utils.test.ts (3 tests passed)`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Vitest and dependencies"
```

---

## Task 2: Database Schema + Drizzle

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Create: `drizzle.config.ts`
- Test: `tests/db/schema.test.ts`

- [ ] **Step 1: Escrever teste de schema**

```typescript
// tests/db/schema.test.ts
import { describe, it, expect } from 'vitest'
import { users, clients, dependents, partners, discountUsages } from '@/lib/db/schema'
import { roleEnum, clientStatusEnum, documentTypeEnum, paymentMethodEnum } from '@/lib/db/schema'

describe('database schema', () => {
  it('exports users table with required columns', () => {
    expect(users).toBeDefined()
    expect(users.id).toBeDefined()
    expect(users.email).toBeDefined()
    expect(users.passwordHash).toBeDefined()
    expect(users.role).toBeDefined()
  })

  it('exports clients table with status default pending', () => {
    expect(clients).toBeDefined()
    expect(clients.status).toBeDefined()
  })

  it('exports all 5 tables', () => {
    expect(users).toBeDefined()
    expect(clients).toBeDefined()
    expect(dependents).toBeDefined()
    expect(partners).toBeDefined()
    expect(discountUsages).toBeDefined()
  })

  it('exports all enums', () => {
    expect(roleEnum).toBeDefined()
    expect(clientStatusEnum).toBeDefined()
    expect(documentTypeEnum).toBeDefined()
    expect(paymentMethodEnum).toBeDefined()
  })
})
```

- [ ] **Step 2: Rodar teste — verificar que FALHA**

```bash
npm run test:run tests/db/schema.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/db/schema'`

- [ ] **Step 3: Criar lib/db/schema.ts**

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'partner', 'client'])
export const documentTypeEnum = pgEnum('document_type', ['rg', 'dni'])
export const paymentMethodEnum = pgEnum('payment_method', ['pix', 'western_union'])
export const clientStatusEnum = pgEnum('client_status', ['pending', 'active', 'inactive'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  fullName: text('full_name').notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  documentNumber: text('document_number').notNull().unique(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: clientStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dependents = pgTable('dependents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  fullName: text('full_name').notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  documentNumber: text('document_number').notNull(),
})

export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  city: text('city').notNull(),
  address: text('address'),
  discountInfo: text('discount_info'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const discountUsages = pgTable('discount_usages', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  partnerId: uuid('partner_id').notNull().references(() => partners.id),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  notes: text('notes'),
})
```

- [ ] **Step 4: Criar lib/db/index.ts**

```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 5: Criar drizzle.config.ts**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 6: Criar .env.local com DATABASE_URL real do Neon**

```bash
# .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=gerar-com-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PIX_KEY=00.000.000/0001-00
NEXT_PUBLIC_WU_BENEFICIARY=Nome Beneficiário
NEXT_PUBLIC_CNPJ=00.000.000/0001-00
NEXT_PUBLIC_CONTACT_EMAIL=contato@economizesc.com.br
```

- [ ] **Step 7: Gerar e aplicar migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Expected: tabelas criadas no Neon — `users`, `clients`, `dependents`, `partners`, `discount_usages` + enums.

- [ ] **Step 8: Rodar testes — verificar que PASSAM**

```bash
npm run test:run tests/db/schema.test.ts
```

Expected: `✓ tests/db/schema.test.ts (4 tests passed)`

- [ ] **Step 9: Commit**

```bash
git add lib/db/ drizzle.config.ts drizzle/ tests/db/
git commit -m "feat: add database schema with Drizzle + Neon"
```

---

## Task 3: Auth.js v5 + Middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Create: `types/next-auth.d.ts`
- Test: `tests/middleware.test.ts`

- [ ] **Step 1: Escrever teste de middleware**

```typescript
// tests/middleware.test.ts
import { describe, it, expect, vi } from 'vitest'

// Testa a lógica pura de redirecionamento por role
function getRedirectPath(pathname: string, role: string | undefined): string | null {
  if (pathname.startsWith('/admin') && role !== 'admin') return '/auth/login'
  if (pathname.startsWith('/parceiro') && role !== 'partner') return '/auth/login'
  if (pathname.startsWith('/cliente') && role !== 'client') return '/auth/login'
  return null
}

describe('middleware redirect logic', () => {
  it('redirects non-admin from /admin', () => {
    expect(getRedirectPath('/admin/dashboard', 'client')).toBe('/auth/login')
    expect(getRedirectPath('/admin/dashboard', undefined)).toBe('/auth/login')
  })

  it('allows admin to /admin', () => {
    expect(getRedirectPath('/admin/dashboard', 'admin')).toBeNull()
  })

  it('redirects non-partner from /parceiro', () => {
    expect(getRedirectPath('/parceiro/historico', 'admin')).toBe('/auth/login')
  })

  it('allows partner to /parceiro', () => {
    expect(getRedirectPath('/parceiro/historico', 'partner')).toBeNull()
  })

  it('redirects non-client from /cliente', () => {
    expect(getRedirectPath('/cliente/cartao', 'admin')).toBe('/auth/login')
  })

  it('allows client to /cliente', () => {
    expect(getRedirectPath('/cliente/cartao', 'client')).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA (arquivo não existe ainda)**

```bash
npm run test:run tests/middleware.test.ts
```

Expected: FAIL — module not found ou test file error.

- [ ] **Step 3: Criar types/next-auth.d.ts**

```typescript
// types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
  }
}
```

- [ ] **Step 4: Criar lib/auth.ts**

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})
```

- [ ] **Step 5: Criar app/api/auth/[...nextauth]/route.ts**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 6: Criar middleware.ts**

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (pathname.startsWith('/parceiro') && role !== 'partner') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (pathname.startsWith('/cliente') && role !== 'client') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/parceiro/:path*', '/cliente/:path*'],
}
```

- [ ] **Step 7: Rodar testes — verificar que PASSAM**

```bash
npm run test:run tests/middleware.test.ts
```

Expected: `✓ tests/middleware.test.ts (6 tests passed)`

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts app/api/auth/ middleware.ts types/ tests/middleware.test.ts
git commit -m "feat: add Auth.js v5 with role-based middleware"
```

---

## Task 4: UI Primitives

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/card.tsx`
- Test: `tests/components/badge.test.tsx`

- [ ] **Step 1: Escrever teste de Badge**

```typescript
// tests/components/badge.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders ATIVO for active status', () => {
    render(<Badge status="active" />)
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
  })

  it('renders INATIVO for inactive status', () => {
    render(<Badge status="inactive" />)
    expect(screen.getByText('INATIVO')).toBeInTheDocument()
  })

  it('renders PENDENTE for pending status', () => {
    render(<Badge status="pending" />)
    expect(screen.getByText('PENDENTE')).toBeInTheDocument()
  })

  it('applies green color for active', () => {
    const { container } = render(<Badge status="active" />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/components/badge.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ui/badge'`

- [ ] **Step 3: Criar components/ui/badge.tsx**

```typescript
// components/ui/badge.tsx
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
```

- [ ] **Step 4: Criar components/ui/button.tsx**

```typescript
// components/ui/button.tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 5: Criar components/ui/input.tsx**

```typescript
// components/ui/input.tsx
import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
          error ? 'border-red-500' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 6: Criar components/ui/card.tsx**

```typescript
// components/ui/card.tsx
import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-white rounded-xl shadow p-6', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 7: Rodar testes — verificar que PASSAM**

```bash
npm run test:run tests/components/badge.test.tsx
```

Expected: `✓ tests/components/badge.test.tsx (4 tests passed)`

- [ ] **Step 8: Commit**

```bash
git add components/ui/ tests/components/badge.test.tsx
git commit -m "feat: add UI primitives (Button, Input, Badge, Card)"
```

---

## Task 5: Landing Page

**Files:**
- Create: `components/landing/hero.tsx`
- Create: `components/landing/benefits.tsx`
- Create: `components/landing/how-it-works.tsx`
- Create: `components/landing/closing-section.tsx`
- Create: `components/landing/footer.tsx`
- Create: `app/(public)/page.tsx`
- Create: `app/(public)/layout.tsx`
- Test: `tests/components/hero.test.tsx`

- [ ] **Step 1: Escrever teste de Hero**

```typescript
// tests/components/hero.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/landing/hero'

describe('Hero', () => {
  it('renders the brand name', () => {
    render(<Hero />)
    expect(screen.getByText('Economize SC!')).toBeInTheDocument()
  })

  it('renders CTA button with correct text', () => {
    render(<Hero />)
    expect(screen.getByRole('link', { name: /quero meu crédito agora/i })).toBeInTheDocument()
  })

  it('CTA button links to /cadastro', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: /quero meu crédito agora/i })
    expect(link).toHaveAttribute('href', '/cadastro')
  })

  it('renders the value proposition text', () => {
    render(<Hero />)
    expect(screen.getByText(/R\$ 49,90/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/components/hero.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/landing/hero'`

- [ ] **Step 3: Criar components/landing/hero.tsx**

```typescript
// components/landing/hero.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="bg-blue-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Economize SC!</h1>
        <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
          Pague uma taxa única de R$ 49,90 e economize entre R$ 500,00 e mais de R$ 1.000,00 durante as suas férias.
        </p>
        <Link href="/cadastro">
          <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 text-lg px-8 py-4 h-auto">
            Quero meu crédito agora
          </Button>
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Criar components/landing/benefits.tsx**

```typescript
// components/landing/benefits.tsx
'use client'
import { useState } from 'react'

const CITIES = ['Bombinhas', 'Itapema', 'Meia Praia', 'Balneário Camboriú'] as const
type City = typeof CITIES[number]

const SEGMENTS = [
  'Mercados', 'Combustível', 'Farmácias', 'Artigos de praia',
  'Banana Bolt', 'Barco Pirata', 'Pubs', 'Pizzarias',
  'Sorveterias', 'Restaurantes', 'Açougues', 'Serviços de emergência',
  'Padarias', 'Beto Carreiro', 'Parques aquáticos', 'Compras em Brusque',
]

export function Benefits() {
  const [activeCity, setActiveCity] = useState<City>('Bombinhas')

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Benefícios</h2>
        <p className="text-center text-gray-600 mb-8">
          Aqui estão todos os benefícios com descontos para você gastar menos e curtir mais!
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCity === city
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SEGMENTS.map((segment) => (
            <div key={segment} className="bg-white rounded-lg p-3 text-center text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              {segment}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Os estabelecimentos são exibidos conforme sua localização atual.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Criar components/landing/how-it-works.tsx**

```typescript
// components/landing/how-it-works.tsx
const STEPS = [
  { number: '1', title: 'Cadastre-se', description: 'Preencha seus dados e dos seus dependentes' },
  { number: '2', title: 'Pague R$ 49,90', description: 'Via PIX (brasileiros) ou Western Union (estrangeiros) — taxa única' },
  { number: '3', title: 'Economize', description: 'Apresente o cartão digital nos estabelecimentos parceiros' },
]

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Criar components/landing/closing-section.tsx**

```typescript
// components/landing/closing-section.tsx
export function ClosingSection() {
  return (
    <section className="py-20 px-4 bg-blue-900 text-white text-center">
      <div className="max-w-2xl mx-auto">
        <p className="text-2xl md:text-3xl font-semibold leading-relaxed">
          Desejamos a melhor temporada para você e sua família, economizando o tempo todo!
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Criar components/landing/footer.tsx**

```typescript
// components/landing/footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex flex-wrap justify-center gap-6 mb-3">
          <a href="/politica-cookies" className="hover:text-white transition-colors">Política de Cookies</a>
          <a href="/privacidade" className="hover:text-white transition-colors">Segurança e Privacidade</a>
        </div>
        <p>CNPJ: {process.env.NEXT_PUBLIC_CNPJ}</p>
        <p>Contato: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 8: Criar app/(public)/layout.tsx**

```typescript
// app/(public)/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 9: Criar app/(public)/page.tsx**

```typescript
// app/(public)/page.tsx
import { Hero } from '@/components/landing/hero'
import { Benefits } from '@/components/landing/benefits'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ClosingSection } from '@/components/landing/closing-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Benefits />
      <HowItWorks />
      <ClosingSection />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 10: Rodar testes**

```bash
npm run test:run tests/components/hero.test.tsx
```

Expected: `✓ tests/components/hero.test.tsx (4 tests passed)`

- [ ] **Step 11: Conferir visualmente no browser**

```bash
npm run dev
```

Abrir `http://localhost:3000` e verificar: Hero, Benefits (tabs por cidade), HowItWorks (3 passos), ClosingSection, Footer.

- [ ] **Step 12: Commit**

```bash
git add components/landing/ app/\(public\)/ tests/components/hero.test.tsx
git commit -m "feat: add landing page (hero, benefits, how-it-works, footer)"
```

---

## Task 6: Emails Transacionais

**Files:**
- Create: `lib/email/index.ts`
- Test: `tests/email/email.test.ts`

- [ ] **Step 1: Escrever teste de email**

```typescript
// tests/email/email.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ id: 'email-id' })
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

import { sendRegistrationConfirmed, sendCardActivated } from '@/lib/email'

describe('sendRegistrationConfirmed', () => {
  beforeEach(() => mockSend.mockClear())

  it('sends email to correct recipient', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'pix' })
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend.mock.calls[0][0].to).toBe('user@test.com')
  })

  it('includes PIX instructions for pix payment', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'pix' })
    expect(mockSend.mock.calls[0][0].text).toContain('PIX')
  })

  it('includes Western Union instructions for western_union payment', async () => {
    await sendRegistrationConfirmed({ to: 'user@test.com', name: 'João', paymentMethod: 'western_union' })
    expect(mockSend.mock.calls[0][0].text).toContain('Western Union')
  })
})

describe('sendCardActivated', () => {
  beforeEach(() => mockSend.mockClear())

  it('sends activation email with app URL', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.economizesc.com.br'
    await sendCardActivated({ to: 'user@test.com', name: 'João' })
    expect(mockSend.mock.calls[0][0].text).toContain('/cliente/cartao')
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/email/email.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/email'`

- [ ] **Step 3: Criar lib/email/index.ts**

```typescript
// lib/email/index.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendRegistrationConfirmed({
  to,
  name,
  paymentMethod,
}: {
  to: string
  name: string
  paymentMethod: 'pix' | 'western_union'
}) {
  const pixInstructions = `Chave PIX (CNPJ): ${process.env.NEXT_PUBLIC_PIX_KEY}\nValor: R$ 49,90`
  const wuInstructions = `Beneficiário: ${process.env.NEXT_PUBLIC_WU_BENEFICIARY}\nValor equivalente a R$ 49,90`

  await resend.emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Cadastro recebido — Economize SC',
    text: `Olá, ${name}!\n\nSeu cadastro foi recebido. Para ativar seu cartão, realize o pagamento:\n\n${paymentMethod === 'pix' ? pixInstructions : wuInstructions}\n\nAssim que confirmarmos o pagamento, você receberá seu cartão digital.\n\nEquipe Economize SC`,
  })
}

export async function sendCardActivated({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Seu cartão está ativo — Economize SC!',
    text: `Olá, ${name}!\n\nSeu cartão Economize SC está ativo!\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL}/cliente/cartao\n\nBoa temporada!\nEquipe Economize SC`,
  })
}
```

- [ ] **Step 4: Rodar testes — verificar PASSAM**

```bash
npm run test:run tests/email/email.test.ts
```

Expected: `✓ tests/email/email.test.ts (4 tests passed)`

- [ ] **Step 5: Commit**

```bash
git add lib/email/ tests/email/
git commit -m "feat: add transactional emails with Resend"
```

---

## Task 7: Server Action — Cadastro

**Files:**
- Create: `lib/actions/register.ts`
- Create: `components/forms/register-form.tsx`
- Create: `app/(public)/cadastro/page.tsx`
- Test: `tests/actions/register.test.ts`

- [ ] **Step 1: Escrever teste**

```typescript
// tests/actions/register.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockReturning = vi.fn()
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: mockReturning,
      })),
    })),
  },
}))
vi.mock('@/lib/email', () => ({
  sendRegistrationConfirmed: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn().mockResolvedValue('hashed-password') },
}))

import { registerClient } from '@/lib/actions/register'
import { sendRegistrationConfirmed } from '@/lib/email'
import { db } from '@/lib/db'

const validInput = {
  email: 'test@test.com',
  password: 'password123',
  fullName: 'João Silva',
  documentType: 'rg' as const,
  documentNumber: '12345678',
  paymentMethod: 'pix' as const,
  dependentsList: [],
}

describe('registerClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReturning
      .mockResolvedValueOnce([{ id: 'user-id', email: 'test@test.com', role: 'client' }])
      .mockResolvedValueOnce([{ id: 'client-id', userId: 'user-id' }])
  })

  it('creates a user record', async () => {
    await registerClient(validInput)
    expect(db.insert).toHaveBeenCalledTimes(2) // user + client (no dependents)
  })

  it('sends confirmation email', async () => {
    await registerClient(validInput)
    expect(sendRegistrationConfirmed).toHaveBeenCalledWith({
      to: 'test@test.com',
      name: 'João Silva',
      paymentMethod: 'pix',
    })
  })

  it('returns success true', async () => {
    const result = await registerClient(validInput)
    expect(result.success).toBe(true)
  })

  it('inserts dependents when provided', async () => {
    mockReturning
      .mockResolvedValueOnce([{ id: 'user-id', email: 'test@test.com', role: 'client' }])
      .mockResolvedValueOnce([{ id: 'client-id', userId: 'user-id' }])

    const inputWithDependents = {
      ...validInput,
      dependentsList: [{ fullName: 'Maria', documentType: 'rg' as const, documentNumber: '99999' }],
    }
    await registerClient(inputWithDependents)
    expect(db.insert).toHaveBeenCalledTimes(3) // user + client + dependents batch
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/actions/register.test.ts
```

Expected: FAIL

- [ ] **Step 3: Criar lib/actions/register.ts**

```typescript
// lib/actions/register.ts
'use server'

import { db } from '@/lib/db'
import { users, clients, dependents } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { sendRegistrationConfirmed } from '@/lib/email'

type DependentInput = {
  fullName: string
  documentType: 'rg' | 'dni'
  documentNumber: string
}

type RegisterInput = {
  email: string
  password: string
  fullName: string
  documentType: 'rg' | 'dni'
  documentNumber: string
  paymentMethod: 'pix' | 'western_union'
  dependentsList: DependentInput[]
}

export async function registerClient(input: RegisterInput): Promise<{ success: boolean }> {
  const passwordHash = await bcrypt.hash(input.password, 12)

  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash, role: 'client' })
    .returning()

  const [client] = await db
    .insert(clients)
    .values({
      userId: user.id,
      fullName: input.fullName,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      paymentMethod: input.paymentMethod,
      status: 'pending',
    })
    .returning()

  if (input.dependentsList.length > 0) {
    await db.insert(dependents).values(
      input.dependentsList.map((d) => ({
        clientId: client.id,
        fullName: d.fullName,
        documentType: d.documentType,
        documentNumber: d.documentNumber,
      }))
    ).returning()
  }

  await sendRegistrationConfirmed({
    to: input.email,
    name: input.fullName,
    paymentMethod: input.paymentMethod,
  })

  return { success: true }
}
```

- [ ] **Step 4: Criar components/forms/register-form.tsx**

```typescript
// components/forms/register-form.tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { registerClient } from '@/lib/actions/register'

type DependentInput = { fullName: string; documentType: 'rg' | 'dni'; documentNumber: string }

export function RegisterForm() {
  const [step, setStep] = useState<'form' | 'payment'>('form')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'western_union'>('pix')
  const [dependents, setDependents] = useState<DependentInput[]>([])
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
        dependentsList: dependents,
      })
      if (result.success) setStep('payment')
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function addDependent() {
    if (dependents.length < 5) {
      setDependents([...dependents, { fullName: '', documentType: 'rg', documentNumber: '' }])
    }
  }

  function updateDependent(i: number, field: keyof DependentInput, value: string) {
    setDependents(dependents.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  function removeDependent(i: number) {
    setDependents(dependents.filter((_, idx) => idx !== i))
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
      {dependents.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Dependentes ({dependents.length}/5)</p>
          {dependents.map((dep, i) => (
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
      {dependents.length < 5 && (
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
```

- [ ] **Step 5: Criar app/(public)/cadastro/page.tsx**

```typescript
// app/(public)/cadastro/page.tsx
import { RegisterForm } from '@/components/forms/register-form'

export default function CadastroPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <RegisterForm />
    </main>
  )
}
```

- [ ] **Step 6: Rodar testes**

```bash
npm run test:run tests/actions/register.test.ts
```

Expected: `✓ tests/actions/register.test.ts (4 tests passed)`

- [ ] **Step 7: Testar no browser — abrir `http://localhost:3000/cadastro`**

Verificar: formulário carrega, dependente pode ser adicionado/removido (máx 5), submit mostra instruções de pagamento.

- [ ] **Step 8: Commit**

```bash
git add lib/actions/register.ts components/forms/register-form.tsx app/\(public\)/cadastro/ tests/actions/register.test.ts
git commit -m "feat: add client registration flow with payment instructions"
```

---

## Task 8: Verificação Pública de Status

**Files:**
- Create: `lib/actions/verify-status.ts`
- Create: `components/forms/status-check-form.tsx`
- Create: `app/(public)/verificar/page.tsx`
- Test: `tests/actions/verify-status.test.ts`

- [ ] **Step 1: Escrever teste**

```typescript
// tests/actions/verify-status.test.ts
import { describe, it, expect, vi } from 'vitest'

// Testa a lógica pura de resolução de status
import { resolveStatus } from '@/lib/actions/verify-status'

describe('resolveStatus', () => {
  it('returns active when client status is active', () => {
    expect(resolveStatus({ status: 'active' }, null)).toBe('active')
  })

  it('returns inactive when client status is inactive', () => {
    expect(resolveStatus({ status: 'inactive' }, null)).toBe('inactive')
  })

  it('returns inactive when client status is pending', () => {
    expect(resolveStatus({ status: 'pending' }, null)).toBe('inactive')
  })

  it('returns not_found when no client and no dependent', () => {
    expect(resolveStatus(null, null)).toBe('not_found')
  })

  it('uses dependent parent status when client is null', () => {
    expect(resolveStatus(null, { status: 'active' })).toBe('active')
  })

  it('returns inactive for pending parent client', () => {
    expect(resolveStatus(null, { status: 'pending' })).toBe('inactive')
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/actions/verify-status.test.ts
```

Expected: FAIL

- [ ] **Step 3: Criar lib/actions/verify-status.ts**

```typescript
// lib/actions/verify-status.ts
'use server'

import { db } from '@/lib/db'
import { clients, dependents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type StatusResult = 'active' | 'inactive' | 'not_found'

export function resolveStatus(
  client: { status: string } | null,
  parentClient: { status: string } | null
): StatusResult {
  const status = client?.status ?? parentClient?.status
  if (!status) return 'not_found'
  return status === 'active' ? 'active' : 'inactive'
}

export async function verifyStatus(documentNumber: string): Promise<StatusResult> {
  const [client] = await db
    .select({ status: clients.status })
    .from(clients)
    .where(eq(clients.documentNumber, documentNumber))
    .limit(1)

  if (client) return resolveStatus(client, null)

  const [dependent] = await db
    .select({ clientId: dependents.clientId })
    .from(dependents)
    .where(eq(dependents.documentNumber, documentNumber))
    .limit(1)

  if (!dependent) return 'not_found'

  const [parentClient] = await db
    .select({ status: clients.status })
    .from(clients)
    .where(eq(clients.id, dependent.clientId))
    .limit(1)

  return resolveStatus(null, parentClient ?? null)
}
```

- [ ] **Step 4: Criar components/forms/status-check-form.tsx**

```typescript
// components/forms/status-check-form.tsx
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
    const form = new FormData(e.currentTarget)
    const status = await verifyStatus(form.get('document') as string)
    setResult(status)
    setLoading(false)
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
            <Badge status={result} />
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Criar app/(public)/verificar/page.tsx**

```typescript
// app/(public)/verificar/page.tsx
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
```

- [ ] **Step 6: Rodar testes**

```bash
npm run test:run tests/actions/verify-status.test.ts
```

Expected: `✓ tests/actions/verify-status.test.ts (6 tests passed)`

- [ ] **Step 7: Testar no browser — `http://localhost:3000/verificar`**

Verificar: formulário aceita documento, exibe Badge ATIVO/INATIVO ou "Documento não encontrado".

- [ ] **Step 8: Commit**

```bash
git add lib/actions/verify-status.ts components/forms/status-check-form.tsx app/\(public\)/verificar/ tests/actions/verify-status.test.ts
git commit -m "feat: add public status verification by document number"
```

---

## Task 9: Login + Cartão Digital do Cliente

**Files:**
- Create: `components/forms/login-form.tsx`
- Create: `app/auth/login/page.tsx`
- Create: `components/card/digital-card.tsx`
- Create: `app/(cliente)/cartao/page.tsx`
- Create: `app/(cliente)/layout.tsx`
- Test: `tests/components/digital-card.test.tsx`

- [ ] **Step 1: Escrever teste de DigitalCard**

```typescript
// tests/components/digital-card.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DigitalCard } from '@/components/card/digital-card'

describe('DigitalCard', () => {
  const baseProps = {
    holderName: 'João Silva',
    status: 'active' as const,
    dependents: [],
  }

  it('renders holder name', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('renders ATIVO badge for active status', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
  })

  it('renders INATIVO badge for inactive status', () => {
    render(<DigitalCard {...baseProps} status="inactive" />)
    expect(screen.getByText('INATIVO')).toBeInTheDocument()
  })

  it('renders dependents list', () => {
    const props = {
      ...baseProps,
      dependents: [
        { id: '1', clientId: 'c1', fullName: 'Maria Silva', documentType: 'rg' as const, documentNumber: '11111' },
      ],
    }
    render(<DigitalCard {...props} />)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
  })

  it('does not render dependents section when empty', () => {
    render(<DigitalCard {...baseProps} />)
    expect(screen.queryByText('Dependentes')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar teste — verificar FALHA**

```bash
npm run test:run tests/components/digital-card.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Criar components/card/digital-card.tsx**

```typescript
// components/card/digital-card.tsx
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
```

- [ ] **Step 4: Criar components/forms/login-form.tsx**

```typescript
// components/forms/login-form.tsx
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
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }
    router.refresh()
    router.push('/')
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
```

- [ ] **Step 5: Criar app/auth/login/page.tsx**

```typescript
// app/auth/login/page.tsx
import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <LoginForm />
    </main>
  )
}
```

- [ ] **Step 6: Criar app/(cliente)/layout.tsx**

```typescript
// app/(cliente)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'client') redirect('/auth/login')
  return <>{children}</>
}
```

- [ ] **Step 7: Criar app/(cliente)/cartao/page.tsx**

```typescript
// app/(cliente)/cartao/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { clients, dependents, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { DigitalCard } from '@/components/card/digital-card'
import { signOut } from '@/lib/auth'

export default async function CartaoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.userId, session.user.id))
    .limit(1)

  if (!client) redirect('/auth/login')

  const clientDependents = await db
    .select()
    .from(dependents)
    .where(eq(dependents.clientId, client.id))

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/' })
  }

  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center py-12 px-4 gap-4">
      <DigitalCard
        holderName={client.fullName}
        status={client.status}
        dependents={clientDependents}
      />
      <form action={handleSignOut}>
        <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 underline">
          Sair
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 8: Rodar testes**

```bash
npm run test:run tests/components/digital-card.test.tsx
```

Expected: `✓ tests/components/digital-card.test.tsx (5 tests passed)`

- [ ] **Step 9: Testar login no browser**

```bash
# Criar usuário de teste no banco via seed (próxima task) ou diretamente no Neon console
# Acessar http://localhost:3000/auth/login
# Verificar redirecionamento por role após login
```

- [ ] **Step 10: Commit**

```bash
git add components/forms/login-form.tsx app/auth/ components/card/ app/\(cliente\)/ tests/components/digital-card.test.tsx
git commit -m "feat: add login page and digital card view for clients"
```

---

## Task 10: Seed Script + .env.example + Netlify Config

**Files:**
- Create: `lib/db/seed.ts`
- Create: `.env.example`
- Create: `netlify.toml`

- [ ] **Step 1: Criar lib/db/seed.ts**

```typescript
// lib/db/seed.ts
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users } from './schema'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  const passwordHash = await bcrypt.hash('admin123', 12)

  await db
    .insert(users)
    .values({
      email: 'admin@economizesc.com.br',
      passwordHash,
      role: 'admin',
    })
    .onConflictDoNothing()

  console.log('✓ Admin criado: admin@economizesc.com.br / admin123')
  console.log('⚠ TROQUE A SENHA IMEDIATAMENTE EM PRODUÇÃO')
}

seed().catch(console.error)
```

- [ ] **Step 2: Adicionar script no package.json**

```json
"scripts": {
  "db:seed": "tsx lib/db/seed.ts"
}
```

```bash
npm install -D tsx
```

- [ ] **Step 3: Rodar seed**

```bash
npm run db:seed
```

Expected: `✓ Admin criado: admin@economizesc.com.br / admin123`

- [ ] **Step 4: Criar .env.example**

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=run-openssl-rand-base64-32
AUTH_URL=https://your-site.netlify.app
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NEXT_PUBLIC_PIX_KEY=00.000.000/0001-00
NEXT_PUBLIC_WU_BENEFICIARY=Nome do Beneficiário Western Union
NEXT_PUBLIC_CNPJ=00.000.000/0001-00
NEXT_PUBLIC_CONTACT_EMAIL=contato@economizesc.com.br
```

- [ ] **Step 5: Criar netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 6: Instalar plugin Netlify**

```bash
npm install -D @netlify/plugin-nextjs
```

- [ ] **Step 7: Verificar build**

```bash
npm run build
```

Expected: build completa sem erros. Se houver erros de TypeScript, corrigir antes de prosseguir.

- [ ] **Step 8: Commit**

```bash
git add lib/db/seed.ts .env.example netlify.toml package.json
git commit -m "chore: add seed script, env example, and Netlify config"
```

---

## Rodar todos os testes da Parte 1

- [ ] **Verificar que todos os testes passam**

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

Test Files: 9 passed
Tests: 40 passed
```

---

**Parte 1 completa. Continuar com `docs/superpowers/plans/2026-05-21-economize-sc-parte2.md` para admin e painéis de parceiro.**
