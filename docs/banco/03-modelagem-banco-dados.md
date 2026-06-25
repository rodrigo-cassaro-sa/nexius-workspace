# Modelagem do Banco de Dados

Projeto: Workspace S&A (marca Grupo Nexius).
Base: `01-descricao-produto.md` (§8, §9, §16, §19), `boas-praticas-banco-dados.md` e `boas-praticas-seguranca.md`.
SQL correspondente: `sql/migrations/001_create_base_schema.sql` e `sql/seeds/001_seed_roles_permissions.sql`.

Observações de convenção (mantidas por coerência com o restante do projeto):

- Pasta: o SQL fica em `sql/` (não em `database/`), seguindo a arquitetura aprovada e o `boas-praticas-banco-dados.md`. Isso evita duplicar a estrutura já criada.
- Timestamps em português: `criado_em` e `atualizado_em` (regra obrigatória de nomes sem acento, em português). Não há `deleted_at`: o sistema não tem exclusão física (demandas/ações usam `status`; usuários usam `ativo`).
- MySQL InnoDB, `utf8mb4`. Todo acesso usa prepared statements no backend.

---

## 1. Entidades do MVP

Derivadas de `01-descricao-produto.md` §19. Apenas o que o MVP exige:

- **usuarios** — pessoas com perfil/permissão.
- **convites** — acesso por convite (perfil pré-definido, validade 7 dias, uso único).
- **tokens_recuperacao** — recuperação de senha (validade 30 min, uso único).
- **demandas** — demandas de projeto.
- **acoes** — itens do plano de ação (responsável, prazo, status, ação chave).
- **acao_prerequisitos** — dependências entre ações (uma ação pode depender de várias).
- **comentarios** — discussão por ação.
- **notificacoes** — avisos internos do sistema.
- **fila_email** — fila de e-mail operacional (SMTP + cron).
- **logs** — auditoria de ações críticas.

## 2. Tabelas propostas

Resumo dos campos principais (ver SQL para tipos, chaves e constraints completos).

### usuarios
`id` · `nome` · `email` (único) · `senha_hash` (NULL até definir senha) · `perfil` (administrador/gestor/colaborador) · `ativo` · `onboarding_concluido` · `criado_em` · `atualizado_em`.
Motivo: identidade, autenticação, perfil e estado do usuário.

### convites
`id` · `email` · `perfil` · `token` (único) · `status` (pendente/aceito/cancelado/expirado) · `expira_em` · `criado_por` (FK usuarios) · `usuario_id` (FK usuarios, ao aceitar) · timestamps.
Motivo: entrada por convite, sem cadastro aberto.

### tokens_recuperacao
`id` · `usuario_id` (FK) · `token` (único) · `expira_em` · `usado` · `criado_em`.
Motivo: redefinição de senha segura, com expiração curta e uso único.

### demandas
`id` · `titulo` · `descricao` · `status` (aberta/em_andamento/concluida/arquivada/cancelada) · `criador_id` (FK) · `responsavel_id` (FK) · `concluida_em` · timestamps.
Motivo: entidade central do produto.

### acoes
`id` · `demanda_id` (FK) · `titulo` · `tipo` (analise/desenvolvimento/entrega/incidente — D19) · `descricao` · `responsavel_id` (FK) · `status` (pendente/bloqueada/concluida/cancelada/**recusada**) · `motivo_recusa` (só entrega recusada) · `prazo` · `chave` · `concluida_em` · timestamps.

Regras por tipo (D19, Migration 010): **análise** só conclui com anexo de evidência (`anexos.acao_id`); **desenvolvimento** conclui normal; **entrega** pode ser recusada (status `recusada` + `motivo_recusa`, por Gestor/Admin); **incidente** é registro/relato.
Motivo: plano de ação; `chave` conclui a demanda; `prazo` alimenta a métrica de % no prazo.

### acao_prerequisitos
`id` · `acao_id` (FK acoes) · `prerequisito_acao_id` (FK acoes) · `criado_em` · único `(acao_id, prerequisito_acao_id)`.
Motivo: múltiplos pré-requisitos por ação (decisão D10). Mesma demanda e ausência de ciclo são validadas no backend.

### comentarios
`id` · `acao_id` (FK) · `autor_id` (FK) · `texto` · `editado_em` (NULL = nunca editado) · `criado_em`.
Motivo: o "fórum" por ação. Sem coluna de exclusão (comentário nunca é excluído).

### notificacoes
`id` · `usuario_id` (FK, destinatário) · `tipo` (atribuicao/comentario/status/conclusao) · `titulo` · `mensagem` · `link` · `lida` · `lida_em` · `criado_em`.
Motivo: avisos internos e controle de leitura.

### fila_email
`id` · `usuario_id` (FK, opcional) · `email_destino` · `assunto` · `mensagem` · `status` (pendente/processando/enviado/erro/cancelado) · `tentativas` · `erro` · `enviado_em` · timestamps.
Motivo: enviar e-mail por SMTP sem travar o usuário; reprocessamento por cron.

### logs
`id` · `usuario_id` (FK, opcional) · `acao` · `entidade` · `entidade_id` · `ip` · `user_agent` · `detalhes` · `criado_em`.
Motivo: auditoria de ações críticas.

## 3. Relacionamentos

```txt
usuarios 1 ── N demandas            (criador_id; responsavel_id opcional)
demandas 1 ── N acoes               (demanda_id)
usuarios 1 ── N acoes               (responsavel_id opcional)
acoes    N ── N acoes               (via acao_prerequisitos: acao_id / prerequisito_acao_id)
acoes    1 ── N comentarios         (acao_id)
usuarios 1 ── N comentarios         (autor_id)
usuarios 1 ── N notificacoes        (usuario_id)
usuarios 1 ── N convites            (criado_por; usuario_id ao aceitar)
usuarios 1 ── N tokens_recuperacao  (usuario_id)
usuarios 1 ── N fila_email          (usuario_id opcional)
usuarios 1 ── N logs                (usuario_id opcional)
```

Comportamento de exclusão das FKs: padrão `RESTRICT` (o sistema não exclui registros; usa status/`ativo`). Sem `ON DELETE CASCADE` em dados com histórico.

## 4. Permissões por tipo de usuário

O MVP usa **perfil como campo** (`usuarios.perfil`), não uma tabela de permissões granular — não há evidência de RBAC granular nos documentos. A permissão é aplicada no backend (`includes/permissions.php`).

| Perfil | Pode ver | Pode criar/editar | Conclui ação | Administra usuários |
|---|---|---|---|---|
| administrador | Tudo | Demandas, ações, usuários, convites | Não (só o responsável da ação) | Sim |
| gestor | Todas as demandas/ações | Demandas e ações; atribui responsáveis | Não (só o responsável da ação) | Não |
| colaborador | Demandas em que está envolvido | Comentários nas suas ações | Sim, se for o responsável | Não |

> "Envolvido" (colaborador): é responsável por ao menos uma ação da demanda **ou** já comentou em alguma ação dela.

## 5. Regras de acesso

Aplicadas no backend (nunca só no frontend):

- Concluir ação: apenas o `responsavel_id` da ação.
- Ação fica `bloqueada` enquanto houver pré-requisito não `concluida`; só conclui quando todos concluírem.
- Uma única ação `chave` por demanda (validada no backend); concluí-la passa a demanda para `concluida`.
- Sem exclusão física: demandas/ações vão para `arquivada`/`cancelada`; usuários usam `ativo = 0`.
- Comentário: autor edita o próprio (`editado_em`); ninguém exclui.
- Escopo de visibilidade do colaborador aplicado nas consultas (filtra demandas por envolvimento).
- Status sempre validados contra a lista fechada (CHECK no schema + validação no backend).

## 6. Campos sensíveis

- `usuarios.senha_hash`: somente hash (`password_hash`); nunca senha em texto puro. Pode ser NULL até o convite ser aceito.
- `convites.token` e `tokens_recuperacao.token`: valores aleatórios, com expiração e uso único; não são exibidos no frontend além do link necessário.
- Credenciais de banco e SMTP ficam em `includes/config.php` (fora do repositório e da web), nunca no banco nem no frontend.
- `logs`: não registrar senha, token nem segredo.
- `notificacoes`/`fila_email`: conteúdo sem dado sensível.

## 7. Índices necessários

- usuarios: `UNIQUE(email)`, `idx(perfil)`, `idx(ativo)`.
- convites: `UNIQUE(token)`, `idx(email)`, `idx(status)`, FKs.
- tokens_recuperacao: `UNIQUE(token)`, `idx(usuario_id)`, `idx(expira_em)`.
- demandas: `idx(status)`, `idx(criador_id)`, `idx(responsavel_id)`, `idx(criado_em)`.
- acoes: `idx(demanda_id)`, `idx(responsavel_id)`, `idx(status)`, `idx(prazo)`.
- acao_prerequisitos: `UNIQUE(acao_id, prerequisito_acao_id)` + índices nas duas FKs.
- comentarios: `idx(acao_id)`, `idx(autor_id)`, `idx(criado_em)`.
- notificacoes: `idx(usuario_id, lida)`, `idx(criado_em)`.
- fila_email: `idx(status)`, `idx(criado_em)`.
- logs: `idx(usuario_id)`, `idx(acao)`, `idx(entidade, entidade_id)`, `idx(criado_em)`.

Critério: índices em campos de busca/filtro/ordenação reais (status, datas, FKs, login por e-mail, leitura de notificações). Sem índices preventivos.

## 8. Logs e auditoria

Tabela `logs`. Registrar (no backend) ações críticas: login, falha de login, logout, criação/aceite/cancelamento de convite, alteração de permissão, conclusão e arquivamento de demanda/ação, falha de envio de e-mail. Campos de contexto: `usuario_id`, `acao`, `entidade`, `entidade_id`, `ip`, `user_agent`, `detalhes`, `criado_em`. Nunca registrar dado sensível.

## 9. Dados para notificações

- `notificacoes`: avisos internos com controle de leitura (`lida`, `lida_em`).
- `fila_email`: e-mail operacional por SMTP, processado por cron, com `tentativas`/`erro` para reprocessamento.
- Observadores de uma ação (para notificar comentário) são **derivados em runtime** (responsável da ação + criador da demanda + autores de comentário) — sem tabela própria, conforme a descrição do produto.

## 10. Dados para gamificação

Nenhuma tabela. Gamificação está fora do MVP (`01-descricao-produto.md` §23). Não criar `pontos`, `niveis`, `conquistas` ou `ranking` nesta fase.

## 11. Dados para retenção

Sem tabelas dedicadas. A retenção é apoiada por dados já existentes: `notificacoes` (atribuição/novo comentário trazem o usuário de volta) e as consultas do dashboard ("minhas ações" e pendências) sobre `acoes`/`demandas`. Não há tabela de métricas no MVP.

## 11-A. Anexos de demandas (decisão de produto — D17)

Tabela `anexos` (trazida ao escopo por decisão de produto; ver D17 em `decisoes-pendentes.md`). Guarda apenas **metadados**; o arquivo fica em pasta privada fora da raiz pública (`storage/anexos/`), servido só via `api/anexos/baixar.php` com login + escopo.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | INT PK AI | |
| `demanda_id` | INT NOT NULL | FK → `demandas(id)` (sempre preenchido, garante o escopo) |
| `comentario_id` | INT NULL | FK → `comentarios(id)`. Preenchido = anexo de um comentário de ação |
| `acao_id` | INT NULL | FK → `acoes(id)`. Preenchido = evidência de uma ação (ex.: arquivo de análise — D19). Migration 010 |
| `nome_original` | VARCHAR(255) | nome exibido ao usuário |
| `nome_armazenado` | VARCHAR(120) UNIQUE | nome aleatório em disco (nunca o original) |
| `mime` | VARCHAR(120) | MIME real conferido por `finfo` |
| `tamanho` | INT | bytes |
| `criado_por` | INT NOT NULL | FK → `usuarios(id)` |
| `criado_em` | DATETIME | default `CURRENT_TIMESTAMP` |

Migrations: `008_add_anexos.sql` (criação), `009_add_anexo_comentario.sql` (coluna `comentario_id`) e `010_add_acao_tipo_recusa.sql` (coluna `acao_id`). Validação (tamanho/extensão allowlist/MIME), renomeação e bloqueio de execução ficam no backend (`includes/anexos.php`), conforme `boas-praticas-seguranca.md` §9.

**Anexos de comentário (D18) e de ação (D19):** a mesma tabela e a mesma pasta privada atendem anexos de comentários e evidências de ação. Quando `comentario_id` está preenchido, o anexo pertence ao comentário; quando `acao_id` está preenchido, é evidência da ação (ex.: arquivo de análise). No máximo um dos dois é preenchido; o `demanda_id` continua sempre gravado para manter o escopo de visibilidade/download. A listagem de anexos **da demanda** usa `comentario_id IS NULL AND acao_id IS NULL`; os de comentário/ação aparecem junto do próprio comentário/ação. Endpoints: `api/anexos/enviar-comentario.php` (autor do comentário), `api/anexos/enviar-acao.php` (responsável da ação ou Gestor/Admin), `api/anexos/listar-comentarios.php`, `api/anexos/listar-acoes.php` (GET, escopo da demanda) e o mesmo `api/anexos/baixar.php` (login + escopo).

## 11-B. Chat 1:1 entre usuários (decisão de produto — D20, Fase 1)

Não constava nos documentos; trazido por decisão de produto (ver D20 em `decisoes-pendentes.md`). Migration `011_add_chat.sql`. Duas tabelas novas:

- **conversas** — `id` · `usuario_a_id` (FK usuarios) · `usuario_b_id` (FK usuarios) · `criado_em`. Par **canônico** (`usuario_a_id < usuario_b_id`, único) → uma conversa por par.
- **mensagens** — `id` · `conversa_id` (FK conversas) · `autor_id` (FK usuarios) · `texto` · `demanda_id` (FK demandas, **referência opcional**) · `lida_em` (data de visualização; marcada quando o outro participante abre) · `criado_em` (data de envio).

Regras/segurança: só participantes da conversa leem/escrevem (validado no backend); a "notificação de nova mensagem" é o **contador de não lidas** (`api/chat/nao-lidas.php`), sem 1 notificação por mensagem (anti-spam); referenciar uma demanda exige que o **remetente** possa vê-la. Endpoints em `api/chat/`. **Fases seguintes (não feitas):** anexos por mensagem (`anexos.mensagem_id`), busca e exportação.

## 12. Fora do MVP

Não modelado agora (sem evidência ou explicitamente fora): pagamentos, gamificação/progresso, preferências/opt-out (e-mails são operacionais; tema fica no `localStorage`, não no banco), tabela de equipe, tabela de observadores, offline/sincronização, push/SMS/WhatsApp, webhooks, relatórios e qualquer tabela de permissões granular. (Uploads deixaram de estar fora do MVP por decisão de produto — ver §11-A e D17.)

## 13. Decisões pendentes

Não há decisões pendentes bloqueantes. Resolvido:

- **Bootstrap do primeiro administrador**: o primeiro cadastro vira admin, de forma controlada (enquanto `usuarios` estiver vazia; depois, só convite). Sem INSERT de admin no seed — a criação ocorre pelo backend com `password_hash`.

Itens operacionais em aberto (não bloqueiam): endereço do e-mail de suporte (definir depois) e logo definitiva. Ícones definidos: Lucide via CDN.

> Notas de implementação (não bloqueiam): a unicidade de "uma ação chave por demanda" e a ausência de ciclo em pré-requisitos são garantidas no backend (o MySQL não as expressa de forma simples). O `registrar_log` atual grava em arquivo; passará a persistir na tabela `logs` na fase de backend.

---

## Checklist de validação

- [x] Apenas tabelas com evidência nos documentos
- [x] Chaves primárias e estrangeiras definidas
- [x] Índices necessários (sem índices preventivos)
- [x] `criado_em`/`atualizado_em` presentes; sem `deleted_at` (regra de não exclusão física)
- [x] Senha apenas como `senha_hash` (hash no backend)
- [x] Sem dado sensível desnecessário
- [x] Sem tabelas de gamificação/progresso/preferências (fora do MVP)
- [x] Sem tabela de permissões granular (sem evidência)
