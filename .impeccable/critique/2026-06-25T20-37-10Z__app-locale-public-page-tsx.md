---
target: landing — app/[locale]/(public)/page.tsx
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-25T20-37-10Z
slug: app-locale-public-page-tsx
---
# Critique (run 2) — Landing Bombinhas+ Econômica (`app/[locale]/(public)/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | — | OK para landing |
| 2 | Match System / Real World | 4 | — | Bilíngue forte |
| 3 | User Control and Freedom | 3 | — | Toggle PT/ES claro |
| 4 | Consistency and Standards | 3 | ▲ | CTAs unificados em dourado; primitivos `components/ui` ainda off-brand |
| 5 | Error Prevention | 2 | — | "Form" da Registration ainda decorativo |
| 6 | Recognition Rather Than Recall | 3 | — | Nav claro |
| 7 | Flexibility and Efficiency | 3 | — | CTA direto |
| 8 | Aesthetic and Minimalist Design | 3 | ▲ | Categorias governadas (arco-íris removido); 8 seções ainda a auditar |
| 9 | Error Recovery | 2 | — | Não exercido na landing |
| 10 | Help and Documentation | 2 | — | Contato só no rodapé |
| **Total** | | **28/40** | **▲ +2** | **Good (limite inferior) — fundação sólida, faltam 2 P1** |

## What Changed Since Run 1

- **[RESOLVIDO P1] Voz de ação única.** Os CTAs de cadastro BR e estrangeiro agora são dourado/navy; verde e azul recuaram para a faixa de cabeçalho (marcador de jornada). "A Regra do Sinal Dourado" cumprida.
- **[RESOLVIDO P1] Categorias governadas.** As 10 categorias usam só a família documentada (navy/navy-800/teal/green/blue); 6 cores fora da paleta eliminadas; vermelho removido do uso de categoria. Detector: 0 achados (era 6).

## Remaining Priority Issues

- **[P1] Primitivos de UI off-brand.** `button.tsx` (`bg-blue-600`), `input.tsx` (`text-gray-700`, `focus:ring-blue-500`), `card.tsx`, `badge.tsx`. → `/impeccable extract` + `/impeccable polish components/ui`
- **[P1] Contraste de `--muted` nos formulários.** Labels/placeholders da Registration ainda em `text-muted` (~4.3:1 < AA). → `/impeccable audit` + `/impeccable polish`
- **[P2] "Formulário" decorativo** na Registration parece interativo. → `/impeccable clarify`
- **[P3] Fonte Jakarta** sem assinatura própria; revisitar se quiser voz tipográfica. → `/impeccable typeset`

## Overall Impression

A disciplina de cor entrou: a tela agora ensina onde clicar (dourado = ação) e parou de flertar com o "cupom Groupon". O caminho de 28 → ~34 é mecânico agora: alinhar os 4 primitivos aos tokens e corrigir o contraste dos campos.
