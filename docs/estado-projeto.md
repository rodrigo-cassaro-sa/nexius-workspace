# Estado do Projeto — Workspace S&A (Grupo Nexius)

Documento-índice do estado atual, para manutenção rápida. Fonte de "onde estamos". Detalhes por decisão em `docs/decisoes-pendentes.md` (D1–D25 + B1); modelo de dados em `docs/banco/03-modelagem-banco-dados.md`; telas em `docs/produto/03-mapa-de-telas.md`; QA em `docs/validacao/17-roteiro-qa.md`.

## Stack
HTML · CSS · JavaScript puro · PHP procedural · MySQL · APIs JSON. Sem frameworks/ORM. Deploy em EasyPanel (Docker `php:8.2-apache`), MySQL externo (droplet, VPC). E-mail via Resend. Timezone do container: America/Sao_Paulo.

## Telas (todas responsivas; permissão real no backend)
| Tela | Arquivo | Quem acessa |
|---|---|---|
| Login / Cadastro / Recuperar / Onboarding | index, cadastro, recuperar-senha, onboarding | público / convidado / recém-ativado |
| Dashboard | dashboard.html | todos (escopo) |
| Demandas (lista) / Demanda (detalhe) | demandas, demanda | todos (escopo); criar/editar = Gestor/Admin |
| Projetos / Projeto | projetos, projeto | todos (escopo); gerir = Gestor/Admin |
| Ações (lista + calendário) | acoes.html | todos (escopo) |
| Roadmap (Gantt) | roadmap.html | todos (escopo); editar/recalcular = Gestor/Admin/key user |
| Notificações / Mensagens (chat) | notificacoes, chat | todos |
| Relatórios | relatorios.html | Gestor/Admin |
| Controle (higiene) | higiene.html | Gestor/Admin |
| Progresso | progresso.html | todos |
| Usuários | admin-usuarios.html | Admin |
| Auditoria | auditoria.html | Admin |
| Perfil | perfil.html | todos |

## Famílias de endpoints (`api/`)
auth (login com captcha, logout, setup, recuperar/redefinir, me, captcha) · usuarios · convites · demandas (criar/atualizar/detalhe/listar/arquivar/reabrir/definir-projeto/-prazo/-responsavel) · acoes (criar/concluir/recusar/reabrir/definir-chave/-prazo/-responsavel/-esforco/participantes/listar/calendario) · comentarios · anexos · notificacoes · chat · setores · projetos · relatorios · roadmap · agenda (previa/recalcular/desfazer) · higiene · logs · dashboard · gamificacao · perfil · onboarding · health.

## Modelo de dados (migrations 001–022)
Tabelas: `usuarios` (+ setor_id, capacidade_semana, digest_*), `setores`, `projetos` (+ prazo), `convites` (+ setor_id), `tokens_recuperacao`, `demandas` (+ questionário/GUT/triagem/SLA, setor_id, projeto_id, prazo, responsavel_id), `acoes` (+ tipo, motivo_recusa, decisoes, prazo, esforco_dias, chave), `acao_prerequisitos`, `acao_participantes`, `comentarios`, `notificacoes`, `fila_email`, `anexos`, `conversas`, `mensagens`, `logs`, `agenda_prazo_backup`. Detalhe completo em `03-modelagem-banco-dados.md`.

## Crons (na imagem — `docker/app-cron`, horário de Brasília)
- `processar-fila-email.php` — a cada 5 min.
- `backup-banco.sh` — 02:00 (dump em `storage/backups`, retenção ~12 meses).
- `limpar-logs.php` — 03:00 (retenção 1 ano dos logs).
- `enviar-digest.php` — segunda 08:00.

## Pendências operacionais (do lado do dono)
- **Domínio na Resend** (verificar SPF/DKIM + `SMTP_REMETENTE`) — sem isso e-mails só vão para o dono da conta.
- **Envs:** definir `EMAIL_SUPORTE`; confirmar `APP_URL` e `HEALTH_DEBUG=off`.
- **Backup:** garantir **volume persistente** cobrindo `storage/backups`; **cópia offsite** adiada para a última etapa.
- **QA em produção** — roteiro em `docs/validacao/17-roteiro-qa.md`.
- **Monitor de uptime** externo apontando para `/api/health.php` (opcional).

## Migrations aplicadas
001–022 aplicadas ✔ (a 019 garante `logs`; 020 prazos; 021 esforço/capacidade; 022 backup de agenda).

## Limitações conscientes (registradas)
- Recálculo de agenda não considera dias úteis/feriados (capacidade em dias corridos).
- Sem push, sem chat fases 2+ (decisões do dono).

> Ao concluir um item novo: implementar → atualizar `03-modelagem-banco-dados.md` (se mexer no schema) e este índice → **acrescentar ao roteiro de QA** → commit/push.
