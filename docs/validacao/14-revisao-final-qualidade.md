# Revisão Final de Qualidade do MVP

> Revisão completa do Workspace S&A (Grupo Nexius) antes de considerar o MVP pronto.
> Base: documentos de produto/design/banco e boas práticas. Auditoria feita por leitura
> do código (não houve execução em ambiente nesta revisão; ver §3/§8 sobre testes reais).

## 1. Status geral

**MVP aprovado para uso, com pendências operacionais conhecidas (não bloqueiam o núcleo).**

O produto cumpre o que a descrição define (login/convites/onboarding, demandas com
questionário/GUT/triagem/SLA, plano de ação com ação chave/pré-requisitos/conclusão
assinada, comentários, dashboard/retenção, notificações internas) e recebeu ampliações
**decididas pelo dono do produto e registradas** em `decisoes-pendentes.md`: gamificação
(D14), tela de Ações + calendário (D16), anexos de demanda/comentário/ação (D17/D18/D19),
tipos de tarefa incl. reunião (D19), e chat 1:1 (D20). Stack respeitada (HTML/CSS/JS puro,
PHP procedural, MySQL, APIs JSON). Nenhum framework proibido.

## 2. Pontos aprovados

**Segurança**
- Senhas com `password_hash`/`password_verify` (login, setup, aceitar convite, redefinir, alterar). Nunca em texto puro.
- **Prepared statements** em todo acesso com entrada do usuário; os poucos `mysqli_query` diretos são SQL estático (`listar_convites`, `contar_usuarios`, health).
- Nenhuma concatenação de `$_GET/$_POST` em SQL.
- Sessão segura (`iniciar_sessao_segura`); endpoints privados com `exigir_login`/`exigir_perfil`.
- Erros ao usuário são genéricos; `display_errors=Off` e `log_errors=On` no Dockerfile.
- Uploads: pasta privada fora do docroot, allowlist + MIME real (finfo), renomeação, sem execução, download só via API com escopo.

**Código**
- 57 endpoints, **todos** retornando JSON padronizado (`ok`) via `json_sucesso`/`json_erro`/`json_response`.
- 21 arquivos JS, **todos referenciados** (sem JS morto). Camadas separadas (includes = dados/regra; api = endpoints finos; public = front).
- Regra de negócio no backend; front só exibe/valida por conveniência.

**Frontend**
- Segue o guia visual (tokens em `theme.css`, paleta, tipografia, componentes).
- Responsivo nos breakpoints do guia (≤640 / 641–1024 / >1024); tabelas viram cards no mobile.
- Estados de carregando (skeleton), vazio, erro e sucesso presentes.
- Acessibilidade básica: `label` em campos, `aria-live` em alertas, `:focus-visible`, `alt` na logo, `prefers-reduced-motion`.

**Banco**
- Tabelas coerentes e normalizadas, com PK/FK/índices e `CHECK` para listas fechadas (status, tipo, perfil).
- Migrations 001–012 versionadas; `install.sql` consolidado para instalação limpa.
- Sem exclusão física (status/flags).

## 3. Problemas críticos

**Nenhum problema crítico de código/segurança encontrado.**

Único risco "crítico" é **operacional, não de código**: histórico recente mostrou que
**migrations e o `chown` de `storage/anexos` precisam ser aplicados no ambiente** a cada
deploy; se esquecidos, anexos/tipos falham. Mitigado pelo Dockerfile (permissão no start)
e pelo checklist de deploy. **Migrations 008–012 devem estar aplicadas em produção.**

## 4. Problemas médios

1. **E-mail em sandbox (Resend).** Integração funciona, mas usa remetente `onboarding@resend.dev`, que só entrega ao dono da conta. Recuperação de senha e notificações por e-mail só chegam a terceiros após **verificar um domínio** na Resend e ajustar `SMTP_REMETENTE`. (Pendência registrada; sem código.)
2. ~~**Documentação de escopo desatualizada.**~~ **Corrigido nesta revisão (ver §6):** `01-descricao-produto.md` (§10/§11) e `08-plano-funcionalidades-mvp.md` (§10) agora referenciam as decisões D14–D20 e separam o que permanece fora do MVP.
3. **`EMAIL_SUPORTE` placeholder** (`suporte@exemplo.com`) — exibido na Ajuda; definir o oficial.
4. **Assets de logo grandes** (`logo_claro.png` ~2 MB, `logo_escuro.png` ~875 KB) — pesam no carregamento; otimizar ou exportar SVG.

## 5. Melhorias futuras (fora do MVP / próximas fases)

- **Chat Fase 2** (D20): anexos por mensagem, busca e exportação da conversa, referência a ação.
- **D15**: resumo periódico por e-mail (digest) / push — exige decisão de produto + consentimento/anti-spam.
- Edição de participantes de reunião após a criação (hoje só na criação).
- Fluxo de reabertura para ação chave recusada (hoje deixa a demanda sem conclusão automática).
- Testes automatizados / smoke tests (hoje a validação é manual).

## 6. Correções realizadas (nesta revisão)

- **`.gitignore`**: passa a ignorar `public/assets/img/*-teste.png` (rascunhos de logo que sujavam o `git status` a cada commit; arquivos não são apagados, apenas deixam de ser rastreados).
- **Doc-sync de escopo:** `01-descricao-produto.md` (§10/§11) e `08-plano-funcionalidades-mvp.md` (§10) atualizados para referenciar D14–D20 (itens trazidos ao escopo por decisão) e separar o que permanece fora (pagamentos, offline/PWA, relatórios, push/SMS/WhatsApp, digest D15).
- **Logos** corrigidas/otimizadas (inversão claro/escuro desfeita; arquivos mais leves).
- Este relatório (`docs/validacao/14-revisao-final-qualidade.md`).

Nenhuma correção de código foi necessária: a auditoria de segurança, consistência de JSON e arquivos mortos passou.

## 7. Decisões pendentes (em `docs/decisoes-pendentes.md`)

- **D15** — digest/push (aberto; precisa de decisão de produto).
- **E-mail** — verificar domínio definitivo na Resend para sair do sandbox.
- **E-mail de suporte** — definir endereço oficial.

## 8. Checklist final

**Produto**
- [x] Segue a descrição do produto (núcleo) + ampliações por decisão registrada.
- [x] Sem funcionalidade fora de escopo sem registro (todas em D14–D20).
- [x] Regras de negócio respeitadas (ação chave, pré-requisito, conclusão assinada, tipos, recusa).
- [x] Permissões respeitadas (admin/gestor/colaborador; escopo do colaborador no backend).

**Código**
- [x] Estrutura organizada (includes/api/public; cron).
- [x] Stack respeitada.
- [x] Sem duplicação relevante (upload unificado em `processar_anexos_upload`; helpers compartilhados).
- [x] Sem arquivos mortos (JS/endpoints).
- [x] APIs retornam JSON consistente.

**Segurança**
- [x] Login seguro / [x] hash de senha / [x] validação backend / [x] permissões backend.
- [x] Erros sem vazamento técnico / [x] SQL com prepared statements.

**Frontend**
- [x] Visual segue guia / [x] responsivo / [x] loading/erro/vazio / [x] validação de formulário / [x] acessibilidade básica.

**Banco**
- [x] Tabelas coerentes / [x] chaves e índices / [x] dados do MVP cobertos.

**Operacional (verificar no ambiente)**
- [ ] Migrations 008–012 aplicadas em produção.
- [ ] Volume persistente + permissão de `storage/anexos`.
- [ ] Domínio de e-mail verificado (Resend) e `SMTP_REMETENTE`/`APP_URL` corretos.
- [ ] Passe visual de QA no mobile real.
