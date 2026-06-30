# Plano de Melhorias (pós-setores) — ordem de prioridade

> Melhorias acordadas após a implementação de setores/key users (D21). Ordem de prioridade
> definida pelo dono do produto. Mantém a stack (HTML/CSS/JS puro, PHP procedural, MySQL,
> APIs JSON) e os padrões de segurança/escopo. Implementação **uma por vez, testável**.

## 1. Filtro/visão por setor — ✅ IMPLEMENTADO (quick win)
**Feito:** filtro `setor` em `montar_where_demandas` e `montar_where_acoes`; dropdown "Setor: todos" nas telas **Demandas** e **Ações** (lista **e** calendário), populado por `api/setores/listar.php`; endpoints `demandas/listar`, `acoes/listar-todas` e `acoes/calendario` aceitam `setor`. Sem tabela nova.

## 2. Relatórios (gestão)
**Objetivo:** visão gerencial: demandas por status/**setor**, produtividade por responsável, **% no prazo por período**, com **exportação (CSV)**.
**Escopo provável:** tela nova `relatorios.html` + `api/relatorios/*` (consultas agregadas, só leitura). Respeita escopo (Gestor/Admin veem tudo; key user vê o seu setor).
**Decisões a confirmar:** quais relatórios entram na v1; quem acessa (sugiro Gestor/Admin; key user com recorte do setor); export CSV no MVP de relatórios?

## 3. Conceito de Projeto (decisão de produto)
**Objetivo:** agrupar várias demandas sob um **Projeto** (com responsável/status próprios), para empresas que trabalham por projeto.
**Escopo provável:** tabela nova `projetos` + `demandas.projeto_id` + tela de projeto (lista de demandas do projeto). **Grande.**
**DECISÃO NECESSÁRIA antes de codar:** *a empresa trabalha por **projetos que agrupam várias demandas**, ou cada demanda já é a unidade de trabalho?* Se for a 2ª, este item não é necessário.

## 4. Reabertura de ação chave recusada
**Objetivo:** fechar a limitação registrada — uma ação **chave** recusada deixa a demanda sem conclusão automática.
**Escopo:** ação de "reabrir" (volta a `pendente`) para ação recusada, permitindo retomar o fluxo. Pequeno.
**Decisões a confirmar:** quem reabre (sugiro Gestor/Admin); reabrir limpa o `motivo_recusa`?

## 5. Key user concluir/editar tarefas do setor
**Objetivo:** hoje o key user **vê** todo o seu setor, mas só o **responsável** conclui a própria ação. Permitir que o key user **conclua/edite** ações de terceiros do seu setor.
**Escopo:** ampliar a permissão de concluir/editar ação para o key user do setor da demanda. **Mudança de permissão** (mexer em `concluir.php` e afins).
**Decisões a confirmar:** o key user conclui **qualquer** ação do setor ou só as de certos tipos? Mantém a assinatura/lastro?

---

## Status
- **#1** em andamento (este ciclo). **#2–#5** pendentes, nesta ordem. **#3** bloqueado por decisão de produto (modelo projeto x demanda).
