---
target: app/[locale]/(public)/page.tsx
total_score: 34
p0_count: 0
p1_count: 0
timestamp: 2026-06-26T01-43-54Z
slug: app-locale-public-page-tsx
---
# Critique (run 3 — post Task-4 elevation) — Landing Bombinhas+ Econômica

## Design Health Score

| # | Heuristic | Score | Δ | Key Issue |
|---|-----------|-------|---|-----------|
| 1 | Visibility of System Status | 3 | — | Status widget now has explanatory subtitle; still somewhat abstract for first-time visitors |
| 2 | Match System / Real World | 4 | — | Price in hero copy; Mercado Pago (not PIX) for both card types; bilingual parity |
| 3 | User Control and Freedom | 3 | — | Mobile hamburger nav added (≥44px targets); language toggle unchanged; no advanced shortcuts (expected for landing) |
| 4 | Consistency and Standards | 4 | ▲+1 | Uppercase tracking eyebrow anti-pattern eliminated from Partners, Categories, Emergency; CTA pill shape now consistent (rounded-full) across all sections; Registration pattern unified |
| 5 | Error Prevention | 4 | ▲+2 | P2 registration deception fully resolved — no fake interactive fields; "O que você vai precisar" checklist is clearly informational; CTAs link unambiguously to /cadastro |
| 6 | Recognition Rather Than Recall | 3 | — | Solid color category tiles (rounded-2xl, filled bg) are more scannable than hollow circles; partner logos unchanged |
| 7 | Flexibility and Efficiency | 4 | ▲+1 | Mobile nav added; pre-footer CTA added; price reassurance in registration section; multiple CTA entry points |
| 8 | Aesthetic and Minimalist Design | 4 | ▲+1 | Solid color category tiles are bold and brand-correct; eyebrow anti-pattern removed; value-benefits text xs→sm; hero sub-copy updated with price anchor |
| 9 | Error Recovery | 2 | — | Not exercised on landing; no form to recover from (by design) |
| 10 | Help and Documentation | 3 | ▲+1 | Pre-footer CTA "Pronto para economizar?" + R$99/year + gold button; price in hero; status widget has explanatory subtitle |
| **Total** | | **34/40** | **▲+6** | **Good — gate met, 0 P0, 0 P1** |

## Anti-Patterns Verdict

**LLM assessment**: No AI slop tells detected in the final state. The site has a clear visual identity (navy + gold), intentional section variety, and brand-specific component patterns that don't read as training-data defaults.

**Deterministic scan**: 0 findings across all components in `components/site/`. Detector clean.

## What Changed Since Run 2

- **[RESOLVED P2] Registration deception.** Removed fake interactive form fields. Replaced with a clear "O que você vai precisar" checklist (non-interactive by design) + Mercado Pago payment info + pill CTA. Section title "Faça parte em minutos" sets correct expectations.
- **[FIXED] Stale payment copy.** PIX-only badge for foreigners replaced with Mercado Pago (cartão ou Pix) for both BR and foreigner registration cards.
- **[FIXED] Uppercase eyebrow anti-pattern.** Removed tracked uppercase headings from Partners ("ALGUNS DE NOSSOS PARCEIROS" → "Nossos parceiros em Bombinhas" + subtitle), Categories ("CATEGORIAS DE DESCONTOS POR LOCALIZAÇÃO" → "Descontos em toda a cidade" + subtitle), and Emergency (dropped tracking, kept font-black red for emergency urgency).
- **[BOLDER] Category tiles.** Hollow border-only circles → solid color rounded-2xl tiles (14×14, filled bg per brand palette, white/navy icon per contrast). Visually decisive; contrast-correct per WCAG 1.4.11 (teal tiles use navy icon, dark tiles use white icon).
- **[LAYOUT] Hero sub-copy.** Added price anchor to sub-copy: "por apenas R$ 99,00/ano." Converts visitors before they scroll.
- **[LAYOUT] Value-benefits.** Benefit text size xs → sm for legibility.
- **[CLARIFY] Status widget.** Added subtitle explaining what verification means: "Qualquer parceiro verifica seu cartão por CPF ou DNI — sem app, sem complicação."
- **[MOBILE] Header hamburger nav.** Header converted to client component with useState. Menu button ≥44×44px touch target. ARIA expanded/controls/label attributes.
- **[DELIGHT] Footer pre-CTA.** Added "Pronto para economizar?" block above contact row: headline + price + gold pill CTA. Last conversion opportunity before visitor exits.

## Remaining Observations (no P0/P1)

- **[P3] Telemedicine price "R$ 99,90".** This appears to be a separate telemedicine service add-on price, distinct from the R$ 99,00/year card price. Left as-is per task brief (only "R$ 49,90" was flagged as stale). Verify with product team if this is intentional.
- **[P3] Registration CTA label.** "O que você vai precisar" section label uses `uppercase tracking-wide text-muted` — the only remaining uppercase tracked text. This is a small informational label (not a section heading), so it doesn't trigger the eyebrow anti-pattern.
- **[P3] H9 (Error Recovery) = 2.** Inherent to a landing page with no interactive forms. Cannot be improved without adding interactivity out of scope.
