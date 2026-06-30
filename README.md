# Bombinhas+ Econômica

> Cartão de desconto digital de **Bombinhas/SC** — confiável, litorâneo e acessível. Bilíngue de verdade (PT/ES).

Aplicação web que converte turistas e moradores em assinantes de um cartão de descontos anual (**R$ 99,00/ano**, economia de **+R$ 1.500** ao longo do ano em estabelecimentos parceiros). O visitante entende o valor em segundos, paga via Mercado Pago e sai com um **cartão digital ativo na hora**; qualquer parceiro verifica o status por documento (CPF/DNI), sem app.

---

## ✨ Funcionalidades

- **Landing de conversão** bilíngue (PT/ES), mobile-first, com hero animado, prova social, passos, categorias, telemedicina e serviços de emergência.
- **Cadastro** de brasileiros (CPF) e estrangeiros (DNI/passaporte) com formulário validado e i18n completo.
- **Pagamento** via Mercado Pago (Pix ou cartão) com ativação automática do cartão.
- **Webhook** de pagamento (`/api/webhooks/mercadopago`) com verificação de assinatura.
- **Área do cliente** (gated) com o **cartão digital** do assinante.
- **Verificação de status** por documento, para parceiros confirmarem a validade do cartão.
- **Autenticação** com Auth.js v5 (next-auth).
- **i18n PT/ES** de primeira classe via dicionários por locale (`/[locale]`).
- **Sistema de motion** próprio (CSS + IntersectionObserver), com `prefers-reduced-motion` e degradação sem-JS.

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript |
| Estilo | Tailwind CSS v4 · design tokens próprios ([`DESIGN.md`](DESIGN.md)) |
| Auth | Auth.js v5 (`next-auth`) |
| Banco | [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (Postgres serverless) |
| Pagamento | [Mercado Pago](https://www.mercadopago.com.br) |
| E-mail | [Resend](https://resend.com) |
| Testes | Vitest + Testing Library (jsdom) |
| Deploy | [Netlify](https://www.netlify.com) (`@netlify/plugin-nextjs`) |

**Fontes:** Bricolage Grotesque (display) + Figtree (corpo/UI).
**Cores:** marinho profundo como estrutura, dourado como única voz de ação. Detalhes em [`DESIGN.md`](DESIGN.md).

## 📁 Estrutura

```
app/
  [locale]/              # rotas localizadas (pt | es)
    (public)/            # home, cadastro, verificar
    auth/                # login, redirect
    cliente/             # área logada — cartão digital
    api/                 # auth, webhooks/mercadopago
    dictionaries/        # strings PT/ES
  globals.css            # tokens + sistema de motion
components/
  site/                  # seções da landing (hero, steps, trust, ...)
  forms/                 # formulário de cadastro
  card/                  # cartão digital
  ui/                    # primitivos
lib/
  db/                    # schema + cliente Drizzle/Neon
  auth.ts                # Auth.js v5
  mercadopago.ts         # integração de pagamento
  email/                 # Resend
  i18n.ts                # locales
tests/                   # Vitest
DESIGN.md                # design system
```

## 🚀 Começando

### Pré-requisitos
- Node.js **20+** (o deploy usa Node 20; desenvolvido em 22)
- Um banco Postgres ([Neon](https://neon.tech) recomendado)
- Contas: Mercado Pago e Resend (para pagamento e e-mail)

### Instalação

```bash
git clone <url-do-repo>
cd economize-sc
npm install
```

### Variáveis de ambiente

Copie o exemplo e preencha com valores reais:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres (Neon) |
| `AUTH_SECRET` | Segredo do Auth.js (`openssl rand -base64 32`) |
| `AUTH_URL` | URL base da app (ex.: `http://localhost:3000`) |
| `RESEND_API_KEY` | Chave da API do Resend |
| `NEXT_PUBLIC_APP_URL` | URL pública da app |
| `MP_ACCESS_TOKEN` | Access token do Mercado Pago |
| `MP_WEBHOOK_SECRET` | Segredo do webhook do Mercado Pago |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Public key do Mercado Pago |
| `NEXT_PUBLIC_CNPJ` | CNPJ exibido no rodapé (sinal de confiança) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail de contato do rodapé |

> ⚠️ `.env.local` é ignorado pelo git. Nunca commite segredos.

### Banco de dados

```bash
npx drizzle-kit push     # aplica o schema
npm run db:seed          # popula dados de exemplo
```

### Rodar em desenvolvimento

```bash
npm run dev              # http://localhost:3000 → redireciona para /pt
```

## 📜 Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run test` | Vitest em watch |
| `npm run test:run` | Vitest uma vez (CI) |
| `npm run db:seed` | Popula o banco |

## 🧪 Testes

```bash
npm run test:run
```

Vitest + Testing Library em ambiente jsdom (cobre i18n, landing, schema, Mercado Pago, webhook e middleware).

## 🌐 Internacionalização

Todas as rotas vivem sob `/[locale]` (`pt` | `es`). As strings ficam em `app/[locale]/dictionaries/`. O espanhol é **público primário** (forte presença argentina/hispano-falante), não tradução de rodapé — a jornada em ES é tão completa quanto em PT.

## 🎨 Design system

Marca **navy + dourado**: marinho profundo carrega a estrutura (header, footer, cartão); dourado é a **única voz de ação** (CTAs, preços, destaques). Verde só para sucesso/verificação. Acessibilidade WCAG 2.2 AA (contraste, foco, alvos ≥ 44px, status por cor + ícone + texto). Detalhes completos em [`DESIGN.md`](DESIGN.md).

## ☁️ Deploy (Netlify)

Configuração em [`netlify.toml`](netlify.toml) (`@netlify/plugin-nextjs`, Node 20). Configure as variáveis de ambiente no painel da Netlify antes do build (o build de produção depende delas — ex.: `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`).

```bash
npm run build   # valida o build localmente antes de subir
```

## 🗺️ Status

Em desenvolvimento ativo. Home, cadastro, verificação, área do cliente e fluxo de pagamento implementados; acabamento visual e responsivo mobile em andamento.

## 📄 Licença

Projeto proprietário. Todos os direitos reservados.
