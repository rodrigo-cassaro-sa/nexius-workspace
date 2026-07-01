# Plano de ação — evoluções após a revisão anti-frágil

Itens que restam do **lado do desenvolvimento** (não são pendências operacionais/infra). Divididos em **A) já pode fazer** (sem decisão) e **B) precisa de decisão**.

> **Definition of done de cada item:** implementar → atualizar a documentação → **acrescentar o item ao roteiro de QA (`docs/validacao/17-roteiro-qa.md`)** → commit/push. Ao final, o roteiro de QA cobre todas as novidades.

---

## A. Já pode fazer (sem decisão pendente)

- [ ] **A1. Edição completa da demanda na tela.** Hoje dá para arquivar e ajustar dono/projeto/prazo, mas não há UI para editar **título e o questionário** (6 perguntas + triagem + GUT). O endpoint `api/demandas/atualizar.php` já existe. Fazer um **modal de edição** (Gestor/Admin), reaproveitando os campos do modal "Nova demanda". Sem migração.
- [ ] **A2. Reabrir demanda concluída.** Existe reabrir **ação** recusada, mas não reabrir uma **demanda** concluída por engano. Comportamento proposto: botão "Reabrir demanda" (Gestor/Admin) → demanda volta a `em_andamento` **e a ação chave volta a `pendente`** (desfaz o gatilho de conclusão). Notifica o responsável. Sem migração.

## B. Precisa de decisão (antes de codar)

- [ ] **B1. Esforço/capacidade — impacto recalculando datas de verdade.** Hoje o impacto de prioridade é **qualitativo** (sinaliza "em risco", não move datas). Para o "empurrão" real, precisa de um modelo. **Decisões:** (a) unidade de **esforço** por tarefa (dias? horas? pontos?); (b) **capacidade** por pessoa (ex.: X por semana?); (c) o sistema **recalcula/empurra os prazos automaticamente** ou só **sugere/simula**? Impacto: campos novos + migração + regras de calendário. **Grande.**
- [ ] **B2. Relatórios com recorte por setor.** Hoje os Relatórios são globais (Gestor/Admin). **Decisão:** o **key user** deve ver os relatórios **só do seu setor**? E/ou um **filtro de setor** para Gestor/Admin? Pequeno/médio.
- [ ] **B3. Envio offsite do backup** (rclone/DO Spaces, ou backup no droplet do MySQL). **Decidido: adiado para a ÚLTIMA ETAPA** (o backup do container já roda; falta só a cópia fora do host).

## Fora deste plano (decisões já tomadas)
Push (fora do escopo — D15), chat fases 2+ (canceladas — D20). Não entram.

---

## Andamento

| Item | Status | QA acrescentado? |
|---|---|---|
| A1 Editar demanda | pendente | — |
| A2 Reabrir demanda | pendente | — |
| B1 Esforço/capacidade | aguardando decisão | — |
| B2 Relatórios por setor | aguardando decisão | — |
| B3 Offsite backup | adiado (última etapa) | — |
