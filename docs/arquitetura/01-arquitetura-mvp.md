# Arquitetura do MVP

Projeto: Workspace S&A (marca Grupo Nexius).
Base: `01-descricao-produto.md`, `03-mapa-de-telas.md`, `02-guia-visual.md`, `decisoes-pendentes.md` e os documentos de boas práticas.
Objetivo deste documento: definir a arquitetura do MVP antes de codar. Nenhum código é implementado aqui.

---

## 1. Visão geral

O Workspace S&A é um SaaS web responsivo para equipes internas controlarem demandas de projeto. Cada demanda vira um plano de ação; ações têm responsável, prazo, status e podem depender de outras (pré-requisitos). A demanda conclui quando sua ação chave conclui. Há comentários por ação, notificações (interna + e-mail) e administração de usuários por convite.

A arquitetura é simples e procedural: frontend estático (HTML/CSS/JS puro) que consome APIs JSON em PHP procedural sobre MySQL. O frontend nunca acessa o banco; toda regra e permissão vive no backend.

```txt
Navegador (HTML/CSS/JS)
  ↓  fetch JSON (credentials: include)
API PHP (/api/...)
  ↓
Funções reutilizáveis (includes/)
  ↓
MySQL (prepared statements)
```

## 2. Stack obrigatória

- HTML
- CSS
- JavaScript puro
- PHP procedural (sem classes, sem OO, sem framework)
- MySQL (InnoDB, utf8mb4)
- APIs JSON

Não usar: React, Vue, Angular, Next.js, Node.js, TypeScript, Laravel/Symfony, frameworks SPA, ORM pesado, jQuery, Tailwind/Bootstrap. Dependência externa só com aprovação. Exceções já aprovadas: **SMTP** para e-mail (backend) e **CDN de ícones** no frontend (decisões D8 e D13).

## 3. Separação de responsabilidades

- **Frontend (`public/`)**: estrutura (HTML), aparência (CSS), interação e chamadas de API (JS). Exibe estados (carregando, vazio, erro, sucesso, sem permissão). Não contém regra de negócio, segredo nem permissão real.
- **API (`api/`)**: um endpoint por ação. Valida método, entrada, sessão e permissão; chama as funções de `includes/`; responde JSON padronizado.
- **Includes (`includes/`)**: funções reutilizáveis procedurais — conexão, resposta, sessão/auth, permissões, validação, acesso a dados por área, regras de negócio, log, e-mail/fila e notificações. Não contém HTML.
- **Cron (`cron/`)**: rotinas automáticas (processar fila de e-mail).
- **Banco (`sql/`)**: schema, seed e migrações.

> Adaptação da estrutura sugerida: em PHP procedural não criamos classes `Repository/Service/Validator`. O papel de "validators" fica em `includes/validate.php`; "repositories" viram funções de acesso a dados por área (ex.: `includes/demandas.php`); "services" viram funções de regra de negócio nas mesmas/áreas; "middlewares" viram chamadas no topo do endpoint (`exigir_login()`, `exigir_permissao(...)`).

## 4. Estrutura de pastas

Estrutura mínima do MVP (criar só o necessário; sem pastas vazias preventivas):

```txt
public/                      # único conteúdo servido diretamente ao navegador
  index.html                 # Login
  cadastro.html              # Aceite de convite (definir senha)
  recuperar-senha.html
  redefinir-senha.html
  onboarding.html
  dashboard.html
  demandas.html              # Lista de demandas
  demanda.html               # Detalhe da demanda + plano de ação + comentários
  notificacoes.html
  perfil.html                # inclui preferências e tema (Configurações unida ao Perfil)
  admin-usuarios.html        # Administração de usuários e permissões
  ajuda.html
  erro.html
  css/
    reset.css
    theme.css                # tokens: cores (claro/escuro), espaços, raios, transições
    components.css
    pages.css
  js/
    api.js                   # postApi/getApi
    auth.js                  # verificação de sessão no front
    app.js                   # utilidades comuns, tema claro/escuro
    <pagina>.js              # ex.: dashboard.js, demanda.js
  assets/
    imagens/
    logos/

api/                         # endpoints JSON (PHP procedural)
  auth/
  convites/
  usuarios/
  demandas/
  acoes/
  comentarios/
  notificacoes/
  dashboard/

includes/                    # funções reutilizáveis (não acessível pela web)
  config.example.php         # modelo versionado (config.php real fora do repositório)
  db.php                     # conexão mysqli
  response.php               # json_response()
  auth.php                   # sessão, login, exigir_login()
  permissions.php            # perfis e escopo de visibilidade
  validate.php               # validações de entrada
  log.php                    # registrar_log()
  mailer.php                 # envio SMTP
  fila_email.php             # enfileirar/processar e-mail
  notificacoes.php           # criar notificação + resolver observadores
  demandas.php               # acesso a dados e regras de demandas
  acoes.php                  # acesso a dados e regras de ações/pré-requisitos
  comentarios.php
  usuarios.php
  convites.php

cron/
  processar-fila-email.php

sql/
  schema.sql
  seed.sql
  migrations/

logs/                        # logs em arquivo (não acessível pela web)
```

> `storage/`, `backups/` e webhooks não entram no MVP (sem uploads e sem integração externa de entrada). Criar apenas se um requisito futuro exigir.

> Exposição web: apenas `public/` e `api/` precisam ser alcançáveis pelo navegador. `includes/`, `cron/`, `sql/`, `logs/` e o `config.php` real não podem ser servidos pela web (document root em `public/` com `api/` acessível, ou bloqueio por regra do servidor). Detalhe de servidor fica na fase de infraestrutura.

## 5. Fluxo frontend

1. A página HTML carrega CSS e o JS específico.
2. `auth.js` confirma sessão chamando um endpoint protegido; se não autenticado, redireciona ao login.
3. O JS da página busca dados via `api.js` (`getApi`/`postApi`, sempre `credentials: "include"`).
4. Renderiza estados: carregando (skeleton), vazio, erro, sucesso e sem permissão.
5. Ações do usuário chamam endpoints; o backend valida e responde JSON; o front mostra feedback (interno) e atualiza a tela.
6. Tema claro/escuro: `app.js` alterna `data-tema` na raiz e guarda a preferência em `localStorage` (preferência visual, não sensível).

Regras: usar `textContent` para dados do usuário (evitar `innerHTML`); não colocar permissão/segredo no front; centralizar chamadas em `api.js`; remover `console.log` de debug.

## 6. Fluxo backend

Ordem padrão de cada endpoint (conforme `boas-praticas-backend.md`):

```txt
1. require_once includes necessários
2. validar método HTTP
3. ler e decodificar entrada (JSON)
4. validar dados obrigatórios, tipos e tamanhos
5. exigir_login() quando privado
6. exigir_permissao(...) quando aplicável
7. abrir conexão / transação quando necessário
8. executar a ação (funções de includes)
9. registrar log quando crítico
10. responder JSON padronizado
```

Cada endpoint tem responsabilidade única. Sem endpoint genérico do tipo `acao.php?tipo=`. Transação quando a ação altera mais de uma tabela (ex.: aceitar convite cria usuário e invalida convite; concluir ação chave conclui a demanda).

## 7. APIs JSON

Formato único de resposta:

```json
{ "ok": true, "data": {} }
```
```json
{ "ok": true, "message": "Operação realizada com sucesso." }
```
```json
{ "ok": false, "error": "Não foi possível processar a solicitação." }
```

Convenção de métodos (projeto simples): `GET` para consulta; `POST` para criar, atualizar, concluir, arquivar e ações. Erros nunca expõem detalhe técnico, SQL ou caminho interno.

Endpoints previstos no MVP (derivados do mapa de telas; criar só o necessário):

- `auth/`: `login.php`, `logout.php`, `recuperar-senha.php`, `redefinir-senha.php`, `sessao.php` (checagem de sessão)
- `convites/`: `criar.php`, `aceitar.php`, `listar.php`, `reenviar.php`, `cancelar.php`
- `usuarios/`: `listar.php`, `atualizar-perfil.php`, `alterar-senha.php`, `alterar-permissao.php`, `inativar.php`
- `demandas/`: `criar.php`, `listar.php`, `detalhe.php`, `atualizar.php`, `arquivar.php`
- `acoes/`: `criar.php`, `atualizar.php`, `concluir.php`, `arquivar.php` (marcação de chave e pré-requisitos tratados em criar/atualizar)
- `comentarios/`: `listar.php`, `criar.php`, `editar.php`
- `notificacoes/`: `listar.php`, `marcar-lida.php`, `marcar-todas-lidas.php`
- `dashboard/`: `resumo.php`

## 8. Autenticação e sessão

- Acesso só por **convite** (sem cadastro aberto). Admin cria o convite (token, e-mail, perfil, validade 7 dias, uso único); aceitar o convite define a senha e cria o usuário.
- **Bootstrap do primeiro admin**: enquanto a tabela `usuarios` estiver vazia, um endpoint/tela de setup cria a primeira conta como `administrador`; depois disso o caminho é desativado e só vale convite.
- Login com e-mail e senha: `password_verify`; senha gravada com `password_hash`.
- Sessão PHP por cookie seguro (`httponly`, `secure`, `samesite=Strict`); `session_regenerate_id(true)` após login; destruir no logout.
- Recuperação de senha: token em `tokens_recuperacao`, validade **30 minutos**, uso único; mensagem neutra (não revela se o e-mail existe).
- Endpoints privados verificam sessão ativa via `exigir_login()`.

## 9. Permissões

Perfis: `administrador`, `gestor`, `colaborador`. Permissão validada sempre no backend (`includes/permissions.php`).

- **Administrador**: tudo (usuários, convites, perfis, todas as demandas/ações).
- **Gestor/Responsável**: cria/edita demandas e ações, atribui responsáveis; **vê todas as demandas** (escopo amplo).
- **Colaborador**: vê uma demanda quando **envolvido** = é responsável por ao menos uma ação dela **OU** já comentou em alguma ação dela. Conclui apenas as ações sob sua responsabilidade.

Regras de ação reforçadas no backend:

- Concluir ação: apenas o responsável da ação.
- Ação bloqueada enquanto houver pré-requisito não concluído (pode haver vários; todos precisam concluir).
- Uma única ação chave por demanda; concluí-la conclui a demanda.
- Sem exclusão física: arquivar/cancelar via status (gestor/admin). Comentário nunca é excluído; autor edita o próprio.

## 10. Dados e banco

MySQL InnoDB, utf8mb4. Nomes em português, minúsculos, sem acento, `snake_case`. Datas em tipos próprios; valores não monetários no MVP. Prepared statements sempre. Detalhe de campos/índices fica na etapa de modelagem (`boas-praticas-banco-dados.md`).

Entidades do MVP (de `01-descricao-produto.md` §19):

```txt
usuarios            (perfil, senha_hash, ativo, onboarding_concluido, ...)
convites            (token, email, perfil, expira_em, status, criado_por)
tokens_recuperacao  (usuario_id, token, expira_em, usado)
demandas            (titulo, descricao, status, criador_id, ...)
acoes               (demanda_id, responsavel_id, status, prazo, chave, ...)
acao_prerequisitos  (acao_id, prerequisito_acao_id)   # múltiplos pré-requisitos
comentarios         (acao_id, autor_id, texto, criado_em, editado_em)
notificacoes        (usuario_id, tipo, titulo, mensagem, link, lida, ...)
fila_email          (destino, assunto, mensagem, status, tentativas, ...)
logs                (usuario_id, acao, entidade, entidade_id, ip, ...)
```

Status (lista fechada, validada no backend):

- Demanda: `aberta`, `em_andamento`, `concluida`, `arquivada`, `cancelada`.
- Ação: `pendente`, `bloqueada`, `concluida`, `cancelada`.

Observadores de ação (para notificação de comentário) são **derivados em runtime** (responsável da ação + criador da demanda + autores de comentário), sem tabela própria no MVP.

## 11. Offline, se aplicável

**Não aplicável no MVP.** Sem IndexedDB, Service Worker, fila local, cache offline ou PWA (`01-descricao-produto.md` §23). O sistema exige conexão. Se for solicitado no futuro, seguir `boas-praticas-offline.md`.

## 12. Notificações

- Tipos no MVP: **interna** (tabela `notificacoes`) e **e-mail** (SMTP).
- E-mail enviado por **fila** (`fila_email`) processada por **cron** (`cron/processar-fila-email.php`), com reprocessamento limitado; o envio não trava a ação do usuário.
- Eventos: atribuição de demanda/ação; novo comentário (para os observadores da ação); mudança de status da demanda; conclusão de ação/demanda.
- Sem push, SMS ou WhatsApp. E-mails são operacionais e sempre enviados (sem opt-out no MVP).
- Conteúdo sem dado sensível. Credenciais SMTP só no backend (`config.php`). Evitar duplicidade (não notificar o próprio autor do comentário; deduplicar observadores).

## 13. Logs e auditoria

`includes/log.php` centraliza o registro. Registrar ações críticas: login, falha de login, logout, criação/aceite/cancelamento de convite, alteração de permissão, conclusão e arquivamento de demanda/ação, falha de envio de e-mail. Campos: `usuario_id`, `acao`, `entidade`, `entidade_id`, `ip`, `user_agent`, `detalhes`, `criado_em`. Nunca registrar senha, token ou segredo. Logs não acessíveis pela web.

## 14. Segurança

- Prepared statements em todo SQL; nunca concatenar entrada do usuário.
- `password_hash`/`password_verify`; nunca senha pura; token sensível nunca em `localStorage`.
- Sessão segura por cookie; permissão validada no backend; CSS/JS não são barreira de segurança.
- Não expor erro técnico, SQL, stack trace ou caminho ao usuário final.
- Segredos (SMTP, banco) apenas no `config.php` real, fora do repositório e fora da web.
- `includes/`, `cron/`, `sql/`, `logs/` fora do alcance público.
- Validar método HTTP, dados obrigatórios, tipos, tamanhos e status permitidos em todo endpoint.
- Usuário do banco com permissão limitada (não root). Demais itens de publicação na fase de infraestrutura.

## 15. Responsivo desktop/mobile

Layout responsivo único (sem app nativo). Desktop: topbar + sidebar fixa. Mobile: topbar com menu deslizante; tabelas (lista de demandas, lista de ações) viram cartões empilhados. Breakpoints: mobile ≤640px, tablet 641–1024px, desktop >1024px. Tokens visuais e modo claro/escuro em `theme.css` (`02-guia-visual.md`). Ícones **Lucide** via CDN, com alternativa acessível (texto/aria) caso falhe.

## 16. Padrões de nomes

- Arquivos públicos: minúsculos com hífen (ex.: `recuperar-senha.html`).
- Arquivos/funcões internas: `snake_case` em PHP (ex.: `usuario_esta_logado`); funções JS em `camelCase` com verbo (ex.: `carregarDemandas`).
- Endpoints: `area/acao.php` (ex.: `demandas/criar.php`).
- Tabelas e campos: minúsculos, sem acento, `snake_case`, em português.
- Status: valores fixos minúsculos com underline (lista fechada na seção 10).
- Resposta JSON sempre com `ok`.

## 17. Arquivos principais do MVP

Telas (`public/*.html`): login, cadastro (aceite de convite), recuperar-senha, redefinir-senha, onboarding, dashboard, demandas, demanda, notificacoes, perfil, admin-usuarios, ajuda, erro.

Includes-chave: `db.php`, `response.php`, `auth.php`, `permissions.php`, `validate.php`, `log.php`, `mailer.php`, `fila_email.php`, `notificacoes.php`, e os módulos de dados por área (`demandas.php`, `acoes.php`, `comentarios.php`, `usuarios.php`, `convites.php`).

Endpoints-chave: ver seção 7. Cron: `processar-fila-email.php`. Banco: `sql/schema.sql`, `sql/seed.sql`.

Ordem de implementação sugerida (partes pequenas e testáveis):

1. Fundação: `config`, `db.php`, `response.php`, `auth.php`, `validate.php`, schema base.
2. Usuários + convites + login + sessão + recuperação de senha.
3. Demandas (CRUD + arquivar).
4. Ações (criar/atualizar, chave, prazo, pré-requisitos, concluir, bloqueio).
5. Comentários (listar/criar/editar).
6. Permissões e escopo de visibilidade aplicados aos endpoints.
7. Dashboard (resumo).
8. Notificações internas.
9. E-mail (mailer + fila + cron).

## 18. Fora do escopo

Não construir no MVP: pagamentos, gamificação, offline/PWA/Service Worker, relatórios, notificações push/SMS/WhatsApp, integrações externas (além do SMTP), uploads, webhooks, cadastro aberto, exclusão física, tela separada de Configurações, entidade de equipe e tabela própria de observadores. Não criar tela, endpoint, campo ou tabela sem evidência nos documentos.

## 19. Decisões pendentes

Não há pendências bloqueantes (ver `docs/decisoes-pendentes.md`). Itens operacionais a confirmar na implementação:

- Endereço do e-mail de suporte (tela de Ajuda) — definir depois.
- Logo definitiva do Grupo Nexius (hoje placeholder em texto).
- Parâmetros de servidor/infra (document root, HTTPS, SLA de disponibilidade).

Resolvidos: bootstrap do primeiro admin (primeiro cadastro vira admin, controlado); ícones Lucide via CDN.

---

## Checklist de validação

- [x] Coerente com a stack (HTML/CSS/JS puro, PHP procedural, MySQL, JSON)
- [x] Sem camadas OO ou complexidade desnecessária
- [x] Estrutura adaptada do `boas-praticas-arquitetura.md`
- [x] Frontend separado do backend; banco só via backend
- [x] Permissões e escopo definidos no backend
- [x] Apenas funcionalidades do MVP
- [x] Sem decisões pendentes bloqueantes
