# Spec — Acabamento visual do produto (pipeline Impeccable)

- **Data:** 2026-06-25
- **Projeto:** Bombinhas+ Econômica
- **Branch base:** `feat/bombinhas-economica`
- **Status:** Aprovado para planejamento

## 1. Objetivo

Elevar o **acabamento visual renderizado** de todas as superfícies do produto e
**unificar os primitivos de UI**, dentro da identidade atual (navy + dourado,
north star "O Cais"). **Não** é troca de marca nem nova direção visual.

O motor do trabalho é o **Impeccable** (já instalado, `.claude/skills/impeccable`),
escolhido para extrair o máximo do investimento já feito em `PRODUCT.md`,
`DESIGN.md`, `.impeccable/design.json` e nos baselines de `critique`.

## 2. Contexto / estado atual

- Backend e fluxo completos: cadastro → Mercado Pago → webhook → ativação; e-mail
  (Resend); Auth.js v5; Drizzle + Neon; testes cobrindo register/webhook/email.
- i18n PT/ES real sob `app/[locale]` com dicionários.
- Landing completa: 10 seções em `components/site/`.
- Design system maduro e documentado (`DESIGN.md`, `globals.css` com tokens,
  `.impeccable/design.json` com ramps tonais).
- Baseline Impeccable mais recente: **28/40 ("Good", limite inferior), 0 P0, 2 P1.**

### Gargalos confirmados pelo usuário

1. **Visual renderizado fraco** — telas não parecem profissionais o bastante,
   independentemente da conformidade de tokens. Acabamento, não rebrand.
2. **Inconsistência de primitivos** — `components/ui/{button,input,card,badge}.tsx`
   ainda usam Tailwind cru off-brand (ex.: `button.tsx` → `bg-blue-600 text-white`;
   `input.tsx` → `text-gray-700`, `focus:ring-blue-500`). A landing já usa tokens;
   os primitivos não.

P1 adicional do relatório: **contraste de `--muted`** (~4.3–4.6:1) nos formulários,
abaixo do AA confortável.

## 3. Escopo

Produto inteiro, em camadas (fundação → ondas por visibilidade).

### Fundação (primeiro — tudo herda daqui)

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`

Comando-âncora: `extract`. Resultado: primitivos 100% on-brand, zero classes
off-brand (`bg-blue-600`, `text-gray-*`, `border-gray-*`, `focus:ring-blue-500`).

### Onda 1 — Landing (maior visibilidade)

- `app/[locale]/(public)/page.tsx` + as 10 seções de `components/site/`
  (hero, partners, categories, telemedicine, emergency, value-benefits,
  savings-status, registration, footer, header).
- Formulário hospedado: `components/forms/register-form.tsx` (P2 "formulário
  decorativo" tratado aqui via `clarify`/`harden`).

### Onda 2 — Cauda de conversão

- `app/[locale]/(public)/cadastro/sucesso/page.tsx`
- `app/[locale]/(public)/cadastro/pendente/page.tsx`
- `app/[locale]/(public)/cadastro/erro/page.tsx`
- `app/[locale]/(public)/verificar/page.tsx` + `components/forms/status-check-form.tsx`

### Onda 3 — Auth

- `app/[locale]/auth/login/page.tsx` + `components/forms/login-form.tsx`
- `app/[locale]/auth/redirect/page.tsx`

### Onda 4 — Área do cliente

- `app/[locale]/cliente/cartao/page.tsx` + `components/card/digital-card.tsx`
  (artefato-assinatura de confiança pós-compra)
- `app/[locale]/cliente/layout.tsx`

## 4. Fluxo por superfície

Cada superfície segue o pipeline Impeccable:

1. **`critique <alvo>`** — mede o baseline (heurísticas + nota), grava em
   `.impeccable/critique/`.
2. **Elevação conforme o critique** (não aplicar tudo cegamente):
   - `layout` — ritmo, espaçamento, hierarquia.
   - `bolder` — quando o critique acusar "visual fraco/bland".
   - `delight` — só onde paga aluguel em confiança/clareza.
3. **`polish <alvo>`** — contraste AA, foco visível, acabamento final.
4. **`audit <alvo>`** — a11y, responsivo, PT/ES.

Cada superfície fecha com **screenshot antes/depois** e nota registrada.

Os formulários (`components/forms/`) recebem `harden`/`clarify` junto da onda da
tela que os hospeda.

## 5. Baseline de render (passo 0 — destrava o pipeline)

Não existe `.env`; os fluxos de screenshot do Impeccable precisam rodar a app.

- Criar `.env.local` com valores **dummy** para `NEXT_PUBLIC_*` e segredos →
  landing, retornos de cadastro e login renderizam sem DB.
- Para telas dependentes de DB/sessão (cartão do cliente), criar uma **rota de
  preview temporária** renderizando os componentes com dados-fixture; **remover ao
  final** do trabalho.
- Nunca commitar credenciais reais; `.env.local` fica fora do versionamento.

## 6. Critério de pronto (por superfície)

- `critique` ≥ **34/40** e **0 P0 / 0 P1**.
- Contraste de corpo e placeholder **≥ 4.5:1** verificado (encerra o débito de
  `--muted`).
- Primitivos: **zero** classes off-brand restantes.
- Responsivo mobile/tablet/desktop **sem overflow**, validado em **PT e ES**
  (texto ES costuma ser mais longo).
- Marca preservada conforme `DESIGN.md`: navy como estrutura, dourado ≤ 15% só
  para ação, verde só para sucesso/verificação, vermelho nunca como promoção.

## 7. Riscos e guarda-corpos

- **Sem rebrand.** Identidade atual é boa. Bans do Impeccable valem: nada de
  gradiente roxo, cream/sand-AI, eyebrows em toda seção, gradient text,
  side-stripe borders, glassmorphism decorativo.
- **Custo de tokens.** Pipeline é intensivo; a ordem por visibilidade permite
  parar após qualquer onda já tendo entregue as telas mais importantes.
- **Escopo controlado.** "Visual fraco" não vira redesign; elevação fica dentro
  dos tokens.
- **Regressão funcional.** Acabamento não pode quebrar o fluxo de
  cadastro/pagamento; rodar `npm run test:run` ao final de cada onda que toque
  formulários.

## 8. Fora de escopo

- Troca de paleta, tipografia-assinatura nova (Jakarta fica; P3 adiado), ou
  redesenho de marca.
- Mudanças de backend, schema, ou lógica de pagamento.
- Refatorações não relacionadas ao acabamento visual.

## 9. Entregáveis

- 4 primitivos on-brand.
- 4 ondas de superfícies polidas, cada uma com nota `critique` ≥ 34/40.
- Screenshots antes/depois por superfície.
- Débito de contraste `--muted` encerrado.
- Rota de preview temporária removida; `.env.local` não versionado.
