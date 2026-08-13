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
export const planEnum = pgEnum('plan', ['individual', 'casal', 'familia'])
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
  // Default 'familia': as linhas anteriores foram vendidas no preço único de
  // R$ 99 com 4 dependentes, que é exatamente o plano família.
  plan: planEnum('plan').notNull().default('familia'),
  // ISO 3166-1 alpha-2. Default BR só para as linhas que já existiam antes do
  // campo entrar no cadastro (cliente pediu país em 05/08).
  country: text('country').notNull().default('BR'),
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
  // Cliente (05/08): "os dependentes também têm que ter esses dados".
  phone: text('phone').notNull().default(''),
  country: text('country').notNull().default('BR'),
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
