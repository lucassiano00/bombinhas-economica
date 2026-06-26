---
target: landing — app/[locale]/(public)/page.tsx
total_score: 26
p0_count: 0
p1_count: 4
timestamp: 2026-06-25T20-20-31Z
slug: app-locale-public-page-tsx
---
# Critique — Landing Bombinhas+ Econômica (`app/[locale]/(public)/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Toggle de idioma mostra ativo; OK para landing |
| 2 | Match System / Real World | 4 | Bilíngue real PT/ES, linguagem direta — forte |
| 3 | User Control and Freedom | 3 | Toggle PT/ES e navegação claros |
| 4 | Consistency and Standards | 2 | Primitivos off-brand (botão azul) vs landing dourada; 3 cores de CTA competindo |
| 5 | Error Prevention | 2 | "Formulário" da seção Registration é decorativo (divs, não inputs) — parece interativo, não é |
| 6 | Recognition Rather Than Recall | 3 | Nav e rótulos claros |
| 7 | Flexibility and Efficiency | 3 | CTA direto ao /cadastro |
| 8 | Aesthetic and Minimalist Design | 2 | 8 seções empilhadas + categorias arco-íris = risco do "mockup poluído" |
| 9 | Error Recovery | 2 | Não exercido na landing (erros vivem em /cadastro) |
| 10 | Help and Documentation | 2 | Contato só no rodapé; sem ajuda contextual |
| **Total** | | **26/40** | **Aceitável — melhorias significativas antes de "profissional"** |

## Anti-Patterns Verdict

**LLM assessment:** NÃO grita "IA fez isso" — o hero com navy+dourado, imagem real e bilinguismo têm intenção e identidade. MAS dois pontos puxam para o genérico: (1) **Plus Jakarta Sans** é fonte da lista reflex-reject (segura, comum, sem assinatura própria); (2) **categories.tsx** com arco-íris de cores satura a tela e aproxima do "cupom Groupon" que o PRODUCT.md proíbe.

**Deterministic scan:** detector encontrou **6 cores fora da paleta** em `components/site/categories.tsx` (`#ec4899`, `#db2777`, `#7c3aed`, `#92400e`, `#eab308`, `#0891b2`) + `#32bcad` inline (pix) em `registration.tsx`. São advisories, mas confirmam drift de disciplina cromática.

**Visual overlays:** não executados nesta passagem (revisão de fonte + detector). Overlay no browser disponível como próximo passo via dev server (porta 3000).

## Overall Impression

A landing tem **commitment visual real** — navy+gold é confiável e litorâneo, exatamente o brief. O que falta para "extremamente profissional" não é ousadia, é **disciplina e consistência**: o sistema diz "dourado é a única voz de ação" mas a tela mostra CTAs dourado (hero), verde (BR) e azul (estrangeiro) competindo; os primitivos de UI ainda são azul-stock; e as categorias quebram a paleta. A maior oportunidade: **uma só voz de ação e uma paleta governada**.

## What's Working

1. **Hero com identidade** — gradiente navy sobre foto real, dourado no CTA pílula, manchete black bilíngue. Confiável sem ser frio.
2. **Bilinguismo de primeira classe** — PT/ES em pé de igualdade em cada componente, não tradução de rodapé. Cumpre o princípio nº 3 do PRODUCT.md.
3. **Cards de parceiro sobrepostos ao hero** — elevação assinada que cria sensação de "cartões físicos".

## Priority Issues

- **[P1] Três cores de ação competindo.** Hero usa CTA dourado; form BR usa CTA verde; form estrangeiro usa CTA azul. O DESIGN.md declara "A Regra do Sinal Dourado" (dourado = única ação). Verde/azul como fundo de botão roubam o sinal e diluem a hierarquia.
  - **Fix:** CTA primário sempre dourado/navy. Verde e azul ficam como *marcadores de jornada* (faixa de cabeçalho do card BR/estrangeiro), não como cor do botão. Botão = dourado em ambos.
  - **Comando:** `/impeccable colorize` (governar paleta de ação) + `/impeccable polish`

- **[P1] Categorias arco-íris.** `categories.tsx` usa 6 cores fora da paleta (rosa, roxo, marrom...), aproximando do "cupom Groupon" proibido.
  - **Fix:** mapear categorias para a família funcional já documentada (teal/verde/azul/navy) ou tons da rampa; no máximo 1 acento por categoria dentro do sistema.
  - **Comando:** `/impeccable quieter categories.tsx`

- **[P1] Primitivos de UI off-brand.** `button.tsx` (`bg-blue-600`), `input.tsx` (`text-gray-700`, `focus:ring-blue-500`), `badge.tsx`, `card.tsx` ignoram os tokens de marca. Qualquer tela nova construída sobre eles nasce errada.
  - **Fix:** reescrever os 4 primitivos com tokens (gold/navy/ink/field). Foco em gold/navy, não blue-500.
  - **Comando:** `/impeccable extract` + `/impeccable polish components/ui`

- **[P1] Contraste de `--muted` nos formulários.** Labels e placeholders em `text-muted` (#64748b) sobre `bg-field` (#f7f9fb) ficam ~4.3:1 — abaixo do AA 4.5:1 que o PRODUCT.md exige (e o usuário lê sob sol).
  - **Fix:** texto de campo em `--ink`; reservar `--muted` para metadados curtos sobre branco puro.
  - **Comando:** `/impeccable audit` (varredura WCAG) + `/impeccable polish`

- **[P2] "Formulário" decorativo na Registration.** Os campos são `<div>` estáticos que parecem inputs mas só o CTA navega. Num produto trust-first, parecer interativo sem ser arranha a credibilidade (red flag da persona Riley).
  - **Fix:** ou rotular claramente como prévia ("Veja como é rápido →") ou tornar os campos reais. Não simular interatividade.
  - **Comando:** `/impeccable clarify`

## Persona Red Flags

**Jordan (Primeiro contato):** vê três botões de cores diferentes dizendo "QUERO FAZER PARTE/PARTICIPAR" — qual é o certo para mim? A diferenciação BR vs estrangeiro está na faixa do card, mas a cor do botão não ensina isso de imediato.

**Sam (Acessibilidade):** labels de formulário em cinza-médio sobre fundo tinto reprovam contraste AA; toggle de idioma inativo em `text-white/55` é baixo contraste. Bandeiras emoji como único marcador de idioma falham em alguns SOs (mitigado por "PT"/"ES" ao lado — bom).

**Casey (Mobile sob sol):** 8 seções empilhadas = scroll longo no celular; o valor (R$99/economia +R$1.500) precisa aparecer mais cedo. CTA do hero está no thumb-reach — bom.

## Minor Observations

- Fonte **Plus Jakarta Sans** é segura mas sem assinatura; ponto a revisitar se quiser voz tipográfica própria (sem trocar a legibilidade do corpo).
- `bg-[#32bcad]` (pix) inline em `registration.tsx` — extrair para token de marca de pagamento.
- 8 seções no `<main>` — auditar se cada uma paga aluguel (princípio "respiro e hierarquia").

## Questions to Consider

- E se houvesse **uma só cor de ação** na tela inteira, e a diferença BR/estrangeiro vivesse só na moldura do card?
- As **categorias** precisam de 6 cores, ou o sistema fica mais confiável (menos "cupom") com uma paleta governada?
- O **valor concreto** (economia de +R$1.500) aparece cedo o bastante para um turista decidindo em segundos no celular?
