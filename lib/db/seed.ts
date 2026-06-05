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
