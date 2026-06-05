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
