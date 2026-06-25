# Plano de Animações e Microinterações

> Base: `02-guia-visual.md` **§11, §16, §19, §23, §24, §26**. Tudo em **CSS puro**
> (animar `opacity`/`transform`), tom **corporativo sóbrio**, sem biblioteca externa.
> Este plano consolida o que **já existe** (spinner, skeleton, modal animado) e adiciona
> microinterações **leves e úteis**, sempre respeitando `prefers-reduced-motion`.

## 1. Objetivo
Tornar a interface mais legível e responsiva ao toque/clique **sem ruído**: o movimento
deve ajudar o entendimento (o que respondeu ao meu clique, o que apareceu, o que mudou),
nunca decorar. Mobile continua leve (sem animações pesadas).

## 2. Personalidade do movimento
Discreto, rápido e funcional — coerente com o tom institucional do Grupo Nexius.
Durações curtas (`--transicao-rapida` 0.15s, `--transicao-padrao` 0.2s), easing suave,
deslocamentos pequenos (≤ 6px). Nada de bounce, salto ou movimento chamativo.

## 3. Microinterações obrigatórias
- **Botões:** `hover` (elevação sutil + sombra leve; primário escurece), `active` (volta
  ao plano, "pressionado"), `:focus-visible` (contorno visível para teclado).
- **Campos:** `focus` realça a borda (já existe).
- **Itens de lista clicáveis** (ações, notificações, atividades, linhas): realce de fundo
  suave no `hover`.

## 4. Transições de tela
Não há SPA/transição de rota (cada tela é uma página). As "transições" são na entrada de
**modais**, **dropdown do sino** e **mensagens de feedback** (aparição com `opacity`+`transform`).

## 5. Loading
- **Spinner** (`.spinner`) e **skeleton** (`.skeleton`) já existem. Mantidos.
- Regra do guia (§19): a animação **não** mascara lentidão real da API.
- Sob `prefers-reduced-motion`, spinner/skeleton param de animar (ficam estáticos).

## 6. Feedback de sucesso
- Mensagem `.alerta-sucesso` **surge** com leve fade + deslize ao ser exibida
  (atributo `hidden` → visível). Sem confete/efeito.
- Barras de progresso (demanda e nível da gamificação) **transicionam** a largura quando o
  valor muda.

## 7. Feedback de erro
- Mensagem `.alerta-erro` usa a **mesma** entrada suave (sem "shake" agressivo, coerente
  com o tom sóbrio). A cor + ícone/texto continuam sendo o sinal principal (não só cor).

## 8. Empty states
- Estados vazios são **estáticos** (texto orientador). Sem animação — evita parecer erro
  ou chamar atenção indevida.

## 9. Gamificação
- A **barra de nível** (`.nivel-barra-preenchida`) anima a largura (transição), reforçando
  progresso. Conquistas: sem efeito chamativo (apenas o estado on/off já estilizado).

## 10. Redução de movimento e acessibilidade
- Bloco global `@media (prefers-reduced-motion: reduce)` zera durações de animação e
  transição em todo o app (inclui spinner/skeleton/modal).
- **Foco visível** (`:focus-visible`) em botões, links e itens interativos (§24).
- Movimento nunca é a única informação; cor + texto/ícone permanecem.

## 11. O que não deve ser animado
- Texto/conteúdo de leitura, tabelas inteiras, números (sem count-up), badges de status
  (mudança é instantânea, sem piscar), navegação entre páginas.
- Nada de parallax, autoplay, loops infinitos decorativos ou movimento em mobile que pese.

---

## Implementação
- **CSS apenas**, sem JS novo. Microinterações e o bloco `prefers-reduced-motion` ficam em
  `public/css/components.css` (carregado em todas as telas); transições de barra em
  `public/css/pages.css`.
- Entradas de **feedback** e **dropdown** usam `@keyframes` que disparam quando o elemento
  deixa de ser `hidden` (mecanismo já usado pelo front, sem alteração de script).
