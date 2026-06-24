# Bombinhas+ Econômica — Parte 2: Pagamento & Cadastro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ligar o cadastro ao pagamento real: cliente paga R$ 99,00/ano via Mercado Pago (Checkout Pro hospedado) e o cartão é ativado automaticamente por webhook.

**Architecture:** O Server Action de cadastro cria `users` + `clients`(pending) + `payments`(pending), gera uma Checkout Preference no Mercado Pago e devolve o `init_point`; o front redireciona o cliente para o checkout hospedado do MP (cartão/Pix). Um route handler `app/api/webhooks/mercadopago/route.ts` recebe a notificação, **re-busca o pagamento autenticado na API do MP** (fonte de verdade), valida assinatura, atualiza `payments.status` e, se aprovado, marca `clients.status='active'`, define `expiresAt = hoje + 1 ano` e dispara o email de ativação. Idempotente.

**Tech Stack:** Next 16 (route handlers), `mercadopago` SDK v2, Drizzle + Neon, Resend, Vitest 4.

## Global Constraints

Toda task herda implicitamente (valores exatos do spec/Parte 1):

- **Next.js 16.2.7.** Route handlers em `app/api/**/route.ts` exportando `POST`/`GET`. Antes de código específico do Next, leia `node_modules/next/dist/docs/`.
- **Preço:** **R$ 99,00/ano** (= **9900 centavos** internamente; `unit_price` do MP é em reais: `99.0`). O preço antigo "R$ 49,90" e textos de PIX/Western Union são **proibidos** — devem sumir do código tocado.
- **Marca:** "Bombinhas+ Econômica". Remetente de email e domínios usam `bombinhaseconomica.com.br` (via env), não `economizesc`.
- **Mercado Pago SDK v2:** `import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'`. Toda chamada ao MP passa por `lib/mercadopago.ts` (centralizado e mockável).
- **i18n:** rotas de página sob `app/[locale]/`. As `back_urls` e o link do cartão no email são **locale-aware** (`/${locale}/...`). Webhook fica fora de `[locale]` (`app/api/...`).
- **Drizzle + Neon.** Mutações via Server Actions; o webhook é a única exceção (route handler).
- **Vitest 4.** Mockar módulos com imports top-level via `vi.hoisted()`/`vi.mock`. Mockar o SDK `mercadopago` e o `lib/db` nos testes.
- **Segurança do webhook:** confiar SOMENTE no status re-buscado pela API autenticada do MP (nunca no corpo da notificação). Validar a assinatura `x-signature`. Idempotência por `mpPaymentId`.
- **Env novas:** `MP_ACCESS_TOKEN` (server), `MP_WEBHOOK_SECRET`, `NEXT_PUBLIC_MP_PUBLIC_KEY`.

---

### Task 1: Wrapper do Mercado Pago + env

**Files:**
- Create: `lib/mercadopago.ts`
- Modify: `.env.example`
- Test: `tests/mercadopago.test.ts`

**Interfaces:**
- Produces (`lib/mercadopago.ts`):
  - `export const CARD_PRICE_BRL = 99.0` and `export const CARD_PRICE_CENTS = 9900`
  - `export type CreatePreferenceArgs = { externalReference: string; payerEmail: string; payerName: string; locale: 'pt' | 'es' }`
  - `export async function createCheckoutPreference(args: CreatePreferenceArgs): Promise<{ preferenceId: string; initPoint: string }>`
  - `export async function getMercadoPagoPayment(paymentId: string): Promise<{ id: string; status: string; externalReference: string | null }>`

- [ ] **Step 1: Write the failing test**

```ts
// tests/mercadopago.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const createMock = vi.fn()
const getMock = vi.fn()

vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn().mockImplementation(() => ({})),
  Preference: vi.fn().mockImplementation(() => ({ create: createMock })),
  Payment: vi.fn().mockImplementation(() => ({ get: getMock })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.MP_ACCESS_TOKEN = 'TEST-token'
  process.env.NEXT_PUBLIC_APP_URL = 'https://bombinhas.example'
})

describe('createCheckoutPreference', () => {
  it('sends a R$ 99,00 item, external_reference, locale-aware back_urls and notification_url', async () => {
    createMock.mockResolvedValue({ id: 'pref_1', init_point: 'https://mp/checkout/pref_1' })
    const { createCheckoutPreference, CARD_PRICE_BRL } = await import('@/lib/mercadopago')

    const res = await createCheckoutPreference({
      externalReference: 'pay_123',
      payerEmail: 'a@b.com',
      payerName: 'Ana',
      locale: 'es',
    })

    expect(res).toEqual({ preferenceId: 'pref_1', initPoint: 'https://mp/checkout/pref_1' })
    const body = createMock.mock.calls[0][0].body
    expect(body.items[0].unit_price).toBe(CARD_PRICE_BRL)
    expect(body.items[0].currency_id).toBe('BRL')
    expect(body.external_reference).toBe('pay_123')
    expect(body.back_urls.success).toBe('https://bombinhas.example/es/cadastro/sucesso')
    expect(body.notification_url).toBe('https://bombinhas.example/api/webhooks/mercadopago')
    expect(body.auto_return).toBe('approved')
  })
})

describe('getMercadoPagoPayment', () => {
  it('returns a normalized payment from the MP API', async () => {
    getMock.mockResolvedValue({ id: 999, status: 'approved', external_reference: 'pay_123' })
    const { getMercadoPagoPayment } = await import('@/lib/mercadopago')
    const p = await getMercadoPagoPayment('999')
    expect(p).toEqual({ id: '999', status: 'approved', externalReference: 'pay_123' })
    expect(getMock).toHaveBeenCalledWith({ id: '999' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/mercadopago.test.ts`
Expected: FAIL — cannot resolve `@/lib/mercadopago` (and `mercadopago` package).

- [ ] **Step 3: Install the SDK and write the wrapper**

Run: `npm install mercadopago`

```ts
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export const CARD_PRICE_BRL = 99.0
export const CARD_PRICE_CENTS = 9900

function client() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, '')
}

export type CreatePreferenceArgs = {
  externalReference: string
  payerEmail: string
  payerName: string
  locale: 'pt' | 'es'
}

export async function createCheckoutPreference(
  args: CreatePreferenceArgs
): Promise<{ preferenceId: string; initPoint: string }> {
  const preference = new Preference(client())
  const base = appUrl()
  const result = await preference.create({
    body: {
      items: [
        {
          id: 'cartao-anual',
          title: 'Cartão Bombinhas+ Econômica (1 ano)',
          quantity: 1,
          unit_price: CARD_PRICE_BRL,
          currency_id: 'BRL',
        },
      ],
      payer: { name: args.payerName, email: args.payerEmail },
      external_reference: args.externalReference,
      back_urls: {
        success: `${base}/${args.locale}/cadastro/sucesso`,
        pending: `${base}/${args.locale}/cadastro/pendente`,
        failure: `${base}/${args.locale}/cadastro/erro`,
      },
      auto_return: 'approved',
      notification_url: `${base}/api/webhooks/mercadopago`,
    },
  })
  return { preferenceId: String(result.id), initPoint: String(result.init_point) }
}

export async function getMercadoPagoPayment(
  paymentId: string
): Promise<{ id: string; status: string; externalReference: string | null }> {
  const payment = new Payment(client())
  const p = await payment.get({ id: paymentId })
  return {
    id: String(p.id),
    status: String(p.status),
    externalReference: p.external_reference ?? null,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/mercadopago.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Update `.env.example` (rebrand + MP vars, drop PIX/WU)**

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
AUTH_SECRET=run-openssl-rand-base64-32
AUTH_URL=https://your-site.netlify.app
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx-mercadopago-access-token
MP_WEBHOOK_SECRET=your-mercadopago-webhook-secret
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-mercadopago-public-key
NEXT_PUBLIC_CNPJ=37.123.456/0001-89
NEXT_PUBLIC_CONTACT_EMAIL=contato@bombinhaseconomica.com.br
```

- [ ] **Step 6: Commit**

```bash
git add lib/mercadopago.ts .env.example package.json package-lock.json tests/mercadopago.test.ts
git commit -m "feat(payments): add Mercado Pago SDK wrapper and env vars"
```

---

### Task 2: Email — rebrand, R$ 99,00, textos de Mercado Pago

**Files:**
- Modify: `lib/email/index.ts`
- Test: `tests/email/email.test.ts` (update)

**Interfaces:**
- Consumes: nothing new.
- Produces: `sendRegistrationConfirmed({ to, name, locale })` and `sendCardActivated({ to, name, locale })` — both gain a `locale: 'pt' | 'es'` param for the card URL; content rebranded to Bombinhas+ Econômica and R$ 99,00.

- [ ] **Step 1: Update the test first (TDD on content)**

Substitua o conteúdo de `tests/email/email.test.ts` por:

```ts
// tests/email/email.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const sendMock = vi.fn().mockResolvedValue({ id: 'email_1' })
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_APP_URL = 'https://bombinhas.example'
})

describe('sendRegistrationConfirmed', () => {
  it('mentions Bombinhas+ Econômica and R$ 99,00, never the old price', async () => {
    const { sendRegistrationConfirmed } = await import('@/lib/email')
    await sendRegistrationConfirmed({ to: 'a@b.com', name: 'Ana', locale: 'pt' })
    const body = sendMock.mock.calls[0][0]
    expect(body.from).toContain('Bombinhas')
    expect(body.text).toContain('R$ 99,00')
    expect(body.text).not.toContain('49,90')
    expect(body.text).not.toMatch(/Western Union|PIX/i)
  })
})

describe('sendCardActivated', () => {
  it('links to the locale-aware card page', async () => {
    const { sendCardActivated } = await import('@/lib/email')
    await sendCardActivated({ to: 'a@b.com', name: 'Ana', locale: 'es' })
    const body = sendMock.mock.calls[0][0]
    expect(body.text).toContain('https://bombinhas.example/es/cliente/cartao')
    expect(body.subject.toLowerCase()).toContain('bombinhas')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/email/email.test.ts`
Expected: FAIL — current email says "Economize SC", "R$ 49,90", and the functions don't accept `locale`.

- [ ] **Step 3: Rewrite `lib/email/index.ts`**

```ts
// lib/email/index.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Bombinhas+ Econômica <noreply@bombinhaseconomica.com.br>'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
}

export async function sendRegistrationConfirmed({
  to,
  name,
  locale,
}: {
  to: string
  name: string
  locale: 'pt' | 'es'
}) {
  void locale
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Cadastro recebido — Bombinhas+ Econômica',
    text: `Olá, ${name}!\n\nRecebemos seu cadastro no Bombinhas+ Econômica. Para ativar seu cartão, conclua o pagamento de R$ 99,00 (anual) no checkout do Mercado Pago.\n\nAssim que o pagamento for aprovado, seu cartão digital é ativado automaticamente e você recebe um aviso por email.\n\nEquipe Bombinhas+ Econômica`,
  })
}

export async function sendCardActivated({
  to,
  name,
  locale,
}: {
  to: string
  name: string
  locale: 'pt' | 'es'
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Seu cartão está ativo — Bombinhas+ Econômica!',
    text: `Olá, ${name}!\n\nSeu cartão Bombinhas+ Econômica está ativo!\n\nAcesse: ${appUrl()}/${locale}/cliente/cartao\n\nBom proveito em Bombinhas!\nEquipe Bombinhas+ Econômica`,
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/email/email.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/email/index.ts tests/email/email.test.ts
git commit -m "feat(email): rebrand to Bombinhas+ Econômica, R$ 99,00, locale-aware card link"
```

---

### Task 3: Cadastro cria pagamento + preference, retorna init_point

**Files:**
- Modify: `lib/actions/register.ts`
- Test: `tests/actions/register.test.ts` (update)

**Interfaces:**
- Consumes: `createCheckoutPreference` (Task 1), `sendRegistrationConfirmed` (Task 2), `payments` table (Parte 1).
- Produces: `registerClient(input)` now returns `{ success: true; initPoint: string }`. `RegisterInput` gains `locale: 'pt' | 'es'`.

- [ ] **Step 1: Update the test first**

Substitua `tests/actions/register.test.ts` por (mantém o mock de `lib/db` que o arquivo já usa — confirme o padrão atual antes de editar e reaproveite-o):

```ts
// tests/actions/register.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const insertReturning = vi.fn()
const insertValues = vi.fn(() => ({ returning: insertReturning }))
const insert = vi.fn(() => ({ values: insertValues }))
vi.mock('@/lib/db', () => ({ db: { insert } }))

const createPref = vi.fn()
vi.mock('@/lib/mercadopago', () => ({ createCheckoutPreference: createPref }))

const sendConfirmed = vi.fn()
vi.mock('@/lib/email', () => ({ sendRegistrationConfirmed: sendConfirmed }))

vi.mock('bcryptjs', () => ({ default: { hash: vi.fn().mockResolvedValue('hashed') } }))

beforeEach(() => {
  vi.clearAllMocks()
  insertReturning
    .mockResolvedValueOnce([{ id: 'user_1' }]) // users
    .mockResolvedValueOnce([{ id: 'client_1' }]) // clients
    .mockResolvedValueOnce([{ id: 'pay_1' }]) // payments
  createPref.mockResolvedValue({ preferenceId: 'pref_1', initPoint: 'https://mp/checkout' })
})

describe('registerClient', () => {
  it('creates user/client/payment, opens a preference with the payment id, returns initPoint', async () => {
    const { registerClient } = await import('@/lib/actions/register')
    const res = await registerClient({
      email: 'a@b.com',
      password: 'secret123',
      fullName: 'Ana',
      phone: '+5547999990000',
      clientType: 'foreigner',
      documentType: 'passport',
      documentNumber: 'X123',
      locale: 'es',
      dependentsList: [],
    })

    expect(res).toEqual({ success: true, initPoint: 'https://mp/checkout' })
    expect(createPref).toHaveBeenCalledWith(
      expect.objectContaining({ externalReference: 'pay_1', payerEmail: 'a@b.com', locale: 'es' })
    )
    expect(sendConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', name: 'Ana', locale: 'es' })
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/actions/register.test.ts`
Expected: FAIL — `registerClient` doesn't create a payment, doesn't call `createCheckoutPreference`, returns no `initPoint`.

- [ ] **Step 3: Update `lib/actions/register.ts`**

```ts
'use server'

import { db } from '@/lib/db'
import { users, clients, dependents, payments } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { sendRegistrationConfirmed } from '@/lib/email'
import { createCheckoutPreference, CARD_PRICE_CENTS } from '@/lib/mercadopago'

type DependentInput = {
  fullName: string
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
}

type RegisterInput = {
  email: string
  password: string
  fullName: string
  phone: string
  clientType: 'brazilian' | 'foreigner'
  documentType: 'cpf' | 'dni' | 'passport'
  documentNumber: string
  locale: 'pt' | 'es'
  dependentsList: DependentInput[]
}

export async function registerClient(
  input: RegisterInput
): Promise<{ success: boolean; initPoint: string }> {
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
      phone: input.phone,
      clientType: input.clientType,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      locale: input.locale,
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
    )
  }

  const [payment] = await db
    .insert(payments)
    .values({ clientId: client.id, amount: CARD_PRICE_CENTS, status: 'pending' })
    .returning()

  const { initPoint } = await createCheckoutPreference({
    externalReference: payment.id,
    payerEmail: input.email,
    payerName: input.fullName,
    locale: input.locale,
  })

  await sendRegistrationConfirmed({ to: input.email, name: input.fullName, locale: input.locale })

  return { success: true, initPoint }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/actions/register.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/actions/register.ts tests/actions/register.test.ts
git commit -m "feat(register): create payment row and Mercado Pago preference, return initPoint"
```

---

### Task 4: Webhook do Mercado Pago — ativação automática

**Files:**
- Create: `app/api/webhooks/mercadopago/route.ts`
- Create: `lib/actions/activate-payment.ts`
- Test: `tests/actions/activate-payment.test.ts`

**Interfaces:**
- Consumes: `getMercadoPagoPayment` (Task 1), `sendCardActivated` (Task 2), `payments`/`clients` (Parte 1).
- Produces: `applyPaymentNotification(paymentId: string): Promise<'activated' | 'ignored' | 'not_found'>` — the testable core; the route handler is a thin HTTP shell around it (signature check + call).

> A lógica de negócio fica em `activate-payment.ts` (testável puro); o route handler só faz parsing + validação de assinatura + delega. Isso mantém o handler fino e o core sob TDD.

- [ ] **Step 1: Write the failing test**

```ts
// tests/actions/activate-payment.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const getPayment = vi.fn()
vi.mock('@/lib/mercadopago', () => ({ getMercadoPagoPayment: getPayment }))

const sendActivated = vi.fn()
vi.mock('@/lib/email', () => ({ sendCardActivated: sendActivated }))

// Chainable drizzle mock: db.select()...limit() and db.update()...where()
const limit = vi.fn()
const where1 = vi.fn(() => ({ limit }))
const from = vi.fn(() => ({ where: where1 }))
const select = vi.fn(() => ({ from }))
const setWhere = vi.fn()
const set = vi.fn(() => ({ where: setWhere }))
const update = vi.fn(() => ({ set }))
vi.mock('@/lib/db', () => ({ db: { select, update } }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('applyPaymentNotification', () => {
  it('activates the client when MP reports approved and payment is still pending', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'pay_1' })
    // first select → payment row (pending); second select → client row + user email
    limit
      .mockResolvedValueOnce([{ id: 'pay_1', clientId: 'client_1', status: 'pending' }])
      .mockResolvedValueOnce([{ fullName: 'Ana', locale: 'pt', email: 'a@b.com', status: 'pending' }])

    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    const result = await applyPaymentNotification('999')

    expect(result).toBe('activated')
    expect(update).toHaveBeenCalled() // payment + client updated
    expect(sendActivated).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', name: 'Ana', locale: 'pt' })
    )
  })

  it('is idempotent: already-approved payment does nothing', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'pay_1' })
    limit.mockResolvedValueOnce([{ id: 'pay_1', clientId: 'client_1', status: 'approved' }])

    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    const result = await applyPaymentNotification('999')

    expect(result).toBe('ignored')
    expect(sendActivated).not.toHaveBeenCalled()
  })

  it('returns not_found when the external_reference matches no payment', async () => {
    getPayment.mockResolvedValue({ id: '999', status: 'approved', externalReference: 'missing' })
    limit.mockResolvedValueOnce([])
    const { applyPaymentNotification } = await import('@/lib/actions/activate-payment')
    expect(await applyPaymentNotification('999')).toBe('not_found')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/actions/activate-payment.test.ts`
Expected: FAIL — `@/lib/actions/activate-payment` does not exist.

- [ ] **Step 3: Write `lib/actions/activate-payment.ts`**

```ts
import { db } from '@/lib/db'
import { payments, clients, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getMercadoPagoPayment } from '@/lib/mercadopago'
import { sendCardActivated } from '@/lib/email'

function oneYearFromNow(): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d
}

export async function applyPaymentNotification(
  mpPaymentId: string
): Promise<'activated' | 'ignored' | 'not_found'> {
  const mp = await getMercadoPagoPayment(mpPaymentId)
  if (!mp.externalReference) return 'not_found'

  const [payment] = await db
    .select({ id: payments.id, clientId: payments.clientId, status: payments.status })
    .from(payments)
    .where(eq(payments.id, mp.externalReference))
    .limit(1)

  if (!payment) return 'not_found'
  if (payment.status === 'approved') return 'ignored' // idempotent

  if (mp.status !== 'approved') {
    await db
      .update(payments)
      .set({ status: mp.status === 'rejected' ? 'rejected' : 'pending', mpPaymentId })
      .where(eq(payments.id, payment.id))
    return 'ignored'
  }

  // Approved: mark payment, activate client, email.
  await db
    .update(payments)
    .set({ status: 'approved', mpPaymentId, paidAt: new Date() })
    .where(eq(payments.id, payment.id))

  await db
    .update(clients)
    .set({ status: 'active', expiresAt: oneYearFromNow() })
    .where(eq(clients.id, payment.clientId))

  const [holder] = await db
    .select({ fullName: clients.fullName, locale: clients.locale, email: users.email })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(eq(clients.id, payment.clientId))
    .limit(1)

  if (holder) {
    await sendCardActivated({
      to: holder.email,
      name: holder.fullName,
      locale: holder.locale === 'es' ? 'es' : 'pt',
    })
  }

  return 'activated'
}
```

> Nota sobre o teste: o segundo `select` usa `innerJoin`. Se o mock encadeado não cobrir `innerJoin`, ajuste o mock para incluir `innerJoin: vi.fn(() => ({ where: where2 }))` retornando `{ limit }`. Mantenha o mock fiel à cadeia real.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/actions/activate-payment.test.ts`
Expected: PASS (3 tests). Ajuste o mock de `innerJoin` se necessário (ver nota) até passar honestamente.

- [ ] **Step 5: Write the webhook route handler**

```ts
// app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { applyPaymentNotification } from '@/lib/actions/activate-payment'

// MP signs with: manifest = `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
// header x-signature = `ts=...,v1=<hmac sha256 hex>`
function isValidSignature(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id') ?? ''
  if (!sig) return false
  const parts = Object.fromEntries(
    sig.split(',').map((kv) => kv.split('=').map((s) => s.trim()))
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1))
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  let dataId = url.searchParams.get('data.id') ?? ''
  let type = url.searchParams.get('type') ?? ''

  // MP may also send the data in the JSON body.
  try {
    const body = await req.json()
    type = type || body?.type || body?.action?.split('.')?.[0] || ''
    dataId = dataId || body?.data?.id?.toString() || ''
  } catch {
    // no/invalid body — rely on query params
  }

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ received: true }, { status: 200 })
  }
  if (!isValidSignature(req, dataId)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  await applyPaymentNotification(dataId)
  // Always 200 so MP stops retrying a handled notification.
  return NextResponse.json({ received: true }, { status: 200 })
}
```

- [ ] **Step 6: Verify build + full suite**

Run: `npm run test:run`
Expected: all passing (Parte 1's 53 + new tests from Tasks 1–4).

Run: `npm run build`
Expected: build completes; `/api/webhooks/mercadopago` appears as a route.

- [ ] **Step 7: Commit**

```bash
git add app/api/webhooks/mercadopago/route.ts lib/actions/activate-payment.ts tests/actions/activate-payment.test.ts
git commit -m "feat(payments): Mercado Pago webhook with authenticated re-fetch and auto-activation"
```

---

### Task 5: Front do cadastro — redirect ao checkout + páginas de retorno

**Files:**
- Modify: `components/forms/register-form.tsx`
- Create: `app/[locale]/cadastro/sucesso/page.tsx`
- Create: `app/[locale]/cadastro/pendente/page.tsx`
- Create: `app/[locale]/cadastro/erro/page.tsx`
- Test: `tests/components/register-form.test.tsx`

**Interfaces:**
- Consumes: `registerClient` (Task 3, returns `{ success, initPoint }`); `getDictionary`/`isLocale` (Parte 1).
- Produces: form redirects the browser to `initPoint` on success; three static return pages per locale.

> O `register-form.tsx` precisa do `locale` para passar ao `registerClient` e para os textos. Obtenha o locale via `useParams()` (client component) ou receba como prop do server component que o renderiza. Use `useParams()` para manter a mudança local ao form.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/register-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const registerClient = vi.fn()
vi.mock('@/lib/actions/register', () => ({ registerClient }))
vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'pt' }) }))

import { RegisterForm } from '@/components/forms/register-form'

beforeEach(() => {
  vi.clearAllMocks()
  // jsdom has no navigation; stub the assignment target.
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
  })
})

describe('RegisterForm', () => {
  it('redirects the browser to the Mercado Pago init_point on success', async () => {
    registerClient.mockResolvedValue({ success: true, initPoint: 'https://mp/checkout/abc' })
    render(<RegisterForm />)

    await userEvent.type(screen.getByLabelText(/nome/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'secret123')
    await userEvent.type(screen.getByLabelText(/whatsapp|telefone/i), '+5547999990000')
    await userEvent.type(screen.getByLabelText(/documento|cpf|passaporte/i), '12345678900')
    await userEvent.click(screen.getByRole('button', { name: /fazer parte|economizar|cadastrar/i }))

    await waitFor(() => {
      expect(registerClient).toHaveBeenCalledWith(
        expect.objectContaining({ locale: 'pt', fullName: 'Ana' })
      )
      expect(window.location.href).toBe('https://mp/checkout/abc')
    })
  })
})
```

> Antes de implementar, **leia `components/forms/register-form.tsx`** e alinhe os `label`/`name`/`id` reais do form aos seletores do teste (ajuste os regex acima para casar com os labels que existem). O objetivo do teste — submeter e verificar o redirect ao `initPoint` — não muda.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/components/register-form.test.tsx`
Expected: FAIL — o form atual não chama `registerClient` com `locale` nem redireciona para `initPoint`.

- [ ] **Step 3: Update `register-form.tsx`**

Leia o arquivo atual e faça as mudanças mínimas:
1. `import { useParams } from 'next/navigation'`; no componente: `const params = useParams(); const locale = params.locale === 'es' ? 'es' : 'pt'`.
2. Inclua `locale` no objeto passado a `registerClient`.
3. No sucesso, em vez de mostrar a tela "Cadastro recebido", redirecione: `if (res?.initPoint) { window.location.href = res.initPoint; return }`.
4. Mantenha o restante do form (campos phone/clientType/documentType de Parte 1) como está; só adicione o que o teste exige.

(Não cole o arquivo inteiro aqui — é uma edição cirúrgica sobre o form existente. As mudanças são: import do `useParams`, `locale` no payload, e o redirect no sucesso.)

- [ ] **Step 4: Write the three return pages**

```tsx
// app/[locale]/cadastro/sucesso/page.tsx
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: PageProps<'/[locale]/cadastro/sucesso'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? '¡Pago aprobado! Tu tarjeta Bombinhas+ Econômica está activa. Revisa tu email para acceder.'
      : 'Pagamento aprovado! Seu cartão Bombinhas+ Econômica está ativo. Veja seu email para acessar.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? '¡Listo!' : 'Tudo certo!'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
```

```tsx
// app/[locale]/cadastro/pendente/page.tsx
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: PageProps<'/[locale]/cadastro/pendente'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? 'Tu pago está en proceso. Te avisaremos por email cuando se apruebe y tu tarjeta se active.'
      : 'Seu pagamento está em processamento. Avisaremos por email quando for aprovado e o cartão ativar.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? 'Pago pendiente' : 'Pagamento pendente'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
```

```tsx
// app/[locale]/cadastro/erro/page.tsx
import { isLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export default async function Page({ params }: PageProps<'/[locale]/cadastro/erro'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const msg =
    locale === 'es'
      ? 'No pudimos procesar tu pago. Puedes intentarlo de nuevo desde la página de registro.'
      : 'Não conseguimos processar seu pagamento. Você pode tentar novamente na página de cadastro.'
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-navy">{locale === 'es' ? 'Pago no completado' : 'Pagamento não concluído'}</h1>
      <p className="mt-4 text-ink">{msg}</p>
    </main>
  )
}
```

- [ ] **Step 5: Run the test + full suite + build**

Run: `npm run test:run -- tests/components/register-form.test.tsx`
Expected: PASS.

Run: `npm run test:run`
Expected: full suite green.

Run: `npm run build`
Expected: build completes; `/[locale]/cadastro/sucesso|pendente|erro` routes appear.

- [ ] **Step 6: Commit**

```bash
git add components/forms/register-form.tsx "app/[locale]/cadastro/sucesso" "app/[locale]/cadastro/pendente" "app/[locale]/cadastro/erro" tests/components/register-form.test.tsx
git commit -m "feat(cadastro): redirect to Mercado Pago checkout and add return pages"
```

---

## Self-Review

**Spec coverage (Parte 2 do design 2026-06-23):**
- Server Action cria user+client(pending)+payment(pending) → Task 3 ✅
- Cria Checkout Preference, retorna init_point → Tasks 1, 3 ✅
- Redireciona ao checkout hospedado do MP → Task 5 ✅
- Webhook valida + re-busca autenticado + atualiza payment + ativa client + expiresAt +1 ano + email → Task 4 ✅
- Idempotência (entregas duplicadas por mpPaymentId/external_reference) → Task 4 ✅
- Email rebrand + R$ 99,00 (corrige dívida da Parte 1) → Task 2 ✅
- Env novas (MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, NEXT_PUBLIC_MP_PUBLIC_KEY) → Task 1 ✅
- back_urls locale-aware → Tasks 1, 5 ✅

**Placeholder scan:** sem TBD/TODO. Duas edições são cirúrgicas sobre arquivos existentes (`register-form.tsx` na Task 5; mock de `lib/db` na Task 3) e instruem o implementador a ler o arquivo e casar nomes reais — isso é intencional (o form/test atual já existe e não deve ser colado por inteiro), não um placeholder de lógica. A lógica nova (wrapper MP, webhook, activate-payment) tem código completo.

**Type consistency:** `createCheckoutPreference`/`getMercadoPagoPayment` (Task 1) usados em Tasks 3/4 com as assinaturas definidas. `registerClient` retorna `{ success, initPoint }` (Task 3) consumido na Task 5. `applyPaymentNotification` (Task 4) consumido pelo route handler. `sendRegistrationConfirmed`/`sendCardActivated` ganham `locale` (Task 2) e são chamados com `locale` em Tasks 3/4.

**Pré-requisitos de execução / ops (não-código):**
- Conta Mercado Pago com credenciais de teste (`MP_ACCESS_TOKEN`, `NEXT_PUBLIC_MP_PUBLIC_KEY`) e o `MP_WEBHOOK_SECRET` do painel de webhooks. Os testes mockam o SDK; a verificação ponta-a-ponta (checkout real + webhook) só acontece no deploy/sandbox.
- Cadastrar a `notification_url` (`/api/webhooks/mercadopago`) no painel do Mercado Pago.
- `documentType` por `clientType`: BR usa `cpf`, estrangeiro usa `dni`/`passport` — o front (Parte 1) já tem os campos; a validação fina de qual documento por tipo pode ser endurecida na Parte 3 (rebuild do form).
