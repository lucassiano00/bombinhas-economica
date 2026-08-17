// lib/auth.config.ts
//
// Parte do NextAuth que roda no EDGE (proxy.ts). Não pode importar banco.
//
// Deploy de 17/08/2026: o proxy.ts importava `auth` de lib/auth.ts, que importa
// `db` → `neon()` no escopo do módulo. O bundle da edge function arrastava a
// camada de banco e o build do Netlify quebrava com "No database connection
// string was provided to neon()". O projeto ficou indeployável desde então.
//
// Split padrão do NextAuth v5: aqui só o que é edge-safe (callbacks que movem
// dados no token, páginas). O provider Credentials — cujo `authorize` consulta o
// banco — mora em lib/auth.ts, usado apenas no server.
//
// Guardado por tests/auth-edge-sem-banco.test.ts
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  // Vazio de propósito: o provider real precisa do banco e é adicionado em
  // lib/auth.ts. O middleware só precisa ler/verificar o JWT.
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = (token.id as string) ?? ''
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
} satisfies NextAuthConfig
