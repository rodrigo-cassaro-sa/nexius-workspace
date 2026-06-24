# Decisões Pendentes

Registro central de informações que faltam ou decisões em aberto identificadas durante a validação da documentação (`docs/validacao/00-validacao-documentacao.md`).

Status: aberto = aguardando definição; resolvido = decidido e refletido na descrição do produto.

Convenção: D = decisão. Bloqueante = impede parte do MVP.

---

## Bloqueiam o MVP — RESOLVIDAS

Todas refletidas em `01-descricao-produto.md` (§9, §16 e §19).

| ID | Tema | Decisão | Impacto | Status |
|---|---|---|---|---|
| D1 | Convites | Validade 7 dias, uso único; reenvio gera novo token e invalida o anterior; perfil já definido no convite. | Cadastro e Administração | resolvido |
| D2 | Recuperação de senha | Token com validade de 30 minutos, uso único (entidade `tokens_recuperacao`). | Recuperação de senha | resolvido |
| D3 | Escopo do Colaborador | Envolvido = responsável de ao menos uma ação da demanda OU autor de comentário em alguma ação dela. | Permissões e consultas | resolvido |
| D4 | Escopo do Gestor | Gestor vê todas as demandas; só o Colaborador é restrito. Sem entidade de equipe. | Permissões e consultas | resolvido |
| D5 | Observadores de ação | Responsável da ação + criador da demanda + autores de comentário na ação. Derivado em runtime (sem tabela no MVP). | Notificações | resolvido |
| D6 | Status enumerados | Demanda: aberta, em_andamento, concluida, arquivada, cancelada. Ação: pendente, bloqueada, concluida, cancelada. | Banco e validação | resolvido |

---

## Não bloqueiam o início — RESOLVIDAS

| ID | Tema | Decisão | Status |
|---|---|---|---|
| D7 | Fila de e-mail | Tabela `fila_email` + cron, com reprocessamento limitado. | resolvido |
| D8 | Provedor de e-mail | SMTP configurado no backend (credenciais protegidas). | resolvido |
| D9 | Onboarding | Flag de onboarding concluído como campo em `usuarios`. | resolvido |
| D10 | Pré-requisito | Múltiplos por ação — tabela `acao_prerequisitos`; sem dependência circular. | resolvido |
| D11 | Configurações | Sem tela separada no MVP; ajustes (dados, senha, tema) no Perfil. | resolvido |
| D12 | Suporte | E-mail de suporte (mailto) na tela de Ajuda. | resolvido |
| D13 | Não funcionais / visual | Disponibilidade: melhor esforço (SLA na infra). Ícones: CDN externo. Modo escuro: incluído no MVP. | resolvido |

---

## Itens de implementação — RESOLVIDOS

- **Bootstrap do primeiro administrador**: resolvido. **Primeiro cadastro vira admin**, de forma controlada: enquanto a tabela `usuarios` estiver vazia, uma tela/endpoint de setup permite criar a primeira conta, que recebe perfil `administrador`. Assim que existir ao menos um usuário, esse caminho é desativado e o acesso volta a ser exclusivamente por convite. ✔
- **CDN/conjunto de ícones**: **Lucide** via CDN. ✔

## Ainda em aberto (não bloqueiam documentação nem modelagem)

- **D14 — Gamificação: incluída no escopo (decisão de produto).** Originalmente fora do MVP em todos os documentos; por decisão do dono do produto, a **v1** entra no escopo: progresso **pessoal, sem ranking**, com pontos **derivados das ações reais** (sem tabela nova/sem migration), níveis, conquistas e tela `progresso.html`. Regras em `docs/gamificacao/10-plano-gamificacao.md`. Implementado: `includes/gamificacao.php`, `api/gamificacao/progresso.php`, `public/progresso.html`, `public/js/gamificacao.js`, item "Progresso" no menu. Descrição §17/§23 atualizadas. Pendência de doc menor: refletir também em `03-mapa-de-telas.md` e `03-modelagem-banco-dados.md` (§10) na revisão geral. Status: **resolvido (implementado)**.
- **D15 — Resumo periódico por e-mail (digest) / push (retenção).** Os e-mails do MVP são **operacionais por evento** (`01-descricao-produto.md` §16); não há **digest/resumo periódico** nem **push** definidos. A retenção do MVP usa Dashboard (pendências, "minhas ações", "continue de onde parou"), notificações por evento e histórico (ver `docs/retencao/11-plano-retencao-usuario.md`). Para adicionar digest/push é preciso **decisão de produto** + regras de **consentimento/opt-out e anti-spam** (`boas-praticas-notificacoes.md`). Status: **aberto**.
- **D16 — Tela "Ações" (lista global de ações) + visão de calendário.** Não constava no inventário de telas (mapa §731), mas consolida elementos já documentados (lista de ações; filtros como na lista de demandas; popup de detalhe da ação; escopo de visibilidade) e corresponde ao slot "Plano de ação" do mockup. Incluída por **decisão de produto**; refletida no `03-mapa-de-telas.md`. Implementado: `public/acoes.html`, `public/js/acoes.js`, `api/acoes/listar-todas.php`, funções `montar_where_acoes`/`listar_acoes` em `includes/acoes.php`, item "Ações" no menu. A mesma tela ganhou um **alternador Lista/Calendário** (decisão de produto): o calendário posiciona as ações pelo **prazo** numa grade mensal, reaproveitando escopo e filtros, sem tabela nova (`api/acoes/calendario.php` + `listar_acoes_calendario`, intervalo de datas limitado a ~6 semanas). Só ações com prazo aparecem no calendário. **Sem tabela nova** (usa `acoes`). Status: **resolvido (implementado)**.
- Endereço do **e-mail de suporte** exibido na tela de Ajuda — definir depois (placeholder em `config` até ter o oficial).
- **Logo definitiva** do Grupo Nexius (hoje placeholder em texto) — depende de anexo.
- **Envio real de e-mail (fase de e-mail):** a recuperação de senha já gera o token e **enfileira** o e-mail em `fila_email`, mas o **envio efetivo (SMTP + cron)** ainda não existe. Enquanto isso, para testar a redefinição, o token pode ser lido em `tokens_recuperacao` (ou na mensagem em `fila_email`) e usado em `redefinir-senha.html?token=...`. Também exige `APP_URL` setada para o link do e-mail ficar absoluto.
- **E-mail das notificações de eventos:** as notificações **internas** (atribuição, comentário, status, conclusão) estão implementadas. O **e-mail** dos mesmos eventos é canal do MVP, mas só será enfileirado/enviado quando o SMTP estiver configurado (fase de e-mail). Contrato/template definido em `docs/notificacoes/09-plano-notificacoes.md`. Hoje os eventos geram apenas a notificação interna.

## Inconsistências de documentação — corrigidas

- `01-descricao-produto.md` §24: identidade visual já marcada como resolvida.
- Pendências consolidadas neste arquivo.
- Caminho do mockup: guia aponta `mockups/mockup-telas.png`; arquivo atual é `docs/design/mockup.png` — ajustar caminho ou mover o arquivo (item operacional).
- Briefing "Atribuições/responsáveis": confirmado como campo (responsável em demanda/ação), não tabela separada.
