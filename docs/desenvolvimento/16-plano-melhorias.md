# Plano de Melhorias (pós-setores) — ordem de prioridade

> Melhorias acordadas após a implementação de setores/key users (D21). Ordem de prioridade
> definida pelo dono do produto. Mantém a stack (HTML/CSS/JS puro, PHP procedural, MySQL,
> APIs JSON) e os padrões de segurança/escopo. Implementação **uma por vez, testável**.

## 1. Filtro/visão por setor — ✅ IMPLEMENTADO (quick win)
**Feito:** filtro `setor` em `montar_where_demandas` e `montar_where_acoes`; dropdown "Setor: todos" nas telas **Demandas** e **Ações** (lista **e** calendário), populado por `api/setores/listar.php`; endpoints `demandas/listar`, `acoes/listar-todas` e `acoes/calendario` aceitam `setor`. Sem tabela nova.

## 2. Relatórios (gestão) — ✅ IMPLEMENTADO
**Feito:** tela `relatorios.html` + `public/js/relatorios.js`; `includes/relatorios.php` (consultas agregadas, só leitura) e `api/relatorios/resumo.php` (JSON) + `api/relatorios/exportar.php` (CSV com BOM UTF-8 e separador `;` p/ Excel pt-BR). Mostra **% concluídas no prazo (período)**, **demandas por status**, **demandas por setor** e **produtividade por responsável (período)**. Acesso **Gestor/Admin** (validado no backend com `exigir_perfil`); item de menu "Relatórios" liberado para Gestor/Admin via `ui.js` (`configurarNavGestor`). Sem tabela nova.
**Decidido na v1:** acesso Gestor/Admin (visão global). O **recorte por setor do key user** ficou para fase futura (não bloqueia a entrega).

## 3. Conceito de Projeto (decisão de produto) — APROVADO (próximo)
**Objetivo:** agrupar várias demandas sob um **Projeto** (com responsável/status próprios), para empresas que trabalham por projeto.
**Decisão do dono do produto:** a empresa **trabalha por projetos que agrupam várias demandas** → seguir com o modelo Projeto.
**Escopo:** tabela nova `projetos` + `demandas.projeto_id` (FK opcional, `ON DELETE SET NULL`) + tela de projeto (lista de demandas do projeto) + endpoints de CRUD/listagem. **Grande.**

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
- **#1 e #2** implementados. **#3** aprovado e é o próximo. **#4 e #5** pendentes, nesta ordem.
