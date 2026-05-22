# Economize SC — Cartão Digital: Design Spec

**Data:** 2026-05-21  
**Status:** Aprovado  
**Stack:** Next.js 14 (App Router) · Auth.js v5 · Drizzle ORM · Neon PostgreSQL · Tailwind CSS · Netlify

---

## 1. Visão Geral do Produto

Cartão de desconto turístico digital para visitantes das praias de Santa Catarina (Bombinhas, Itapema, Meia Praia, Balneário Camboriú). O cliente paga uma taxa única de R$ 49,90 e obtém descontos em estabelecimentos parceiros da região.

**Três superfícies:**
1. **Site público** — landing page, cadastro, verificação de status
2. **Área do cliente** — exibição do cartão digital após login
3. **Painéis autenticados** — admin (Economize SC) e parceiros (estabelecimentos)

---

## 2. Arquitetura e Rotas

### Stack de tecnologia

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Auth.js v5 (Credentials provider) |
| ORM | Drizzle ORM |
| Banco de dados | Neon PostgreSQL (driver HTTP serverless) |
| Estilo | Tailwind CSS |
| E-mail | Resend |
| Deploy | Netlify (`@netlify/plugin-nextjs`) |

### Estrutura de rotas

```
app/
├── (public)/
│   ├── page.tsx                  # Landing page
│   ├── cadastro/page.tsx         # Formulário de cadastro + instruções de pagamento
│   └── verificar/page.tsx        # Verificação pública de status por RG/DNI
│
├── (cliente)/
│   └── cartao/page.tsx           # Cartão digital do cliente autenticado
│
├── (admin)/
│   ├── dashboard/page.tsx        # Visão geral + métricas
│   ├── cadastros/
│   │   ├── page.tsx              # Lista de cadastros com filtro por status
│   │   └── [id]/page.tsx         # Detalhe + ativar/desativar
│   ├── parceiros/
│   │   ├── page.tsx              # Lista de parceiros
│   │   ├── novo/page.tsx         # Criar novo parceiro
│   │   └── [id]/page.tsx         # Editar parceiro
│   └── relatorios/page.tsx       # Dashboard de relatórios + exportação CSV
│
├── (parceiro)/
│   ├── historico/page.tsx        # Histórico de clientes atendidos
│   ├── confirmar/page.tsx        # Registrar desconto aplicado
│   └── perfil/page.tsx           # Dados do estabelecimento
│
└── auth/
    └── login/page.tsx            # Login único com redirecionamento por role
```

### Middleware de proteção

`middleware.ts` na raiz lê o token Auth.js e aplica:

- `/admin/*` → exige role `admin`
- `/parceiro/*` → exige role `partner`
- `/cliente/*` → exige role `client`
- Role inválida ou sem sessão → redireciona para `/auth/login`

Toda Server Action que muta dados valida o role no servidor independentemente do middleware.

### Deploy (Netlify)

`@netlify/plugin-nextjs` converte automaticamente Server Components e Server Actions em Netlify Functions. Variáveis de ambiente necessárias: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`.

---

## 3. Schema do Banco de Dados

```sql
-- Usuários (todos os roles)
users
  id              uuid PK
  email           text UNIQUE NOT NULL
  password_hash   text NOT NULL
  role            enum('admin', 'partner', 'client') NOT NULL
  created_at      timestamp DEFAULT now()

-- Titulares do cartão
clients
  id              uuid PK
  user_id         uuid FK → users.id
  full_name       text NOT NULL
  document_type   enum('rg', 'dni') NOT NULL
  document_number text UNIQUE NOT NULL
  payment_method  enum('pix', 'western_union') NOT NULL
  status          enum('pending', 'active', 'inactive') DEFAULT 'pending'
  created_at      timestamp DEFAULT now()

-- Dependentes (até 5 por titular)
dependents
  id              uuid PK
  client_id       uuid FK → clients.id
  full_name       text NOT NULL
  document_type   enum('rg', 'dni') NOT NULL
  document_number text NOT NULL

-- Estabelecimentos parceiros
partners
  id              uuid PK
  user_id         uuid FK → users.id
  name            text NOT NULL
  category        text NOT NULL
  city            text NOT NULL
  address         text
  discount_info   text
  created_at      timestamp DEFAULT now()

-- Histórico de descontos aplicados
discount_usages
  id              uuid PK
  client_id       uuid FK → clients.id
  partner_id      uuid FK → partners.id
  applied_at      timestamp DEFAULT now()
  notes           text
```

**Regras importantes:**
- `clients.document_number` é único — usado para verificação pública de status
- A verificação (pública e de parceiros) busca primeiro em `clients.document_number`, depois em `dependents.document_number` — retornando o `status` do titular associado ao dependente
- A verificação retorna apenas `status`, sem expor nome, e-mail ou outros dados pessoais
- Dependentes não têm `user_id` próprio — o cartão do titular os cobre
- `status: pending` é o estado inicial após cadastro público
- CNPJ e e-mail de contato exibidos no rodapé são valores fornecidos pelo cliente antes do deploy (variáveis de ambiente ou constantes no código)

---

## 4. Autenticação e Roles

### Configuração Auth.js v5

- Provider: `Credentials` (email + senha com bcrypt)
- JWT com role injetado no callback de sessão
- Cookie HttpOnly, HTTPS-only em produção
- Sem "lembrar senha" na v1

### Criação de usuários por role

| Role | Quem cria | Como |
|---|---|---|
| `admin` | Setup inicial | Script de seed direto no banco |
| `partner` | Admin | Painel admin → "Novo parceiro" → cria `users` + `partners` |
| `client` | Próprio usuário | Formulário público → cria `users` + `clients` + `dependents` |

### Redirecionamento após login

| Role | Destino |
|---|---|
| `admin` | `/admin/dashboard` |
| `partner` | `/parceiro/historico` |
| `client` | `/cliente/cartao` |

---

## 5. Fluxos Principais

### Fluxo 1 — Cadastro e ativação do cartão

1. Cliente acessa landing page → clica "Quero meu crédito agora"
2. Preenche formulário: email + senha + nome + documento (RG ou DNI)
3. Adiciona dependentes (opcional, até 5)
4. Seleciona método de pagamento (PIX ou Western Union)
5. Sistema exibe instruções de pagamento: chave PIX CNPJ ou dados Western Union
6. Cadastro salvo com `status: pending`
7. E-mail enviado ao cliente com confirmação de recebimento + instruções de pagamento
8. Admin vê cadastro na fila → confirma pagamento → clica "Ativar"
9. `status` muda para `active` → e-mail de ativação enviado ao cliente
10. Cliente acessa `/cliente/cartao`

### Fluxo 2 — Exibição do cartão digital

Cliente autenticado acessa `/cliente/cartao` e vê:
- Logo Economize SC
- Nome completo do titular
- Status: `● ATIVO` (verde) ou `● INATIVO` (cinza)
- Lista de dependentes cadastrados
- Instrução para apresentar ao estabelecimento

### Fluxo 3 — Verificação pública de status

1. Qualquer pessoa acessa `/verificar`
2. Digita RG ou DNI (titular ou dependente)
3. Sistema busca em `clients` e depois em `dependents`, retorna apenas `ATIVO` ou `INATIVO`

### Fluxo 4 — Parceiro registra desconto

1. Parceiro faz login → `/parceiro/confirmar`
2. Digita RG/DNI do cliente (titular ou dependente)
3. Sistema verifica `status: active` do titular associado
4. Parceiro confirma que o desconto foi aplicado
5. Registro salvo em `discount_usages`

### Fluxo 5 — Admin gerencia cadastros

1. Admin → `/admin/cadastros` com filtro: Pendente | Ativo | Inativo
2. Abre detalhe do cadastro
3. Confirma pagamento manualmente
4. Clica "Ativar" → `status: active` ou "Desativar" → `status: inactive`

### Fluxo 6 — Admin exporta relatório

1. Admin → `/admin/relatorios`
2. Visualiza: total de vendas, cartões ativos, usos por parceiro
3. Clica "Exportar CSV" → download com dados filtrados por período

---

## 6. Componentes

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx                # ATIVO / INATIVO
│   └── Card.tsx
│
├── landing/
│   ├── Hero.tsx                 # Logo + frase + foto + CTA
│   ├── Benefits.tsx             # Grid de segmentos por cidade
│   ├── HowItWorks.tsx           # 3 passos visuais
│   └── ClosingSection.tsx       # Foto de praia SC + mensagem final
│
├── forms/
│   ├── RegisterForm.tsx         # Titular + dependentes + pagamento
│   ├── StatusCheckForm.tsx      # Campo RG/DNI + resultado
│   └── LoginForm.tsx
│
├── card/
│   └── DigitalCard.tsx          # Exibição do cartão do cliente
│
├── admin/
│   ├── RegistrationTable.tsx
│   ├── PartnerTable.tsx
│   └── ReportsChart.tsx
│
└── partner/
    ├── UsageHistory.tsx
    └── ConfirmDiscountForm.tsx
```

---

## 7. Landing Page — Conteúdo

| Seção | Conteúdo |
|---|---|
| **Hero** | Logo Economize SC + "Pague R$49,90 e economize entre R$500 e R$1.000 nas suas férias" + foto de família na praia + botão "Quero meu crédito agora" |
| **Benefícios** | Cards/tabs por cidade (Bombinhas, Itapema, Meia Praia, Balneário Camboriú) com ícones por segmento: mercados, combustível, farmácias, artigos de praia, Banana Bolt, barco pirata, pubs, pizzarias, sorveterias, restaurantes, açougues, serviços de emergência, padarias, Beto Carreiro, parques aquáticos, compras em Brusque |
| **Como funciona** | 3 passos: Cadastre-se → Pague R$49,90 → Apresente o cartão e economize |
| **Mensagem final** | Fundo com foto de praia SC + "Desejamos a melhor temporada para você e sua família, economizando o tempo todo!" |
| **Rodapé** | Política de Cookies · Segurança e Privacidade · CNPJ · E-mail de contato |

---

## 8. E-mails Transacionais

| Evento | Destinatário | Conteúdo |
|---|---|---|
| Cadastro recebido | Cliente | Confirma recebimento + instruções de pagamento (PIX ou Western Union) |
| Cartão ativado | Cliente | Notifica ativação + link para `/cliente/cartao` |

Provedor: **Resend** (integração nativa com Next.js Server Actions).

---

## 9. Fora do Escopo (v1)

- App mobile nativo
- Pagamento automático (PIX/WU confirmado manualmente pelo admin)
- "Lembrar senha" / recuperação de senha
- Notificações push
- Multi-idioma (PT-BR only na v1)
- Geolocalização automática de estabelecimentos
