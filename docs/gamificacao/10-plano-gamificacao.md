# Plano de Gamificação

> **Veredito (escopo): gamificação está FORA do MVP.** Não há evidência nos
> documentos para construir pontos, níveis, conquistas, ranking, missões,
> streak ou badges de jogo nesta fase. Este plano **não autoriza implementação**:
> ele registra a decisão e desenha uma proposta para uma **fase futura**, sujeita
> a decisão de produto (ver `docs/decisoes-pendentes.md`).
>
> Evidências (todas convergentes):
> - `docs/produto/00-briefing-projeto.md` — "O sistema precisa de gamificação? **Não no MVP.**" e em "fora do MVP": "Gamificação (pontos, níveis, ranking)".
> - `docs/produto/01-descricao-produto.md` — **§17 Gamificação: "Não no MVP."** e **§23: "Sem gamificação."**
> - `docs/banco/03-modelagem-banco-dados.md` §10 — "Nenhuma tabela. Gamificação está fora do MVP. **Não criar `pontos`, `niveis`, `conquistas` ou `ranking`** nesta fase."
> - `docs/arquitetura/01-arquitetura-mvp.md` — "Não construir no MVP: … **gamificação** …".
> - `docs/produto/03-mapa-de-telas.md` — "## Gamificação/progresso — **Fora do MVP. Não construir nesta fase.**".
> - `docs/design/04-prompt-mockup-telas.md` — "**Não incluir gamificação.**".

## 1. Objetivo

Reforçar a proposta de valor do produto (acompanhamento e responsabilização) sem
transformá-lo em jogo. A métrica de sucesso do MVP é **% de ações concluídas no
prazo** (`01-descricao-produto.md` §22). Uma gamificação futura deve apoiar
exatamente esse comportamento — concluir o que é seu, no prazo — e nada além.

**No MVP, o objetivo é cumprido sem gamificação**, pelos mecanismos já previstos:
dashboard ("minhas ações", pendências, % no prazo), notificações e histórico.

## 2. Comportamentos estimulados (alvo de uma fase futura)

Apenas comportamentos que **já existem e já são rastreáveis** no sistema:

- Concluir ações **dentro do prazo** (`acoes.concluida_em` ≤ `acoes.prazo`).
- Concluir a **ação chave** (entrega da demanda).
- Manter o **plano de ação em dia** (sem ações atrasadas).
- Responder demandas **dentro do SLA** (lastro `demandas.respondida_em`).

Nada de comportamento novo inventado. Sem incentivo a "fechar por fechar".

## 3. Mecânicas do MVP

**Nenhuma.** Gamificação não faz parte do MVP. Não há pontos, níveis, conquistas,
ranking, missões, streak nem badges de jogo nesta fase.

> Observação: os **badges de status** (Aberta, Concluída, SLA, Prioridade GUT) que
> existem na interface são **componentes de status/UX**, não gamificação.

## 4. Pontuação (proposta futura — NÃO implementada)

Princípio obrigatório: **toda pontuação tem origem rastreável** e é **calculada no
backend** a partir de dados que já existem (não confiar no frontend). Exemplos de
regra clara, derivável sem novas tabelas de evento:

| Evento (origem rastreável) | Pontos (exemplo) |
|---|---|
| Ação concluída no prazo (`concluida_em` ≤ `prazo`) | +10 |
| Ação concluída em atraso | +3 |
| Ação chave concluída (entrega) | +20 |
| Demanda respondida dentro do SLA (`respondida_em` ≤ criado_em + 3d) | +5 |

Sem pontos por login, por abrir tela ou por ações sem regra clara.

## 5. Níveis (proposta futura — NÃO implementada)

Faixas simples e sóbrias sobre o total acumulado (ex.: Bronze / Prata / Ouro),
apenas como leitura de progresso pessoal — **sem ranking competitivo** por padrão,
pois não há evidência de necessidade de ranking nos documentos.

## 6. Badges / conquistas (proposta futura — NÃO implementada)

Poucas e significativas, todas com critério verificável no backend, por exemplo:
"Primeira demanda concluída", "10 ações no prazo", "Mês sem atrasos". Sem inflação
de badges.

## 7. Progresso visual (proposta futura — NÃO implementada)

Leitura **pessoal** de progresso (a própria pessoa), discreta, dentro do **Perfil**
ou em uma tela `progresso.html`. **Não construir no MVP** (o Mapa de Telas marca a
tela de Gamificação/progresso como "Fora do MVP").

## 8. Regras antifraude

- **Backend calcula; frontend só exibe** (`boas-praticas-arquitetura.md`,
  `boas-praticas-seguranca.md`).
- Pontuação derivada de **fatos imutáveis e rastreáveis** (`concluida_em`,
  `prazo`, `respondida_em`, `logs`), não de cliques no front.
- Conclusão de ação já tem **assinatura + log** (lastro), e só o **responsável**
  conclui a própria ação — base sólida contra "auto-pontuação".
- Nada de pontuar status que o próprio usuário possa alternar livremente.

## 9. Telas e componentes

**MVP: nenhuma tela nova.** A tela `progresso.html` e os componentes de
gamificação ficam para a fase futura, condicionados à decisão de produto.

## 10. Dados necessários

**MVP: nenhuma tabela nova** (Banco §10 proíbe `pontos/niveis/conquistas/ranking`).
Numa fase futura, a pontuação pode ser **derivada em runtime** dos dados existentes
(ações, prazos, SLA, logs) — preferível a criar tabelas de evento — e só então,
se necessário por desempenho, avaliar uma tabela de agregação. Decisão na etapa de
banco, com evidência de produto.

## 11. Fora do MVP

Tudo desta funcionalidade. Não serão criados nesta fase: pontos, níveis,
conquistas/badges de jogo, ranking, missões, streak, tela de progresso, endpoints
`gamification/*`, serviço de gamificação, nem tabelas de pontuação.

Para **trazer gamificação para o escopo**, é preciso uma **decisão de produto
explícita** que atualize `00-briefing-projeto.md`, `01-descricao-produto.md` (§17/§23),
`03-mapa-de-telas.md` e `03-modelagem-banco-dados.md` (§10). Registrado em
`docs/decisoes-pendentes.md`. Só depois disso a implementação é autorizada.
