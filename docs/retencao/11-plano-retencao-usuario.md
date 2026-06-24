# Plano de Retenção de Usuário

> Retenção **faz parte do MVP** e já está descrita: `00-briefing-projeto.md` e
> `01-descricao-produto.md` **§18** — "valor recorrente de acompanhamento: dashboard
> com pendências e 'minhas ações', notificações de atribuição e de novos comentários
> trazendo o usuário de volta, e histórico organizado de cada demanda".
> Este plano consolida o que **já existe** e adiciona um mecanismo **simples, útil e
> sem spam** (sem dark patterns), com **evidência** nos documentos.

## 1. Objetivo

Fazer o usuário voltar pelo **valor real** (saber o que é dele e o que falta), não por
pressão. Apoiar a métrica de sucesso do MVP (**% de ações concluídas no prazo**).

## 2. Valor entregue

- Ao logar, o usuário vê **na hora** o que precisa fazer (suas pendências) e **onde
  parou** (última demanda aberta) — reduz fricção para retomar o trabalho.

## 3. Momentos críticos

- **Login/retorno:** primeira tela (Dashboard) deve responder "o que é meu agora?".
- **Atribuição / novo comentário / mudança de status:** já tratados por **notificações**
  internas e e-mail (eventos do MVP — `09-plano-notificacoes.md`).

## 4. Gatilhos de retorno (todos com regra clara)

- **Notificações** (internas + e-mail) em: atribuição, novo comentário em ação que
  acompanha, mudança de status, conclusão. (Já implementado.)
- **Sino na topbar** com contador de não lidas. (Já implementado.)

## 5. Lembretes úteis

- **Não há lembrete automático novo** (ex.: "você sumiu") — seria invasivo e sem
  evidência. Os lembretes do MVP são os **eventos** acima.
- O destaque de **ações atrasadas** (badge/contagem) serve de lembrete contextual,
  sem disparo extra.

## 6. Resumos periódicos

- **Fora do escopo atual.** Os e-mails do MVP são **operacionais por evento**
  (`01-descricao-produto.md` §16); **não** há digest/resumo periódico definido.
  Registrado em `docs/decisoes-pendentes.md` (precisa de decisão de produto + regra
  anti-spam/opt-out antes de implementar).

## 7. Pendências do usuário (mecanismo adicionado nesta etapa)

- Card **"Minhas pendências"** no Dashboard: lista das **ações pendentes do próprio
  usuário** (responsável), ordenadas pelo **prazo** (mais cedo primeiro), com destaque
  para **atrasada** e **bloqueada** (pré-requisito pendente); cada item leva à demanda.
  Implementa: *tarefas pendentes / próxima ação recomendada*.
- **"Continue de onde parou":** link para a **última demanda que o usuário abriu**
  (derivado de `demanda_visitas`). Implementa: *continue de onde parou*.
- Tudo **derivado de dados existentes** (sem tabela nova). Respeita o **escopo**:
  só mostra ações **do próprio usuário**.

## 8. Indicadores de engajamento

- Sem painel de engajamento novo. Reaproveita o que existe: **% no prazo**,
  **minhas ações pendentes**, **atrasadas** (Dashboard) e o **lastro de visitas**
  (`demanda_visitas`) que já registra quem abriu o quê e quando.

## 9. Métricas simples do MVP

- Métrica principal do produto: **% de ações concluídas no prazo** (já no Dashboard).
- Apoio: nº de pendências e atrasadas por usuário (já no Dashboard).

## 10. Limites anti-excesso (sem dark patterns)

- **Tudo interno** (nenhum e-mail/push novo nesta etapa).
- **Sem nag**: estado vazio é **positivo** ("Você está em dia."), não cobra.
- **Sem contadores falsos** nem urgência artificial; prazos/atrasos vêm de dados reais.
- **Sem rastrear o usuário fora do necessário**; a lista respeita a permissão (só o seu).

## 11. Fora do MVP

- **Resumo periódico por e-mail (digest)** e **push** — sem evidência; exigem decisão
  de produto e regras de consentimento/opt-out (registrado em `decisoes-pendentes.md`).
- Nudges de inatividade ("faz X dias que você não entra"), streak de login,
  recomendações por IA — fora do escopo.
