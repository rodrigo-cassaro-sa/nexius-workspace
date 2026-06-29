# Plano de Evolução — Pós-MVP (decisões do dono do produto)

> Plano de ação para as decisões tomadas após a revisão final (Prompt 14).
> Mantém a stack (HTML/CSS/JS puro, PHP procedural, MySQL, APIs JSON) e os padrões
> de segurança/escopo. Cada item tem: objetivo, decisões a confirmar, passo a passo,
> dependências e impacto. **Nada aqui foi implementado ainda** — é o roteiro.

Itens decididos:
1. **D15 — Resumo periódico por e-mail (digest):** vai existir.
2. **D20 — Chat:** não evoluir (Fase 1 mantida, sem fases seguintes).
3. **Reunião — participantes editáveis:** poder adicionar/remover pessoas depois da criação.
4. **D19 — Decisões da reunião na demanda:** registrar as decisões/regras tomadas e exibi-las na demanda.

Ordem sugerida de execução: **3 → 4 → 1** (são incrementos pequenos sobre o que já existe; o digest depende do e-mail/domínio). O item **2** é só registro (não há trabalho de código).

---

## Item 1 — D15: Resumo periódico por e-mail (digest)

### Objetivo
Enviar um resumo periódico por e-mail (ex.: semanal) com o que importa para o usuário
(minhas pendências, ações atrasadas, % no prazo), trazendo-o de volta **sem spam**.

### Decisões de produto a confirmar (antes de codar)
- **Frequência:** sugiro **semanal** (ex.: segunda 8h). Alternativa: diário.
- **Conteúdo:** minhas ações pendentes, atrasadas, % no prazo, e demandas recentes atribuídas. (Reaproveita o que o Dashboard já calcula.)
- **Consentimento:** opt-out (vem ligado, usuário pode desligar no Perfil) — ou opt-in?
- **Anti-spam:** **não enviar** se o usuário não tiver nada relevante no período; no máximo 1 envio por período.

### Passo a passo
1. **Confirmar** as decisões de produto acima.
2. **Banco (migration):** adicionar em `usuarios`: `digest_ativo` (TINYINT(1) default 1) e `digest_enviado_em` (DATETIME NULL, idempotência).
3. **Backend:** `includes/digest.php` — `montar_resumo_usuario($id)` (reusa `dashboard.php`: pendências/atrasadas/%); `usuarios_para_digest($periodo)` (ativos, `digest_ativo=1`, ainda não enviados no período, com conteúdo).
4. **Cron:** `cron/enviar-digest.php` (CLI, como `processar-fila-email.php`): para cada usuário elegível, monta o resumo, **enfileira em `fila_email`** (infra já existe) e grava `digest_enviado_em`. O `processar-fila-email.php` faz o envio real.
5. **Front (Perfil):** toggle "Receber resumo por e-mail" + endpoint `api/perfil/preferencias.php` (salva opt-out). Reusa o componente `.toggle`.
6. **Agendar** no EasyPanel (Scheduled Task) na frequência definida.
7. **Docs:** descrição §16, `09-plano-notificacoes.md`, e marcar D15 como resolvido.

### Dependências / impacto
- **Depende do domínio de e-mail verificado na Resend** (hoje em sandbox) — sem isso, o digest não é entregue a terceiros.
- Não mexe em telas além do Perfil. **Push fica fora deste item** (exigiria Service Worker + VAPID + consentimento — avaliar como item próprio depois, se desejado).

---

## Item 2 — D20: Chat (não evoluir)

### Decisão
**O chat não terá novas fases.** A **Fase 1** (chat 1:1 já implementado) **permanece** como está. Ficam **canceladas** as fases seguintes antes previstas (anexos por mensagem, busca, exportação, referência a ação).

### Passo a passo
- Apenas **registro**: atualizar a D20 em `decisoes-pendentes.md` para "fases seguintes canceladas". **Sem código.**
- *(Se no futuro quiser **remover** o chat por completo — tela, endpoints e tabelas `conversas`/`mensagens` — é outra decisão; avisar.)*

---

## Item 3 — Reunião: adicionar/editar participantes depois da criação

### Objetivo
Hoje os participantes de uma ação do tipo **reunião** só podem ser definidos na criação.
Permitir **incluir (ou remover) pessoas depois**, na própria ação.

### Decisões a confirmar
- **Quem edita:** sugiro **Gestor/Admin** (quem cria a ação) **e o responsável** da ação.
- Participantes adicionados **recebem notificação** (como na criação) e passam a contar como "envolvidos" (já é assim).

### Passo a passo
1. **Backend:** novo endpoint `api/acoes/participantes-definir.php` (POST `{acao_id, participantes[]}`): valida login + permissão + que a ação é `tipo = reuniao`; **reaproveita `definir_participantes_acao()`** (que já faz substituição completa da lista); notifica os **novos** participantes.
2. **Front (`demanda.js`):** na ação de reunião, botão **"Gerenciar participantes"** → modal com `select multiple` **pré-marcado** com os atuais; salvar chama o endpoint e recarrega.
3. **Permissão no front** é só conveniência; o backend é a barreira real.
4. **Docs:** atualizar D19 (ampliação reunião) removendo a limitação "só na criação".

### Impacto
- Incremento pequeno; **sem tabela nova** (usa `acao_participantes`). Reaproveita helper e padrão de modal existentes.

---

## Item 4 — D19: documentar as decisões/regras da reunião na demanda

### Objetivo
Registrar as **decisões/regras tomadas** numa reunião (além da **ata** em anexo) e **exibi-las na demanda**, para ficarem recuperáveis — fechando a ideia que estava em aberto na D19.

### Decisões a confirmar
- O registro é um **texto** ("Decisões/regras tomadas") **+** a ata (arquivo já obrigatório). Confirmar.
- **Quando capturar:** no momento de **concluir** a reunião (junto da ata). O texto é **obrigatório** ou opcional? (sugiro obrigatório, curto.)
- **Onde aparece:** seção **"Decisões das reuniões"** no detalhe da demanda, consolidando o texto de cada reunião concluída + link para a respectiva ata.

### Passo a passo
1. **Confirmar** as decisões acima.
2. **Banco (migration):** `acoes.decisoes` TEXT NULL (decisões/regras tomadas; preenchido só em reunião).
3. **Backend:** `concluir.php` (quando `tipo = reuniao`) passa a aceitar e gravar `decisoes`; nova função para **listar as decisões das reuniões da demanda** (texto + referência à ata em `anexos.acao_id`).
4. **Front:** campo **"Decisões/regras tomadas"** no modal de conclusão de reunião (ao lado da ata); seção **"Decisões das reuniões"** no detalhe da demanda (texto + link para baixar a ata).
5. **Docs:** atualizar D19 e a modelagem de banco.

### Impacto
- 1 coluna nova (`acoes.decisoes`), sem tabela nova. Reaproveita o fluxo de conclusão e os anexos de ação já existentes.

---

## Resumo de migrations previstas
- **Item 1 (D15):** `usuarios.digest_ativo` + `usuarios.digest_enviado_em`.
- **Item 4 (D19):** `acoes.decisoes`.
- Itens 2 e 3: **sem migration** (2 é só registro; 3 usa `acao_participantes`).

## Decisões de produto pendentes (a confirmar antes de implementar)
- D15: frequência, conteúdo, opt-in/opt-out.
- Reunião participantes: quem pode editar.
- D19 decisões: texto obrigatório? onde exatamente aparece na demanda?
