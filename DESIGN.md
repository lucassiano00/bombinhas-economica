<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Bombinhas+ Econômica
description: Cartão de desconto digital de Bombinhas/SC — confiável, litorâneo, acessível.
---

# Design System: Bombinhas+ Econômica

## 1. Overview

**Creative North Star: "O Cais — confiança à beira-mar"**

Um cais é litorâneo, sólido e público: você chega por ele, pisa firme e se sente seguro à beira da água. É exatamente o que esta marca precisa transmitir — alguém de outro país ou de outra cidade paga **antecipado** por um cartão de desconto e precisa confiar em segundos. O sistema visual é, antes de tudo, **confiável**: estrutura clara, cor com propósito, nada que cheire a promoção barata ou a banco frio. Sobre essa base de confiança vem o **calor litorâneo** de Bombinhas (azul de mar profundo, verde-água, areia quente) e a **acessibilidade** de uma linguagem direta, legível e bilíngue de verdade (PT/ES em pé de igualdade).

O sistema **rejeita** quatro coisas, herdadas das anti-references do PRODUCT.md: a estética de **cupom barato / Groupon** (vermelho gritante, "OFERTA!!!", layout espremido); o **banco corporativo frio** (cinza, institucional, sem alma); o **template de IA genérico** (gradiente roxo, cards aninhados, fontes batidas, gray-on-color); e o **excesso poluído** do mockup de referência (informação empilhada sem respiro). Cada decisão visual paga aluguel em confiança e clareza, ou não entra.

**Key Characteristics:**
- Confiança como atributo número um: estrutura sólida, hierarquia firme, prova social visível.
- Calor litorâneo: paleta de mar e areia, nunca cinza institucional.
- Respiro e hierarquia: uma ação clara por seção; densidade só onde agrega.
- Bilíngue de primeira classe: layouts que respiram com textos PT e ES sem quebrar.
- WCAG 2.2 AA: contraste real, foco visível, status por cor + ícone + texto.

## 2. Colors

Paleta litorânea de confiança: um mar profundo como base, um verde-água como voz de ação, areia quente para aquecer os neutros. Valores-âncora vêm do próprio logo "B+"; a rampa final (tons claros/escuros) será resolvida na implementação em OKLCH.

### Primary
- **Marinho Profundo** (âncora ~`#0D2F5C`, do logo): a cor da confiança. Carrega cabeçalhos, blocos de destaque, tipografia de título e a barra de navegação. É a base sólida do "cais".

### Secondary
- **Verde-Água** (âncora ~`#1EA896`, do logo): a voz de ação. Reservada para CTAs primários, selos de verificação, links e estados ativos. É o sinal de "siga em frente com segurança".

### Tertiary
- **Areia Quente** (âncora `[a resolver na implementação]`, off-white amorno): aquece grandes superfícies neutras e separa seções sem usar cinza frio. É o calor litorâneo que afasta o tom de banco corporativo.

### Neutral
- **Tinta** (âncora `[a resolver]`, quase-preto levemente azulado): corpo de texto; contraste ≥ 4.5:1 sempre.
- **Superfície** (âncora `[a resolver]`, branco/quente): fundo base de cartões e seções.
- **Traço** (âncora `[a resolver]`, neutro suave): bordas e divisórias de 1px.

### Named Rules
**A Regra do Sinal Verde.** O Verde-Água é a cor da *ação confiável*. Aparece em ≤ 15% de qualquer tela e quase sempre significa "pode seguir": CTA, verificado, ativo. Sua raridade é o que faz o usuário saber para onde clicar.

**A Regra do Vermelho Proibido.** Vermelho gritante de promoção é **proibido** como cor de marca. Vermelho só existe como *estado de erro/destrutivo*, nunca para vender desconto. Desconto se comunica com confiança (marinho + verde), não com urgência de cupom.

## 3. Typography

**Display Font:** uma sans geométrica-humanista, peso bold/black `[família a escolher na implementação]` (na linha do próprio logotipo "Bombinhas+": encorpada, levemente arredondada, confiante).
**Body Font:** a mesma família em pesos regular/medium `[a confirmar]`.
**Label/Mono Font:** nenhuma distinta por enquanto.

**Character:** uma única família sans em vários pesos — sem par de fontes para não correr risco de combinação batida. Geométrica o bastante para parecer moderna e confiável, humanista o bastante para ser calorosa e altamente legível em celular, sob sol, em PT e ES.

### Hierarchy
- **Display** (bold/black, `clamp()` máx ≤ 6rem, line-height ~1): manchetes de hero ("Economize de verdade em Bombinhas SC").
- **Headline** (bold, ~2rem): títulos de seção ("Alguns de nossos parceiros").
- **Title** (semibold, ~1.25rem): títulos de card e blocos.
- **Body** (regular, ~1rem, line-height ~1.6): texto corrido; largura máx 65–75ch.
- **Label** (medium, ~0.8rem, letter-spacing leve, caixa alta opcional): rótulos de categoria, badges, nav.

### Named Rules
**A Regra da Família Única.** Uma só família de tipos, vários pesos. Emparelhar duas sans parecidas é **proibido**. O contraste vem do peso e do tamanho, não de uma segunda fonte.

**A Regra do Texto Legível Sob Sol.** Corpo nunca em cinza-claro "por elegância": contraste ≥ 4.5:1 sempre. Este usuário lê na praia, no celular, na pressa.

## 4. Elevation

Sistema **plano por padrão**. Motion responsiva (não coreografada) implica profundidade discreta: superfícies descansam planas, sombras aparecem só como **resposta a estado** (hover, foco, card elevado/destacado). Nada de sombras pesadas estilo 2014. A separação entre seções vem de cor (marinho/areia) e espaço, não de caixas sombreadas.

### Named Rules
**A Regra do Plano em Repouso.** Superfícies são planas paradas. Sombra só surge como reação (hover, foco, elevação intencional de um card de destaque). Se uma sombra existe sem interação, ela está sobrando.

## 5. Components

_Nenhum componente construído ainda (seed). Os primitivos — botão (primário verde-água, secundário, ghost), input bilíngue, card de parceiro/destaque, badge de status (verificado), navegação com toggle PT/ES — serão sintetizados a partir destes tokens quando o frontend começar, e este arquivo será re-rodado em scan mode para capturá-los._

## 6. Do's and Don'ts

### Do:
- **Do** usar o Marinho Profundo como base de confiança e o Verde-Água só para ação ("A Regra do Sinal Verde").
- **Do** aquecer os neutros com Areia Quente em vez de cinza frio.
- **Do** garantir contraste de corpo ≥ 4.5:1 e alvos de toque ≥ 44px.
- **Do** comunicar status por **cor + ícone + texto** (nunca só cor) — verificação de CPF/DNI, ativo/pendente.
- **Do** dar respiro: uma ação clara por seção, hierarquia firme.
- **Do** projetar cada layout para respirar com texto em **PT e ES** sem quebrar.

### Don't:
- **Don't** parecer **cupom barato / Groupon**: nada de vermelho gritante, "OFERTA!!!", ou layout espremido de baixa confiança.
- **Don't** parecer **banco corporativo frio**: nada de cinza institucional, genérico, sem alma.
- **Don't** cair no **template de IA genérico**: proibido gradiente roxo, cards aninhados, fontes batidas, gray-on-color.
- **Don't** empilhar tudo como o **mockup poluído** de referência: densidade só onde agrega; o resto respira.
- **Don't** usar vermelho como cor de marca — vermelho é só erro/estado destrutivo.
- **Don't** emparelhar duas fontes sans parecidas; uma família, vários pesos.
