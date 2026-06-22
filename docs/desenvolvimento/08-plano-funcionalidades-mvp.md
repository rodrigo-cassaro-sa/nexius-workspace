# Plano de Implementação das Funcionalidades do MVP

Base: `01-descricao-produto.md` (§10, §15) e `03-mapa-de-telas.md`.
Já implementado nas fases anteriores: login/recuperação/sessão, convites (gestão de usuários) e onboarding.

## 1. Funcionalidades identificadas

Funcionalidades principais do MVP ainda pendentes:

- **Demandas (CRUD)** — criar, listar, ver detalhe, editar, arquivar/cancelar.
- **Plano de ação / Ações** — criar ações, concluir, ação chave, pré-requisitos, bloqueio.
- **Comentários** — discussão por ação (criar, listar, editar o próprio).
- **Atribuição de responsável** — demanda e ação; filtro por responsável.
- **Dashboard** — demandas por status, "minhas ações", pendências, % de ações no prazo.
- **Notificações internas** — atribuição, comentário, mudança de status, conclusão.
- **Envio de e-mail** — processar `fila_email` (SMTP + cron).

## 2. Ordem recomendada

1. **Demandas (CRUD)** ← primeira (base de tudo).
2. Ações (plano de ação, chave, pré-requisito, conclusão).
3. Comentários (dentro da ação).
4. Atribuição/filtro (refinado junto de Demandas e Ações).
5. Dashboard (consome Demandas/Ações).
6. Notificações internas (geradas pelos eventos das fases 1–4).
7. Envio de e-mail (cron + SMTP processando a fila).

## 3. Dependências

- Ações dependem de Demandas.
- Comentários dependem de Ações.
- Dashboard depende de Demandas e Ações.
- Notificações dependem dos eventos de Demandas/Ações/Comentários.
- Atribuição depende de usuários (já existem).

## 4. Telas necessárias

- `demandas.html` (Lista) e `demanda.html` (Detalhe/edição) — Demandas; Ações e Comentários ficam dentro de `demanda.html`.
- `dashboard.html` (resumo) — já existe como base.
- `notificacoes.html`.

## 5. Endpoints necessários

- `demandas/`: criar, listar, detalhe, atualizar, arquivar.
- `acoes/`: criar, atualizar, concluir, arquivar (+ pré-requisitos).
- `comentarios/`: listar, criar, editar.
- `usuarios/listar` (responsável e filtro).
- `dashboard/resumo`.
- `notificacoes/`: listar, marcar-lida, marcar-todas-lidas.

## 6. Tabelas envolvidas

`demandas`, `acoes`, `acao_prerequisitos`, `comentarios`, `usuarios`, `notificacoes`, `fila_email`, `logs`.

## 7. Permissões

- **Administrador:** tudo.
- **Gestor/Responsável:** cria/edita demandas e ações, atribui responsáveis, vê todas as demandas.
- **Colaborador:** vê demandas em que está envolvido (responsável de ação OU comentou); conclui apenas as ações sob sua responsabilidade.

## 8. Estados de tela

Por tela: carregando (skeleton), vazio, erro, sucesso, sem permissão. Validação de experiência no front e regra real no backend.

## 9. Critérios de aceite

- Cada funcionalidade é testável isoladamente.
- Backend valida método, entrada, sessão, permissão e regra de negócio.
- Respostas JSON padronizadas (`ok`).
- Respeita o design system e é responsivo.

## 10. Fora do escopo

Pagamentos, gamificação, offline/PWA, relatórios, push/SMS/WhatsApp, exclusão física, edição/exclusão de comentário por terceiros, registro aberto, e qualquer tela/endpoint/tabela sem evidência nos documentos.

---

## Funcionalidade 1 — Demandas (CRUD)

### Objetivo
Registrar e acompanhar demandas de projeto: criar, listar (com filtro e escopo de visibilidade), ver detalhe, editar e arquivar/cancelar. É a base para o plano de ação.

### Arquivos frontend
- `public/demandas.html` + `public/js/demandas.js` (lista + filtros + criar via modal).
- `public/demanda.html` + `public/js/demanda.js` (detalhe + editar + arquivar).
- Link "Demandas" no dashboard.

### Arquivos backend
- `includes/demandas.php` (dados + escopo + regras).
- `includes/usuarios.php` (+ `listar_usuarios_ativos`).
- `includes/db.php` (+ helper `executar_select`).

### Endpoints
- `api/demandas/criar.php`, `listar.php`, `detalhe.php`, `atualizar.php`, `arquivar.php`.
- `api/usuarios/listar.php` (responsável e filtro).

### Tabelas
- `demandas` (escrita/leitura), `usuarios` (leitura), `acoes`/`comentarios` (leitura, só para o escopo do colaborador).

### Permissões
- Criar/editar/arquivar: Gestor e Administrador.
- Listar/ver: Admin e Gestor veem todas; Colaborador vê só as em que está envolvido.

### Validações
- `titulo` obrigatório (2–160). `descricao` opcional. `responsavel_id` opcional, deve ser usuário ativo.
- `status` manual permitido: `aberta`, `em_andamento` (editar) e `arquivada`/`cancelada` (arquivar). **`concluida` nunca é manual** (vem da ação chave).

### Estados
carregando (skeleton), vazio ("Nenhuma demanda ainda"), erro (tentar novamente), sucesso, sem permissão.

### Critérios de aceite
- Gestor/Admin cria uma demanda e ela aparece na lista.
- Filtro por status e busca por título funcionam.
- Detalhe abre com os dados; Gestor/Admin edita e arquiva.
- Colaborador não vê demandas sem envolvimento e não consegue criar (backend bloqueia).
- Arquivadas/canceladas só aparecem com o filtro correspondente.
