# Plano de Melhorias (pós-setores) — ordem de prioridade

> Melhorias acordadas após a implementação de setores/key users (D21). Ordem de prioridade
> definida pelo dono do produto. Mantém a stack (HTML/CSS/JS puro, PHP procedural, MySQL,
> APIs JSON) e os padrões de segurança/escopo. Implementação **uma por vez, testável**.

## 1. Filtro/visão por setor — ✅ IMPLEMENTADO (quick win)
**Feito:** filtro `setor` em `montar_where_demandas` e `montar_where_acoes`; dropdown "Setor: todos" nas telas **Demandas** e **Ações** (lista **e** calendário), populado por `api/setores/listar.php`; endpoints `demandas/listar`, `acoes/listar-todas` e `acoes/calendario` aceitam `setor`. Sem tabela nova.

## 2. Relatórios (gestão) — ✅ IMPLEMENTADO
**Feito:** tela `relatorios.html` + `public/js/relatorios.js`; `includes/relatorios.php` (consultas agregadas, só leitura) e `api/relatorios/resumo.php` (JSON) + `api/relatorios/exportar.php` (CSV com BOM UTF-8 e separador `;` p/ Excel pt-BR). Mostra **% concluídas no prazo (período)**, **demandas por status**, **demandas por setor** e **produtividade por responsável (período)**. Acesso **Gestor/Admin** (validado no backend com `exigir_perfil`); item de menu "Relatórios" liberado para Gestor/Admin via `ui.js` (`configurarNavGestor`). Sem tabela nova.
**Decidido na v1:** acesso Gestor/Admin (visão global). O **recorte por setor do key user** ficou para fase futura (não bloqueia a entrega).

## 3. Conceito de Projeto (decisão de produto) — ✅ IMPLEMENTADO
**Feito (D22):** **Migration 018** (tabela `projetos` + `demandas.projeto_id` FK opcional `ON DELETE SET NULL`); `includes/projetos.php` (CRUD + escopo **por envolvimento**); endpoints `api/projetos/` (`listar`, `criar`, `detalhe`, `atualizar`, `arquivar`) + `api/demandas/definir-projeto.php`. Telas `projetos.html` (lista + criar) e `projeto.html` (detalhe + editar/arquivar + demandas vinculadas); select de projeto no modal de nova demanda e "Mover para projeto" no detalhe da demanda; item **Projetos** no menu. **Decidido:** status espelha a demanda; responsável + setor opcionais; visibilidade por envolvimento. Criar/editar/arquivar/mover = Gestor/Admin; ver = escopo. **Migration 018 precisa ser rodada no ambiente.**

## 4. Reabertura de ação recusada — ✅ IMPLEMENTADO
**Feito:** botão **"Reabrir"** nas tarefas com status `recusada` (Gestor/Admin) — volta a ação para `pendente` e **limpa o `motivo_recusa`**, permitindo ao responsável reentregar/concluir. Fecha a limitação do D19 (ação chave recusada deixava a demanda travada). `reabrir_acao()` em `includes/acoes.php` + `api/acoes/reabrir.php` (notifica o responsável). Sem tabela nova; "bloqueada" continua derivada de pré-requisito. **Decidido:** reabre = Gestor/Admin (mesma alçada da recusa); reabrir limpa o motivo.

## 5. Key user concluir tarefas do setor — ✅ IMPLEMENTADO
**Feito:** a conclusão de uma ação passa a ser permitida ao **responsável OU ao key user** (responsável principal) do setor da demanda — `usuario_eh_keyuser_da_demanda()` em `includes/demandas.php`, aplicado em `api/acoes/concluir.php` e em `api/anexos/enviar-acao.php` (para o key user também anexar a evidência de análise/reunião). O botão "Concluir" aparece para o key user no detalhe da demanda. **Decidido:** key user conclui **qualquer** tarefa do seu setor (mesmas regras: pré-requisitos, evidência obrigatória de análise/reunião, decisões da reunião); a **assinatura/lastro é mantida** (registra o nome de quem concluiu); quando o key user conclui no lugar do responsável, o responsável é **notificado**. Não havia endpoint genérico de "editar ação" — o que faltava era a **conclusão**, agora coberta. Sem tabela nova (reaproveita `setores.responsavel_id`).

---

## Status
- **#1 a #5 implementados.** Plano de melhorias pós-setores concluído.
