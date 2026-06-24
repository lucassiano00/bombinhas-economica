# Bombinhas+ Econômica — Parte 1: Fundação do Rebrand — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a base do `economize-sc` na fundação do Bombinhas+ Econômica: roteamento bilíngue `/pt` `/es`, tokens visuais do DESIGN.md, e schema de banco migrado para o novo modelo (CPF/DNI/passaporte + tabela de pagamentos).

**Architecture:** Next 16 App Router com i18n **nativo** (dicionários server-side + `app/[locale]/`, sem `next-intl`). O roteamento de locale e a proteção de rotas por role vivem no `proxy.ts` (o `middleware.ts` foi renomeado para `proxy.ts` no Next 16). Drizzle + Neon para o schema, com migração gerada via `drizzle-kit`. Os componentes da landing atual continuam renderizando (em PT) — o rebuild bilíngue de marca é a Parte 3.

**Tech Stack:** Next.js 16.2.7, React 19, Tailwind CSS v4, Drizzle ORM + Neon (`@neondatabase/serverless`), Auth.js v5, Vitest 4, `next/font/google` (Plus Jakarta Sans).

## Global Constraints

Toda task herda implicitamente estas regras (valores exatos do spec/DESIGN.md):

- **Next.js 16.2.7.** Antes de escrever qualquer código específico do Next, leia o guia relevante em `node_modules/next/dist/docs/`. APIs mudaram.
- **`middleware` virou `proxy`.** Use `proxy.ts` na raiz, exportando a função `proxy` ou `default`. Não crie `middleware.ts`.
- **i18n nativo do Next.** Locales `['pt', 'es']`, default `'pt'`. URLs `/pt/...` e `/es/...`. Dicionários server-side. **Não** instalar `next-intl` nem outra lib de i18n.
- **Drizzle + Neon HTTP.** Driver `drizzle-orm/neon-http`. Todas as mutações via Server Actions (não API routes), exceto webhooks/endpoints técnicos (virão na Parte 2).
- **Vitest 4.** Para mockar módulos com imports top-level, use `vi.hoisted()`.
- **Tailwind v4.** Tokens via `@theme inline` em `app/globals.css`. Cores em **OKLCH**.
- **Marca:** "Bombinhas+ Econômica". Fonte **Plus Jakarta Sans** (sans única, vários pesos). Paleta-âncora: Marinho Profundo `#0D2F5C` (primária/confiança), Verde-Água `#1EA896` (ação), Areia Quente (neutro quente).
- **Regras do DESIGN.md:** verde-água em ≤15% de qualquer tela e só para ação; vermelho **proibido** como cor de marca (só erro/destrutivo); contraste de corpo ≥ 4.5:1; status sempre cor + ícone + texto.
- **Acessibilidade:** WCAG 2.2 AA.

---

### Task 1: Locale helpers + dicionários PT/ES

**Files:**
- Create: `lib/i18n.ts`
- Create: `app/[locale]/dictionaries.ts`
- Create: `app/[locale]/dictionaries/pt.json`
- Create: `app/[locale]/dictionaries/es.json`
- Test: `tests/i18n.test.ts`

**Interfaces:**
- Produces:
  - `lib/i18n.ts`: `export const locales = ['pt', 'es'] as const`; `export type Locale = (typeof locales)[number]`; `export const defaultLocale: Locale = 'pt'`; `export function isLocale(value: string): value is Locale`; `export function resolveLocale(acceptLanguage: string | null): Locale`.
  - `app/[locale]/dictionaries.ts`: `export type Dictionary = typeof import('./dictionaries/pt.json')`; `export async function getDictionary(locale: Locale): Promise<Dictionary>`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/i18n.test.ts
import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, isLocale, resolveLocale } from '@/lib/i18n'
import pt from '@/app/[locale]/dictionaries/pt.json'
import es from '@/app/[locale]/dictionaries/es.json'

describe('i18n helpers', () => {
  it('exposes pt and es with pt as default', () => {
    expect(locales).toEqual(['pt', 'es'])
    expect(defaultLocale).toBe('pt')
  })

  it('isLocale narrows valid locales only', () => {
    expect(isLocale('pt')).toBe(true)
    expect(isLocale('es')).toBe(true)
    expect(isLocale('en')).toBe(false)
    expect(isLocale('')).toBe(false)
  })

  it('resolveLocale picks es for spanish accept-language, pt otherwise', () => {
    expect(resolveLocale('es-AR,es;q=0.9')).toBe('es')
    expect(resolveLocale('es')).toBe('es')
    expect(resolveLocale('pt-BR,pt;q=0.9')).toBe('pt')
    expect(resolveLocale('en-US,en;q=0.9')).toBe('pt')
    expect(resolveLocale(null)).toBe('pt')
  })
})

describe('dictionary parity', () => {
  it('pt and es share the exact same key paths', () => {
    const paths = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object'
          ? paths(v as Record<string, unknown>, `${prefix}${k}.`)
          : [`${prefix}${k}`]
      )
    expect(paths(pt).sort()).toEqual(paths(es).sort())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/i18n.test.ts`
Expected: FAIL — cannot resolve `@/lib/i18n` and the JSON files.

- [ ] **Step 3: Write `lib/i18n.ts`**

```ts
// lib/i18n.ts
export const locales = ['pt', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

// Optimistic check only (runs in proxy). First language tag wins.
export function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const primary = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? ''
  if (primary.startsWith('es')) return 'es'
  return defaultLocale
}
```

- [ ] **Step 4: Write the dictionaries**

```json
// app/[locale]/dictionaries/pt.json
{
  "nav": {
    "tourists": "Turistas",
    "residents": "Moradores",
    "businesses": "Empresas",
    "contact": "Contato"
  },
  "hero": {
    "title": "Economize de verdade em Bombinhas SC",
    "subtitle": "O cartão digital Bombinhas+ Econômica oferece descontos exclusivos em estabelecimentos.",
    "cta": "Quero economizar agora"
  },
  "sections": {
    "partners": "Alguns de nossos parceiros",
    "categories": "Categorias de descontos por localização",
    "emergency": "Emergência — Serviços 24 horas",
    "price": "Valor do crédito",
    "registerBr": "Cadastro brasileiros",
    "registerForeign": "Cadastro estrangeiros"
  },
  "meta": {
    "title": "Bombinhas+ Econômica — Cartão de Descontos",
    "description": "Economize de verdade em Bombinhas/SC com o cartão de descontos digital."
  }
}
```

```json
// app/[locale]/dictionaries/es.json
{
  "nav": {
    "tourists": "Turistas",
    "residents": "Residentes",
    "businesses": "Empresas",
    "contact": "Contacto"
  },
  "hero": {
    "title": "Ahorra de verdad en Bombinhas SC",
    "subtitle": "La tarjeta digital Bombinhas+ Econômica ofrece descuentos exclusivos en comercios.",
    "cta": "Quiero ahorrar ahora"
  },
  "sections": {
    "partners": "Algunos de nuestros socios",
    "categories": "Categorías de descuentos por ubicación",
    "emergency": "Emergencia — Servicios 24 horas",
    "price": "Valor del crédito",
    "registerBr": "Registro brasileños",
    "registerForeign": "Registro extranjeros"
  },
  "meta": {
    "title": "Bombinhas+ Econômica — Tarjeta de Descuentos",
    "description": "Ahorra de verdad en Bombinhas/SC con la tarjeta de descuentos digital."
  }
}
```

```ts
// app/[locale]/dictionaries.ts
import 'server-only'
import type { Locale } from '@/lib/i18n'

const dictionaries = {
  pt: () => import('./dictionaries/pt.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['pt']>>

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test:run -- tests/i18n.test.ts`
Expected: PASS (all 4 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/i18n.ts "app/[locale]/dictionaries.ts" "app/[locale]/dictionaries" tests/i18n.test.ts
git commit -m "feat(i18n): add locale helpers and pt/es dictionaries"
```

---

### Task 2: Tokens de marca + fonte (DESIGN.md → globals.css)

**Files:**
- Modify: `app/globals.css` (replace entire file)

**Interfaces:**
- Produces: CSS custom properties + Tailwind v4 theme tokens: `--color-navy`, `--color-navy-deep`, `--color-teal`, `--color-teal-deep`, `--color-sand`, `--color-ink`, `--color-surface`, `--color-border`, `--color-danger`, `--font-sans` (bound to `--font-jakarta`, set by the layout in Task 3).

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  /* Brand anchors from the "B+" logo, in OKLCH.
     Final ramp tuned during Impeccable polish (Parte 3). */
  --navy: oklch(0.29 0.075 257);       /* Marinho Profundo — primary / trust */
  --navy-deep: oklch(0.22 0.060 257);  /* navy hover / active */
  --teal: oklch(0.68 0.105 184);       /* Verde-Água — action only, ≤15% rule */
  --teal-deep: oklch(0.60 0.100 184);  /* teal hover */
  --sand: oklch(0.95 0.015 85);        /* Areia Quente — warm neutral surfaces */
  --ink: oklch(0.25 0.025 257);        /* body text — contrast ≥ 4.5:1 */
  --surface: oklch(0.99 0.004 85);     /* warm white base */
  --border: oklch(0.90 0.012 250);     /* 1px borders / dividers */
  --danger: oklch(0.58 0.180 25);      /* error / destructive ONLY — never brand */
}

@theme inline {
  --color-navy: var(--navy);
  --color-navy-deep: var(--navy-deep);
  --color-teal: var(--teal);
  --color-teal-deep: var(--teal-deep);
  --color-sand: var(--sand);
  --color-ink: var(--ink);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-danger: var(--danger);
  --font-sans: var(--font-jakarta);
}

body {
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-jakarta), system-ui, sans-serif;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: PASS (no type errors; CSS isn't type-checked, this confirms nothing else broke). A full `npm run build` runs in Task 3 after the layout wires the font.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(brand): apply Bombinhas+ Econômica color tokens (navy/teal/sand)"
```

---

### Task 3: Reestruturar para `app/[locale]/` + root layout localizado

**Files:**
- Move: `app/(public)/` → `app/[locale]/(public)/`
- Move: `app/auth/` → `app/[locale]/auth/`
- Move: `app/cliente/` → `app/[locale]/cliente/`
- Create: `app/[locale]/layout.tsx` (novo root layout)
- Delete: `app/layout.tsx`
- Modify: `app/[locale]/(public)/page.tsx` (passar `locale`/dict ao título)
- Test: `tests/landing.test.tsx`

> `app/api/` permanece fora de `[locale]` (rotas de API não usam layout).

**Interfaces:**
- Consumes: `getDictionary`, `Dictionary` (Task 1); `isLocale`, `Locale` (Task 1).
- Produces: `app/[locale]/layout.tsx` exporta `generateStaticParams()` → `[{ locale: 'pt' }, { locale: 'es' }]` e é o **único** root layout (`<html><body>`).

- [ ] **Step 1: Mover as rotas para dentro de `[locale]`**

```bash
mkdir -p "app/[locale]"
git mv "app/(public)" "app/[locale]/(public)"
git mv app/auth "app/[locale]/auth"
git mv app/cliente "app/[locale]/cliente"
```

- [ ] **Step 2: Criar o root layout localizado e remover o antigo**

```bash
rm app/layout.tsx
```

```tsx
// app/[locale]/layout.tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isLocale } from '@/lib/i18n'
import '../globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Bombinhas+ Econômica — Cartão de Descontos',
  description: 'Economize de verdade em Bombinhas/SC com o cartão de descontos digital.',
}

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'es' }]
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale === 'pt' ? 'pt-BR' : 'es'} className={jakarta.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Wire the landing page to the locale (smoke-level)**

Substitua o conteúdo de `app/[locale]/(public)/page.tsx` para consumir o locale e o dicionário (os componentes internos continuam em PT por enquanto; o rebuild bilíngue é a Parte 3):

```tsx
// app/[locale]/(public)/page.tsx
import { isLocale } from '@/lib/i18n'
import { getDictionary } from '../dictionaries'
import { notFound } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Benefits } from '@/components/landing/benefits'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ClosingSection } from '@/components/landing/closing-section'
import { Footer } from '@/components/landing/footer'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <main>
      <h1 className="sr-only">{dict.hero.title}</h1>
      <Hero />
      <Benefits />
      <HowItWorks />
      <ClosingSection />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 4: Write a render test for the localized landing**

```tsx
// tests/landing.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '@/app/[locale]/(public)/page'

describe('localized landing page', () => {
  it('renders the pt hero title', async () => {
    const ui = await HomePage({ params: Promise.resolve({ locale: 'pt' }) })
    render(ui)
    expect(
      screen.getByText('Economize de verdade em Bombinhas SC')
    ).toBeInTheDocument()
  })

  it('renders the es hero title', async () => {
    const ui = await HomePage({ params: Promise.resolve({ locale: 'es' }) })
    render(ui)
    expect(
      screen.getByText('Ahorra de verdad en Bombinhas SC')
    ).toBeInTheDocument()
  })
})
```

> `dictionaries.ts` importa `server-only`. Se o teste falhar ao importar esse módulo, adicione `vi.mock('server-only', () => ({}))` no topo de `tests/landing.test.tsx` (padrão já usado em outros testes server-side do repo).

- [ ] **Step 5: Run the render test + full build**

Run: `npm run test:run -- tests/landing.test.tsx`
Expected: PASS (2 tests).

Run: `npm run build`
Expected: build conclui; rotas `/[locale]` e `/[locale]/...` aparecem na saída.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(i18n): restructure routes under app/[locale] with localized root layout"
```

---

### Task 4: `proxy.ts` — roteamento de locale + proteção de role

**Files:**
- Create: `proxy.ts` (raiz)
- Delete: `middleware.ts`
- Test: `tests/proxy-locale.test.ts`

**Interfaces:**
- Consumes: `locales`, `resolveLocale` (Task 1); `auth` de `@/lib/auth`.
- Produces: `proxy.ts` default export (handler) + `config.matcher`.

> A lógica pura de locale já é testada via `resolveLocale` (Task 1). Esta task adiciona um teste do mapeamento "path → precisa de prefixo?" para travar o comportamento do proxy sem subir o runtime do Next.

- [ ] **Step 1: Write the failing test**

```ts
// tests/proxy-locale.test.ts
import { describe, it, expect } from 'vitest'
import { needsLocalePrefix } from '@/lib/i18n'

describe('needsLocalePrefix', () => {
  it('returns false for paths already prefixed with a locale', () => {
    expect(needsLocalePrefix('/pt')).toBe(false)
    expect(needsLocalePrefix('/es/cadastro')).toBe(false)
    expect(needsLocalePrefix('/pt/cliente/cartao')).toBe(false)
  })

  it('returns true for unprefixed paths', () => {
    expect(needsLocalePrefix('/')).toBe(true)
    expect(needsLocalePrefix('/cadastro')).toBe(true)
    expect(needsLocalePrefix('/auth/login')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/proxy-locale.test.ts`
Expected: FAIL — `needsLocalePrefix` is not exported from `@/lib/i18n`.

- [ ] **Step 3: Add `needsLocalePrefix` to `lib/i18n.ts`**

Acrescente ao final de `lib/i18n.ts`:

```ts
export function needsLocalePrefix(pathname: string): boolean {
  return !locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/proxy-locale.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `proxy.ts` and delete `middleware.ts`**

```bash
rm middleware.ts
```

```ts
// proxy.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { resolveLocale, needsLocalePrefix } from '@/lib/i18n'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // 1. Locale routing: redirect unprefixed paths to the resolved locale.
  if (needsLocalePrefix(pathname)) {
    const locale = resolveLocale(req.headers.get('accept-language'))
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // 2. Role guards, locale-aware. pathname is /<locale>/<rest...>.
  const [, locale, ...restParts] = pathname.split('/')
  const rest = '/' + restParts.join('/')
  const role = req.auth?.user?.role
  const loginUrl = new URL(`/${locale}/auth/login`, req.url)

  if (rest.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(loginUrl)
  }
  if (rest.startsWith('/parceiro') && role !== 'partner') {
    return NextResponse.redirect(loginUrl)
  }
  if (rest.startsWith('/cliente') && role !== 'client') {
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Run on everything except API, Next internals, and files with an extension.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

- [ ] **Step 6: Verify build + manual smoke**

Run: `npm run build`
Expected: build conclui sem erro de proxy.

Run (manual, optional): `npm run dev`, então abrir `http://localhost:3000/` → redireciona para `/pt`; `http://localhost:3000/es/cadastro` → carrega sem redirect.

- [ ] **Step 7: Commit**

```bash
git add proxy.ts lib/i18n.ts tests/proxy-locale.test.ts
git commit -m "feat(proxy): migrate middleware to proxy.ts with locale + role routing"
```

---

### Task 5: Migração de schema — enums, campos de `clients`, tabela `payments`

**Files:**
- Modify: `lib/db/schema.ts`
- Modify: `lib/db/seed.ts` (ajustar inserts ao novo schema, se necessário)
- Create: migração SQL gerada em `drizzle/` (via `drizzle-kit generate`)
- Test: `tests/schema.test.ts`

**Interfaces:**
- Produces (em `lib/db/schema.ts`):
  - `documentTypeEnum` = `pgEnum('document_type', ['cpf', 'dni', 'passport'])`
  - `clientTypeEnum` = `pgEnum('client_type', ['brazilian', 'foreigner'])`
  - `paymentStatusEnum` = `pgEnum('payment_status', ['pending', 'approved', 'rejected', 'refunded'])`
  - `clients` ganha: `phone` (text, notNull), `clientType` (clientTypeEnum, notNull), `locale` (text, notNull, default `'pt'`), `expiresAt` (timestamp, nullable); perde `paymentMethod`.
  - nova `payments` table (ver código).
  - `paymentMethodEnum` removido.

- [ ] **Step 1: Write the failing test**

```ts
// tests/schema.test.ts
import { describe, it, expect } from 'vitest'
import {
  clients,
  payments,
  documentTypeEnum,
  clientTypeEnum,
  paymentStatusEnum,
} from '@/lib/db/schema'

describe('schema — Bombinhas+ Econômica model', () => {
  it('documentType enum is cpf/dni/passport', () => {
    expect(documentTypeEnum.enumValues).toEqual(['cpf', 'dni', 'passport'])
  })

  it('clientType enum is brazilian/foreigner', () => {
    expect(clientTypeEnum.enumValues).toEqual(['brazilian', 'foreigner'])
  })

  it('payment status enum covers the gateway lifecycle', () => {
    expect(paymentStatusEnum.enumValues).toEqual([
      'pending',
      'approved',
      'rejected',
      'refunded',
    ])
  })

  it('clients has the new fields and dropped paymentMethod', () => {
    expect(clients.phone).toBeDefined()
    expect(clients.clientType).toBeDefined()
    expect(clients.locale).toBeDefined()
    expect(clients.expiresAt).toBeDefined()
    expect('paymentMethod' in clients).toBe(false)
  })

  it('payments table exposes the gateway columns', () => {
    expect(payments.clientId).toBeDefined()
    expect(payments.provider).toBeDefined()
    expect(payments.mpPaymentId).toBeDefined()
    expect(payments.amount).toBeDefined()
    expect(payments.status).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/schema.test.ts`
Expected: FAIL — `payments`, `clientTypeEnum`, `paymentStatusEnum` not exported; `clients.phone` undefined.

- [ ] **Step 3: Update `lib/db/schema.ts`**

Substitua os enums e a tabela `clients`, remova `paymentMethodEnum`, e acrescente `payments`. As tabelas `users`, `dependents`, `partners`, `discountUsages` permanecem inalteradas.

```ts
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'partner', 'client'])
export const documentTypeEnum = pgEnum('document_type', ['cpf', 'dni', 'passport'])
export const clientTypeEnum = pgEnum('client_type', ['brazilian', 'foreigner'])
export const clientStatusEnum = pgEnum('client_status', ['pending', 'active', 'inactive'])
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'approved',
  'rejected',
  'refunded',
])

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
  phone: text('phone').notNull(),
  clientType: clientTypeEnum('client_type').notNull(),
  documentType: documentTypeEnum('document_type').notNull(),
  documentNumber: text('document_number').notNull().unique(),
  locale: text('locale').notNull().default('pt'),
  status: clientStatusEnum('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at'),
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

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  provider: text('provider').notNull().default('mercadopago'),
  mpPreferenceId: text('mp_preference_id'),
  mpPaymentId: text('mp_payment_id'),
  amount: integer('amount').notNull(), // centavos (R$ 99,00 = 9900)
  status: paymentStatusEnum('status').notNull().default('pending'),
  rawPayload: jsonb('raw_payload'),
  paidAt: timestamp('paid_at'),
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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Fix `lib/db/seed.ts` to match the new schema**

Abra `lib/db/seed.ts`. Se ele insere em `clients` com `paymentMethod` ou `documentType: 'rg'`, ajuste: remova `paymentMethod`, troque `documentType` para `'cpf'`/`'dni'`/`'passport'`, e adicione `phone` e `clientType`. Exemplo de um client de seed válido:

```ts
// dentro de lib/db/seed.ts, ao inserir um client de exemplo:
await db.insert(clients).values({
  userId: user.id,
  fullName: 'Cliente Exemplo',
  phone: '+5547999990000',
  clientType: 'brazilian',
  documentType: 'cpf',
  documentNumber: '12345678900',
  locale: 'pt',
  status: 'active',
})
```

> Se `seed.ts` não inserir clients, nenhuma mudança é necessária aqui — apenas confirme que `npx tsc --noEmit` passa no passo seguinte.

- [ ] **Step 6: Gerar a migração e checar tipos**

Run: `npx tsc --noEmit`
Expected: PASS (sem erros — confirma que `seed.ts` e o resto compilam contra o novo schema).

Run: `npx drizzle-kit generate`
Expected: cria um arquivo SQL novo em `drizzle/` com os `ALTER TABLE`/`CREATE TABLE`. (Não roda no banco; `drizzle-kit push`/migrate fica para o deploy.)

- [ ] **Step 7: Commit**

```bash
git add lib/db/schema.ts lib/db/seed.ts drizzle tests/schema.test.ts
git commit -m "feat(db): migrate schema to CPF/DNI/passport + payments table"
```

---

## Self-Review

**Spec coverage (Parte 1 do design 2026-06-23):**
- i18n `/pt` `/es` → Tasks 1, 3, 4 ✅ (nativo, sem next-intl — desvio sinalizado abaixo)
- Tokens do DESIGN.md → Task 2 ✅
- `documentType` cpf/dni/passport → Task 5 ✅
- `clients` novos campos (`phone`, `clientType`, `locale`, `expiresAt`), remove `paymentMethod` → Task 5 ✅
- Tabela `payments` → Task 5 ✅
- Mantém `dependents`/`discountUsages` → Task 5 ✅
- `middleware` → `proxy` → Task 4 ✅
- Rename economize-sc → Bombinhas+ (metadata) → Task 3 ✅
- Fora desta parte (Partes 2-4): Mercado Pago, cadastro BR/estrangeiro, landing de marca, cartão, admin. Correto.

**Placeholder scan:** sem TBD/TODO; todo passo de código tem código completo; comandos têm saída esperada.

**Type consistency:** `Locale`, `isLocale`, `resolveLocale`, `needsLocalePrefix` (lib/i18n.ts) usados consistentemente em Tasks 1/3/4. `getDictionary(locale)` retorna `Dictionary` usado na Task 3. Enums e colunas da Task 5 batem com os nomes testados.

**Desvio sinalizado vs. spec:** o spec dizia "next-intl"; este plano usa o **i18n nativo do Next 16** (mesmas URLs `/pt` `/es`, mesmo benefício de SEO), porque é o padrão documentado do Next 16 e evita uma dependência que pode atrasar compatibilidade. Decisão a confirmar com o usuário antes de executar.
