# Acabamento Visual do Produto (Pipeline Impeccable) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar o acabamento visual de todas as superfícies do produto e unificar os 4 primitivos de UI, dentro da identidade atual (navy + dourado, "O Cais"), sem rebrand.

**Architecture:** Camada de fundação (primitivos) primeiro — tudo herda dela — seguida de 4 ondas de superfícies ordenadas por visibilidade. Cada superfície passa pelo pipeline Impeccable: `critique` (mede) → elevação conforme achados (`layout`/`bolder`/`delight`) → `polish` (contraste/acabamento) → `audit` (a11y/responsivo/i18n), fechando com screenshot e nota.

**Tech Stack:** Next 16 (App Router), React 19, Tailwind v4, Auth.js v5, Drizzle + Neon, Vitest, Impeccable 3.8 (`.claude/skills/impeccable`).

## Global Constraints

- **Sem rebrand.** Manter paleta e tipografia atuais: navy estrutura, dourado ≤ 15% só ação, verde só sucesso/verificação, vermelho nunca como promoção. Fonte Plus Jakarta Sans permanece (P3 adiado).
- **Tokens são a fonte da verdade.** Usar variáveis de `app/globals.css` / `DESIGN.md`; **zero** classes off-brand (`bg-blue-600`, `text-gray-*`, `border-gray-*`, `focus:ring-blue-500`).
- **Contraste:** corpo e placeholder **≥ 4.5:1**; texto grande (≥18px ou bold ≥14px) ≥ 3:1.
- **Bans do Impeccable:** nada de gradiente roxo, cream/sand-AI, eyebrow em toda seção, gradient text, side-stripe borders, glassmorphism decorativo.
- **i18n:** todo layout valida em **PT e ES** (ES é mais longo) sem overflow, mobile/tablet/desktop.
- **Critério de pronto por superfície:** `critique` ≥ **34/40**, **0 P0 / 0 P1**.
- **Sem regressão funcional:** não quebrar cadastro/pagamento; rodar `npm run test:run` ao fim de cada onda que toque formulários.
- **Segredos:** `.env.local` nunca versionado; rota de preview temporária removida ao final.
- **AGENTS.md:** este é um Next.js com breaking changes — ler `node_modules/next/dist/docs/` antes de escrever código de rota/preview.

---

## Task 0: Baseline de render (env dummy + rota de preview)

Destrava todo o pipeline: os fluxos de screenshot do Impeccable precisam da app rodando.

**Files:**
- Create: `.env.local` (não versionado)
- Create: `app/[locale]/(public)/__preview/page.tsx` (temporária; removida na Task 9)

**Interfaces:**
- Produces: app servível em `localhost:3000`; rota `/(pt|es)/__preview` que renderiza `components/card/digital-card.tsx` e os primitivos de `components/ui/` com dados-fixture, para screenshot das telas DB-dependentes.

- [ ] **Step 1: Criar `.env.local` com valores dummy**

```bash
cat > .env.local <<'EOF'
DATABASE_URL=postgres://user:pass@localhost:5432/dummy
AUTH_SECRET=dev-only-dummy-secret-not-for-prod-0123456789
AUTH_URL=http://localhost:3000
RESEND_API_KEY=re_dummy
NEXT_PUBLIC_APP_URL=http://localhost:3000
MP_ACCESS_TOKEN=TEST-dummy
MP_WEBHOOK_SECRET=dummy
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-dummy
NEXT_PUBLIC_CNPJ=00.000.000/0001-00
NEXT_PUBLIC_CONTACT_EMAIL=contato@example.com
EOF
```

- [ ] **Step 2: Confirmar que `.env.local` está ignorado pelo git**

Run: `git check-ignore .env.local`
Expected: imprime `.env.local` (ignorado). Se não imprimir, adicionar `.env.local` ao `.gitignore` e commitar essa linha isolada.

- [ ] **Step 3: Ler a doc de rotas do Next antes de criar a rota de preview**

Read: `node_modules/next/dist/docs/` (App Router / pages). Confirmar assinatura de página com `params` localizado neste release (16.2.7).

- [ ] **Step 4: Criar a rota de preview temporária**

Renderizar, com dados-fixture, o cartão digital e cada primitivo em seus variantes. Reaproveitar os componentes reais (não recriar markup). Exemplo de fixture para o cartão: nome, status `ativo`/`pendente`, documento mascarado, validade. Marcar o arquivo com um comentário `// TEMP PREVIEW — remover ao final (plano acabamento visual)`.

- [ ] **Step 5: Subir o dev server e validar render**

Run: `npm run dev` (background) e abrir `http://localhost:3000/pt` e `http://localhost:3000/pt/__preview`
Expected: landing e preview renderizam sem erro de runtime (warnings de DB/MP são esperados nas telas que consultam dados reais; o preview usa fixtures).

- [ ] **Step 6: Capturar baseline de screenshots**

Capturar (via screenshot do Impeccable/headless) landing, cadastro/{sucesso,pendente,erro}, verificar, auth/login, e `/__preview` (cartão) — em PT e ES, mobile e desktop. Guardar como referência "antes".

- [ ] **Step 7: Commit (só a rota de preview; `.env.local` fica de fora)**

```bash
git add app/[locale]/\(public\)/__preview/page.tsx
git commit -m "chore(preview): rota temporária para screenshot de telas DB-dependentes"
```

---

## Task 1: Fundação — primitivo `button.tsx`

Tudo herda dos primitivos; eles vêm primeiro. `extract` é o comando-âncora da fundação.

**Files:**
- Modify: `components/ui/button.tsx`
- Possibly modify: `app/globals.css` (só se faltar token), `.impeccable/design.json`

**Interfaces:**
- Consumes: tokens de `app/globals.css` (`--gold`, `--gold-deep`, `--navy`, `--surface`, `--danger`), `cn` de `lib/utils`.
- Produces: `Button` on-brand com variantes `primary` (dourado/navy, pílula), `secondary` (navy/branco, `rounded-lg`), `danger`; foco visível em gold/navy. Assinatura inalterada: `Button({ variant, className, ...props })`.

- [ ] **Step 1: Rodar setup do Impeccable e o critique baseline do primitivo**

Invoke: `/impeccable critique components/ui/button.tsx`
Expected: relatório em `.impeccable/critique/` apontando classes off-brand (`bg-blue-600`, `hover:bg-blue-700`, `bg-gray-200`).

- [ ] **Step 2: Alinhar `button.tsx` aos tokens via extract**

Invoke: `/impeccable extract components/ui/button.tsx`
Aplicar: `primary` → `bg-gold text-navy font-extrabold rounded-full hover:bg-gold-deep`; `secondary` → `bg-navy text-surface rounded-lg hover:bg-navy-800`; `danger` → `bg-danger text-surface`; foco → `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`. Manter conforme `DESIGN.md §5 Buttons`.

- [ ] **Step 3: Verificar zero classes off-brand**

Run: `grep -nE "bg-blue-|bg-gray-|text-gray-|border-gray-|ring-blue-" components/ui/button.tsx`
Expected: sem resultados (exit 1 / nenhuma linha).

- [ ] **Step 4: Re-critique e screenshot via /__preview**

Invoke: `/impeccable critique components/ui/button.tsx`
Expected: 0 P1 de cor; screenshot do botão em `/__preview` mostra dourado/navy.

- [ ] **Step 5: Commit**

```bash
git add components/ui/button.tsx app/globals.css .impeccable
git commit -m "feat(ui): alinhar Button aos tokens de marca (dourado/navy)"
```

---

## Task 2: Fundação — primitivo `input.tsx`

**Files:**
- Modify: `components/ui/input.tsx`

**Interfaces:**
- Consumes: tokens `--field`, `--ink`, `--border`, `--danger`, `--gold`; `cn` de `lib/utils`.
- Produces: `Input` com fill `--field`, borda `--border`, `rounded-lg`, label em `--ink` (não `--muted`), erro em `--danger`, foco visível gold/navy. Encerra o débito de contraste do P1.

- [ ] **Step 1: Critique baseline**

Invoke: `/impeccable critique components/ui/input.tsx`
Expected: aponta `text-gray-700`, `focus:ring-blue-500`, e contraste de placeholder/label.

- [ ] **Step 2: Alinhar via extract + corrigir contraste**

Invoke: `/impeccable extract components/ui/input.tsx`
Aplicar `DESIGN.md §5 Inputs`: fill `bg-field`, `border border-border rounded-lg`, label `text-ink` peso 600, placeholder ≥ 4.5:1 (escurecer em direção ao ink), erro `border-danger` + texto abaixo, `focus-visible:ring-2 focus-visible:ring-gold`.

- [ ] **Step 3: Verificar contraste e zero off-brand**

Run: `grep -nE "text-gray-|ring-blue-|border-gray-" components/ui/input.tsx`
Expected: sem resultados.
Invoke: `/impeccable audit components/ui/input.tsx` → confirmar contraste ≥ 4.5:1 (corpo/placeholder).

- [ ] **Step 4: Commit**

```bash
git add components/ui/input.tsx .impeccable
git commit -m "feat(ui): alinhar Input aos tokens e corrigir contraste (AA)"
```

---

## Task 3: Fundação — primitivos `card.tsx` e `badge.tsx`

Agrupados: ambos pequenos, mesma natureza de alinhamento; um revisor avalia juntos.

**Files:**
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/badge.tsx`

**Interfaces:**
- Consumes: tokens `--surface`, `--border`, `--green`, `--gold`, `--muted`; `cn`.
- Produces: `Card` plano (surface + borda 1px, `rounded-xl`, padding 16–20px); `Badge` status por **cor + ponto + texto** — ativo→verde, pendente→âmbar, inativo→neutro (`DESIGN.md §5`).

- [ ] **Step 1: Critique baseline dos dois**

Invoke: `/impeccable critique components/ui/card.tsx` e `/impeccable critique components/ui/badge.tsx`

- [ ] **Step 2: Alinhar Card via extract**

Invoke: `/impeccable extract components/ui/card.tsx`
Aplicar: `bg-surface border border-border rounded-xl`, plano por padrão (sem shadow exceto onde a tela pedir), padding 16–20px. Sem cards aninhados.

- [ ] **Step 3: Alinhar Badge via extract (acessibilidade de status)**

Invoke: `/impeccable extract components/ui/badge.tsx`
Garantir status por 3 canais (cor + ponto + rótulo), pílula, cores de estado dos tokens.

- [ ] **Step 4: Verificar zero off-brand nos dois**

Run: `grep -nE "bg-blue-|bg-gray-|text-gray-|border-gray-|ring-blue-" components/ui/card.tsx components/ui/badge.tsx`
Expected: sem resultados.

- [ ] **Step 5: Re-critique e commit**

```bash
git add components/ui/card.tsx components/ui/badge.tsx .impeccable
git commit -m "feat(ui): alinhar Card e Badge aos tokens; status acessível no Badge"
```

---

## Task 4: Onda 1 — Landing (`page.tsx` + 10 seções)

Maior visibilidade; é a venda. Maior task do plano — fechar com nota e testes.

**Files:**
- Modify: `app/[locale]/(public)/page.tsx`
- Modify: `components/site/{header,hero,partners,categories,telemedicine,emergency,value-benefits,savings-status,registration,footer}.tsx`
- Modify (se preciso): `components/forms/register-form.tsx`

**Interfaces:**
- Consumes: primitivos on-brand (Tasks 1–3), tokens, dicionários `app/[locale]/dictionaries/{pt,es}.json`.
- Produces: landing com nota `critique` ≥ 34/40, 0 P0/P1.

- [ ] **Step 1: Critique baseline da landing**

Invoke: `/impeccable critique app/[locale]/(public)/page.tsx`
Expected: nota inicial (~28/40) e lista de achados por seção em `.impeccable/critique/`.

- [ ] **Step 2: Elevação conforme achados**

Aplicar apenas o que o critique apontar, nesta ordem:
- `/impeccable layout app/[locale]/(public)/page.tsx` — ritmo/espaçamento/hierarquia, "uma ação por seção".
- `/impeccable bolder <seção>` — só nas seções marcadas como "visual fraco/bland".
- `/impeccable delight <seção>` — só onde paga aluguel (ex.: cards de parceiro sobrepostos ao hero).

- [ ] **Step 3: Tratar o "formulário decorativo" da Registration (P2)**

Invoke: `/impeccable clarify components/site/registration.tsx` (e `harden` se virar form real)
Expected: o bloco não aparenta ser interativo sem ser, ou vira form funcional com estados.

- [ ] **Step 4: Polish (contraste/acabamento)**

Invoke: `/impeccable polish app/[locale]/(public)/page.tsx`
Garantir `--muted` só em metadado, corpo ≥ 4.5:1.

- [ ] **Step 5: Audit responsivo + i18n**

Invoke: `/impeccable audit app/[locale]/(public)/page.tsx`
Validar PT e ES, mobile/tablet/desktop, sem overflow. Screenshots depois vs. baseline da Task 0.

- [ ] **Step 6: Re-critique até o gate**

Invoke: `/impeccable critique app/[locale]/(public)/page.tsx`
Expected: ≥ 34/40, 0 P0/P1. Se não bater, voltar ao Step 2 nas seções pendentes.

- [ ] **Step 7: Rodar a suíte (não regredir cadastro)**

Run: `npm run test:run`
Expected: todos os testes passam.

- [ ] **Step 8: Commit**

```bash
git add components/site app/[locale]/\(public\)/page.tsx components/forms/register-form.tsx .impeccable
git commit -m "feat(landing): elevar acabamento visual ao gate (critique >=34/40)"
```

---

## Task 5: Onda 2 — Cauda de conversão (cadastro + verificar)

**Files:**
- Modify: `app/[locale]/(public)/cadastro/sucesso/page.tsx`
- Modify: `app/[locale]/(public)/cadastro/pendente/page.tsx`
- Modify: `app/[locale]/(public)/cadastro/erro/page.tsx`
- Modify: `app/[locale]/(public)/verificar/page.tsx`
- Modify (se preciso): `components/forms/status-check-form.tsx`

**Interfaces:**
- Consumes: primitivos on-brand, `Badge` de status (Task 3), tokens.
- Produces: 4 telas no gate; estados (sucesso/pendente/erro) comunicados por cor + ícone + texto.

- [ ] **Step 1: Critique de cada tela**

Invoke: `/impeccable critique` em cada uma das 4 páginas.

- [ ] **Step 2: Elevar + polish + harden dos formulários**

Invoke por tela: `layout`/`polish` conforme achados; `/impeccable harden components/forms/status-check-form.tsx` (estados de erro, edge cases, i18n). Estados de retorno usam `Badge` (cor+ícone+texto).

- [ ] **Step 3: Audit responsivo + i18n** das 4 telas (PT/ES, mobile/desktop).

- [ ] **Step 4: Re-critique até o gate** (≥ 34/40, 0 P0/P1 em cada).

- [ ] **Step 5: Rodar a suíte**

Run: `npm run test:run`
Expected: passa.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/\(public\)/cadastro app/[locale]/\(public\)/verificar components/forms/status-check-form.tsx .impeccable
git commit -m "feat(conversao): acabamento das telas de retorno e verificar (gate)"
```

---

## Task 6: Onda 3 — Auth (login + redirect)

**Files:**
- Modify: `app/[locale]/auth/login/page.tsx`
- Modify: `app/[locale]/auth/redirect/page.tsx`
- Modify (se preciso): `components/forms/login-form.tsx`

**Interfaces:**
- Consumes: primitivos on-brand, tokens.
- Produces: login e redirect no gate; `login-form` com foco visível e contraste AA.

- [ ] **Step 1: Critique de login e redirect.**

Invoke: `/impeccable critique` nas duas páginas.

- [ ] **Step 2: Elevar + polish + harden do login-form.**

Invoke: `layout`/`polish` conforme achados; `/impeccable harden components/forms/login-form.tsx` (erros de credencial, estados de loading, i18n).

- [ ] **Step 3: Audit responsivo + i18n** (PT/ES, mobile/desktop).

- [ ] **Step 4: Re-critique até o gate** (≥ 34/40, 0 P0/P1).

- [ ] **Step 5: Rodar a suíte**

Run: `npm run test:run`
Expected: passa.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/auth components/forms/login-form.tsx .impeccable
git commit -m "feat(auth): acabamento das telas de login e redirect (gate)"
```

---

## Task 7: Onda 4 — Área do cliente (cartão digital)

O artefato-assinatura de confiança pós-compra. Renderizado via `/__preview` com fixtures.

**Files:**
- Modify: `components/card/digital-card.tsx`
- Modify: `app/[locale]/cliente/cartao/page.tsx`
- Modify: `app/[locale]/cliente/layout.tsx`

**Interfaces:**
- Consumes: primitivos on-brand, `Badge` de status, tokens (`--navy` como base do cartão).
- Produces: cartão digital em navy com status (ativo/pendente) por cor + ícone + texto; tela do cliente no gate.

- [ ] **Step 1: Critique via `/__preview`**

Invoke: `/impeccable critique components/card/digital-card.tsx` (screenshot pela rota de preview com fixtures ativo e pendente).

- [ ] **Step 2: Elevar o cartão (signature)**

Invoke: `layout`/`bolder`/`delight` conforme achados — é o artefato de confiança; vale acabamento extra dentro dos tokens (navy estrutura, dourado só em ação/destaque, sombra única permitida se reforçar "cartão físico").

- [ ] **Step 3: Polish + audit**

Invoke: `/impeccable polish` e `/impeccable audit` no cartão e na tela do cliente. PT/ES, mobile/desktop. Status por 3 canais.

- [ ] **Step 4: Re-critique até o gate** (≥ 34/40, 0 P0/P1).

- [ ] **Step 5: Commit**

```bash
git add components/card/digital-card.tsx app/[locale]/cliente .impeccable
git commit -m "feat(cliente): acabamento do cartão digital e área do cliente (gate)"
```

---

## Task 8: Auditoria final de consistência cross-superfície

Garante que as ondas não divergiram entre si.

**Files:**
- Possibly modify: qualquer arquivo com drift residual encontrado.

- [ ] **Step 1: Varredura global de classes off-brand**

Run: `grep -rnE "bg-blue-[0-9]|bg-gray-[0-9]|text-gray-[0-9]|border-gray-[0-9]|ring-blue-[0-9]" components app`
Expected: sem resultados. Corrigir qualquer remanescente e re-critique a tela afetada.

- [ ] **Step 2: Conferir regras de marca**

Verificar uso do dourado (≤ 15%, só ação), verde só sucesso, vermelho nunca promoção — varrendo as telas alteradas. Ajustar desvios.

- [ ] **Step 3: Suíte completa**

Run: `npm run test:run`
Expected: passa.

- [ ] **Step 4: Commit (se houve ajuste)**

```bash
git add -A
git commit -m "fix(ui): encerrar drift residual de marca cross-superfície"
```

---

## Task 9: Limpeza — remover rota de preview temporária

**Files:**
- Delete: `app/[locale]/(public)/__preview/page.tsx`

- [ ] **Step 1: Remover a rota de preview**

Run: `git rm -r app/[locale]/\(public\)/__preview`

- [ ] **Step 2: Confirmar que nada referencia `__preview`**

Run: `grep -rn "__preview" app components`
Expected: sem resultados.

- [ ] **Step 3: Build de sanidade**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(preview): remover rota temporária de screenshot"
```

---

## Self-Review (preenchido na escrita do plano)

- **Cobertura do spec:** fundação (Tasks 1–3) cobre os 4 primitivos e o P1 de contraste; Ondas 1–4 (Tasks 4–7) cobrem todas as superfícies do escopo; baseline de render (Task 0) e limpeza (Task 9) cobrem o §5 do spec; consistência final (Task 8) cobre os guarda-corpos de marca. Critério de pronto (≥34/40, 0 P0/P1, AA, i18n) replicado em cada onda.
- **Placeholders:** nenhum "TBD/TODO"; cada passo tem comando ou invocação Impeccable concreta. As invocações `/impeccable <cmd>` são intencionalmente o "código" deste trabalho de design.
- **Consistência de tipos:** assinatura de `Button`/`Input`/`Card`/`Badge` preservada; nomes de tokens batem com `app/globals.css` (`--gold`, `--gold-deep`, `--navy`, `--navy-800`, `--field`, `--ink`, `--danger`, `--green`, `--border`, `--surface`).
