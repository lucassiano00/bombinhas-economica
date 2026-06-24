# Bombinhas+ Econômica — Design (v1)

**Data:** 2026-06-23
**Status:** Aprovado para planejamento
**Origem:** Pivô/rebrand do projeto `economize-sc` a partir de duas imagens fornecidas pelo cliente (logo "B+ Bombinhas+ Econômica" e mockup da landing page).

## 1. Visão geral

Cartão de desconto **digital** focado em **Bombinhas/SC**, voltado a turistas (incl. estrangeiros) e moradores. Crédito **anual de R$ 99,00**, com promessa de economia de **+R$ 1.500,00** no ano. Site **bilíngue Português / Español** com rotas por idioma (`/pt`, `/es`). Pagamento via **Mercado Pago** com ativação automática do cartão por webhook.

É um **pivô do projeto atual `economize-sc`**: reaproveita auth (Auth.js v5), banco (Drizzle + Neon), verificação de status por documento e o cartão digital do cliente; adapta marca, preço, idioma e o fluxo de pagamento.

### Públicos (menu do topo)
- `TURISTAS` e `MORADORES` → compradores do cartão (role `client`)
- `EMPRESAS` → parceiros que querem entrar na rede (na v1, apenas seção informativa / contato)
- `CONTATO`
- Seletor de idioma **PT / ES**

## 2. Escopo

### Dentro da v1
- Landing page bilíngue (PT/ES) com os blocos do mockup
- Cadastro de **brasileiros** (CPF) e **estrangeiros** (DNI/Passaporte)
- Checkout **Mercado Pago** (Pix e cartão), checkout hospedado
- **Ativação automática** do cartão via webhook de pagamento
- Cartão digital do cliente (após login)
- Verificação pública de status por documento (mecânica já existente)
- **Admin enxuto**: ver/gerenciar cadastros e status de pagamento, ativar/desativar manual (fallback), export CSV

### Fora da v1 (informativo ou adiado)
- Painel de parceiro + confirmação de uso de desconto (`discount_usages`)
- Telemedicina 24h → apenas **link externo** do parceiro (botão "Saiba mais"), sem fluxo no app
- Categorias por localização e Emergência 24h → **seções informativas** na landing, não diretório funcional navegável
- Dependentes (tabela mantida no schema, fora do fluxo)
- Western Union como meio de pagamento

## 3. Branding

- Paleta: **azul-marinho** (primária, ~`#0d2f5c`) + **teal/verde** (destaque, ~`#1ea896`). Substitui o tema atual em `app/globals.css` / tokens Tailwind.
- Logo "B+" como asset em `public/`.
- Renomear "Economize SC" → "Bombinhas+ Econômica" em todo o app.
- Dados de contato/rodapé via env: CNPJ, `contato@bombinhaseconomica.com.br`, atendimento 24h.
- Bandeiras de pagamento exibidas: Visa, Mastercard, Elo, Amex, Pix.

## 4. Blocos da landing page (referência do mockup)

| Bloco | Conteúdo |
|---|---|
| Header | Logo + nav (Turistas/Moradores/Empresas/Contato) + toggle PT/ES |
| Hero | "Economize de verdade em Bombinhas SC" + CTA "Quero economizar agora" |
| Destaques | Supermercado Koch, 20% Beto Carrero, 5% imóvel de temporada |
| Verificação de status | CPF · Estrangeiro · DNI ativo (✓) |
| Parceiros | Logos: Koch, Beto Carrero World, PanVel, Becker, Oceanic Aquário, Restaurante Do Zé |
| Categorias por localização | Mercado, Farmácia, Restaurante, Combustível, Sorveteria, Cafeteria, Padaria, Lazer, Artigos de praia, Beleza (informativo) |
| Emergência 24h | Reboque, Assessoria Jurídica, Chaveiro, Oficina mecânica (informativo) |
| Preço | R$ 99,00/ano + benefícios |
| Cadastro Brasileiros | Nome, WhatsApp, CPF, email/senha → checkout cartão/Pix |
| Cadastro Estrangeiros | Nome, email, DNI/Passaporte, WhatsApp → checkout Pix/cartão |
| Telemedicina 24h | Add-on R$ 99,90 — botão "Saiba mais" → link externo |
| Rodapé | Atendimento 24h, contato, CNPJ, bandeiras de pagamento |

## 5. Modelo de dados (Drizzle / Neon)

Mudanças sobre o schema atual (`lib/db/schema.ts`):

- `documentTypeEnum`: `['rg','dni']` → **`['cpf','dni','passport']`**
- Remover `paymentMethodEnum` (pagamento passa para tabela própria).
- `clients` — adicionar:
  - `phone` (text, WhatsApp)
  - `clientType` — `enum('brazilian','foreigner')`
  - `locale` (text, `'pt'|'es'`)
  - `expiresAt` (timestamp, validade anual)
  - `status` (pending/active/inactive) — **mantido**
  - remover `paymentMethod`
- **Nova tabela `payments`:**
  - `id` (uuid pk)
  - `clientId` (fk → clients)
  - `provider` (text, `'mercadopago'`)
  - `mpPreferenceId` (text)
  - `mpPaymentId` (text)
  - `amount` (numeric/integer em centavos)
  - `status` — `enum('pending','approved','rejected','refunded')`
  - `rawPayload` (jsonb/text — payload bruto do webhook para auditoria)
  - `paidAt` (timestamp, nullable)
  - `createdAt` (timestamp)
- `dependents` e `discountUsages`: permanecem no schema, **fora do fluxo v1**.
- `partners`: alimenta seções de parceiros/categorias da landing (seed inicial).

## 6. Fluxo de pagamento (Mercado Pago)

1. Cliente preenche o cadastro:
   - **BR:** nome completo, WhatsApp, CPF, email, senha
   - **Estrangeiro:** nome completo, email, DNI/Passaporte, WhatsApp, senha
2. Server Action: cria `users` + `clients`(status `pending`) + `payments`(status `pending`); cria uma **Checkout Preference** no Mercado Pago; retorna `init_point`.
3. Redireciona para o **checkout hospedado do Mercado Pago** (Pix ou cartão). **Dados de cartão nunca trafegam pelo nosso servidor** (evita escopo PCI).
4. **Webhook** `POST /api/webhooks/mercadopago`: valida assinatura/origem → consulta o pagamento na API do MP → atualiza `payments.status` → se `approved`: `client.status='active'`, `expiresAt = hoje + 1 ano`, dispara email de confirmação com instruções de acesso.
5. Cliente faz login → vê o **cartão digital**.

Idempotência: webhook deve tolerar entregas duplicadas (chave por `mpPaymentId`).

## 7. Rotas (App Router + next-intl)

```
app/[locale]/(public)/page.tsx      landing bilíngue
              /cadastro             forms BR + estrangeiro
              /verificar            verificação de status
app/[locale]/cliente/cartao         cartão digital (role=client)
app/[locale]/admin                  admin enxuto (role=admin)
app/api/webhooks/mercadopago        webhook de pagamento (fora do [locale])
app/auth/login                      login com redirect por role
```

- **i18n:** `next-intl` com rotas prefixadas por idioma (`/pt`, `/es`), dicionários de mensagens por locale. Melhor para SEO em espanhol (turista estrangeiro busca no Google em ES).
- **Middleware:** resolve locale + protege rotas por role (`/cliente`→`client`, `/admin`→`admin`). Cada Server Action revalida role server-side.

## 8. Admin enxuto (`/admin`, role=admin)

- Lista de cadastros com filtro por status (pending/active/inactive)
- Status de pagamento de cada cliente
- Ativar/desativar manualmente (fallback caso o webhook falhe)
- Export CSV
- Reaproveita auth/middleware existentes

## 9. Qualidade & infra

- **TDD** com Vitest (segue o padrão atual do repo): server actions, webhook (mock do SDK Mercado Pago) e componentes-chave com testes.
- Deploy Netlify (`@netlify/plugin-nextjs`), já configurado.
- **Novas env vars:**
  - `MP_ACCESS_TOKEN` (server)
  - `MP_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_MP_PUBLIC_KEY`
  - Branding/contato: `NEXT_PUBLIC_CNPJ`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_APP_URL`
  - Existentes mantidas: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `RESEND_API_KEY`

## 10. Decisões registradas (do brainstorming)

| Decisão | Escolha |
|---|---|
| Base do projeto | Pivô/rebrand do `economize-sc` |
| Pagamento | Gateway real com ativação automática |
| Gateway | Mercado Pago |
| Features secundárias (telemed/categorias/emergência) | Informativas na v1 |
| Alcance v1 | Público + pagamento + admin enxuto |
| Bilíngue | Rotas por idioma `/pt` `/es` (next-intl) |
