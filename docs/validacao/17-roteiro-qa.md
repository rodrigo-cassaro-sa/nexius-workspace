# Roteiro de QA — Workspace S&A

Roteiro prático para validar em produção as funcionalidades novas/alteradas (setores, projetos, prazos, roadmap, impacto de prioridade, controle, relatórios, auditoria). Marque cada item ao validar.

> **Observação sobre e-mail:** enquanto o domínio na Resend não estiver verificado, e-mails só entregam para o dono da conta. Nos passos abaixo, "notificação" refere-se à **notificação interna** (sino) — o e-mail é bônus quando o domínio estiver ativo.

---

## 0. Preparação (uma vez)

- [ ] Ter 3 usuários de teste: **Admin**, **Gestor** e **Colaborador**.
- [ ] Em **Usuários** (Admin): definir **setor** de cada usuário e o **responsável principal (key user)** de pelo menos 2 setores (um deles sendo o Colaborador, para testar o escopo de key user).
- [ ] Ter algumas demandas com **prioridade GUT** variada e ações com **prazos** próximos/sobrepostos (necessário para ver "carga" e "risco").

---

## 1. Projetos (D22)

- [ ] **Criar projeto** (Gestor/Admin) com nome, status, **prazo**, responsável e setor → abre o detalhe do projeto.
- [ ] No **detalhe**: dados corretos (inclusive Prazo) e "Nenhuma demanda vinculada" quando vazio.
- [ ] **Editar** o projeto (nome/status/prazo/responsável/setor) → salva e reflete.
- [ ] **Vincular demanda ao projeto**: em uma demanda, no controle de gestão, escolher o projeto em "Projeto" → Salvar. Voltar ao projeto → a demanda aparece em "Demandas do projeto".
- [ ] **Criar demanda já com projeto**: no modal "Criar demanda", escolher um projeto no campo "Projeto".
- [ ] **Arquivar / Cancelar** projeto → some da lista padrão; as demandas continuam existindo.
- [ ] **Colaborador**: vê na lista apenas projetos em que está envolvido (responsável, key user do setor, ou com demanda dele).

## 2. Demanda — dono, prazo alvo, projeto

- [ ] No detalhe da demanda, o cabeçalho mostra **Responsável**, **Projeto**, **Prazo (ação chave)** e **Prazo alvo**.
- [ ] No controle de gestão (Gestor/Admin ou key user): definir **Responsável (dono)**, **Projeto** e **Prazo alvo** → Salvar (envia só o que mudou). O novo dono recebe notificação.
- [ ] **Editar demanda (A1)**: Gestor/Admin → botão **"Editar"** abre o modal com título, status, questionário (6 perguntas), triagem e GUT **pré-preenchidos** → alterar e Salvar → o detalhe reflete (título, prioridade recalculada). Validações de campo obrigatório funcionam.
- [ ] Colaborador comum **não vê** o controle de gestão nem os botões Editar/Arquivar (só leitura).

## 3. Roadmap / Gantt (D23)

- [ ] Abrir **Roadmap**: barras posicionadas por prazo; linha do **"hoje"**; ticks semanais.
- [ ] **Agrupar por**: alternar **Projeto/Demanda**, **Responsável (carga)** e **Setor (carga)** → o rótulo à esquerda e a contagem mudam; barras-resumo nos grupos.
- [ ] Filtros: **período**, **projeto** e **setor** funcionam.
- [ ] **Editar no popup**: clicar numa barra → trocar responsável e/ou prazo → Salvar → recarrega.
- [ ] **Arrastar (mouse)**: arrastar uma barra na horizontal → a **dica flutuante** mostra a nova data → soltar aplica o prazo.
- [ ] **Toque (celular)**: arrastar pela **alça** (ponta direita da barra) ajusta o prazo; tocar no corpo abre o popup; rolar a timeline funciona.
- [ ] Permissão: colaborador sem direito não arrasta e o popup abre só-leitura.

## 4. Impacto de prioridade / "em risco" (D24)

Pré: duas tarefas do **mesmo responsável**, prazos sobrepostos, em demandas com **GUT diferente**.

- [ ] **Roadmap**: a tarefa de menor prioridade fica com **contorno tracejado + ⚠**; aviso no topo; cabeçalhos marcam ⚠ / "N em risco".
- [ ] **Dashboard**: aparece o **card âmbar** "N tarefas em risco por prioridade" (Colaborador vê as suas; Gestor/Admin o total).
- [ ] **Detalhe da demanda**: aviso no topo quando a demanda tem tarefa em risco.
- [ ] **Lista de Demandas**: ⚠ na linha da demanda em risco.
- [ ] **Ações**: ⚠ na linha (lista) e no evento (calendário).

## 5. Controle / Higiene (D25) — Gestor/Admin

- [ ] Abrir **Controle**. Conferir as 5 seções (contagem verde quando zero):
  - [ ] Demandas **sem plano de ação** (crie uma demanda e não adicione ação).
  - [ ] Demandas **sem responsável**.
  - [ ] Tarefas **sem prazo** (crie ação sem prazo).
  - [ ] Tarefas de **usuários inativos** (inative um usuário com tarefa aberta) → **Reatribuir** inline → some da lista.
  - [ ] Demandas **paradas** há +14 dias (se houver dados antigos).
- [ ] **Colaborador**: item "Controle" não aparece; acessar a URL redireciona ao Dashboard.

## 6. Relatórios (melhoria #2) — Gestor/Admin

- [ ] Faixa de **4 KPIs** no topo (demandas total/concluídas, ações concluídas, % no prazo).
- [ ] Ajustar **período** (De/Até) → % no prazo e produtividade recalculam.
- [ ] **Demandas por status** e **por setor** preenchem.
- [ ] **Produtividade por responsável** (tabela).
- [ ] **Padrões de falha**: "Atrasos por responsável" e "Recusas por setor".
- [ ] **Filtro de setor (B2)**: escolher um setor no filtro "Setor" → todos os blocos (status, % no prazo, produtividade, atrasos, recusas) recalculam **só para aquele setor**; "Todos os setores" volta ao global.
- [ ] **Exportar CSV (produtividade)** → baixa o arquivo com acentos corretos (Excel pt-BR); **respeita o filtro de setor** selecionado.

## 7. Auditoria de logs (Admin)

- [ ] Abrir **Auditoria** (só Admin). Lista com data/hora, usuário, ação, IP, detalhes.
- [ ] **Filtros**: por usuário, por ação (dropdown), por período e busca → resultados coerentes.
- [ ] **Paginação** funciona.
- [ ] Verificar que ações recentes aparecem (ex.: `acao_prazo_alterado`, `demanda_responsavel_definido`, `projeto_criado`) — confirma que os **logs estão persistindo no banco**.
- [ ] Gestor/Colaborador **não** veem "Auditoria".

## 8. Fluxos de tarefa (revisão)

- [ ] **Reabrir ação recusada**: recusar uma entrega (Gestor/Admin) → botão **Reabrir** volta para pendente e limpa o motivo; o responsável é notificado.
- [ ] **Reabrir demanda concluída** (A2): numa demanda **concluída**, Gestor/Admin veem o botão **"Reabrir demanda"** → a demanda volta a **em andamento** e a **ação chave** volta a **pendente**; o dono/criador é notificado. Em demanda não-concluída o botão não aparece.
- [ ] **Key user conclui tarefa do setor**: como key user, concluir uma tarefa de **outro** responsável do seu setor (assinatura exigida; para análise/reunião, anexar evidência). O responsável é notificado.

## 9. Permissões e escopo (transversal)

- [ ] **Colaborador**: no menu não aparecem **Relatórios**, **Controle**, **Auditoria** nem **Usuários**; vê **Projetos/Roadmap** com escopo (só o que o envolve).
- [ ] **Gestor**: vê Relatórios e Controle; **não** vê Auditoria nem Usuários.
- [ ] **Admin**: vê tudo.
- [ ] Tentar abrir por URL direta uma tela sem permissão → redireciona/bloqueia (backend responde 403/302).

## 10. Responsivo (celular)

- [ ] Menu vira **hambúrguer**; sidebar desliza.
- [ ] Listas (demandas, ações, projetos, controle, auditoria) viram **cartões**.
- [ ] **Roadmap** rola na horizontal; rótulos fixos; alça de arraste funciona no toque.
- [ ] Filtros quebram em várias linhas sem espremer.

## 11. Infra (opcional, terminal do container)

- [ ] `date` mostra horário de **Brasília** (-03).
- [ ] `cat /etc/cron.d/app-cron` lista os 3 crons; `tail -f /var/www/html/logs/cron.log` mostra execuções.
- [ ] Rodar manualmente `php /var/www/html/cron/limpar-logs.php` → mensagem de conclusão.

---

## Registro de problemas encontrados

| # | Tela/fluxo | O que aconteceu | Esperado | Gravidade |
|---|---|---|---|---|
|   |   |   |   |   |

> Ao encontrar um problema, anote aqui (ou me envie) com o passo, o perfil usado e um print — eu corrijo.
