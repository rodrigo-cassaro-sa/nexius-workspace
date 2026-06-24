# Descrição do Produto

Este é o documento mestre do produto. Ele serve como fonte da verdade para qualquer pessoa ou IA que for desenvolver o SaaS.

Regras de uso deste documento:

- Preencha cada seção com base no `00-briefing-projeto.md`.
- Use `[PREENCHER]` enquanto a informação não existir.
- Use `[DECISÃO PENDENTE]` quando houver decisão em aberto.
- Não invente funcionalidades. Só entra no documento o que estiver no briefing ou em requisito aprovado.
- Separe sempre o que é MVP do que é futuro.
- Respeite a stack oficial: HTML, CSS, JavaScript puro, PHP procedural, MySQL e APIs JSON.
- Este é um SaaS web responsivo (desktop e mobile via layout responsivo), não um app nativo.

---

## 1. Visão geral

O Workspace S&A é um SaaS web para equipes internas controlarem demandas de projeto. Cada demanda é registrada em um lugar único e desdobrada em um plano de ação. Cada ação tem responsável, status e pode receber comentários da equipe. A demanda é concluída quando sua ação chave é concluída, e as ações podem depender umas das outras por pré-requisito.

O objetivo é tirar as demandas de e-mail, planilhas e conversas soltas, dando visibilidade de responsáveis, do que está pendente e do histórico de discussão de cada ação.

## 2. Ideia do SaaS

Um sistema (estilo fórum) para controlar demandas de projeto: registrar a demanda, transformá-la em ações claras, atribuir responsáveis, discutir por comentários e acompanhar a conclusão.

## 3. Problema que resolve

Demandas de projeto se perdem entre e-mail, planilhas e mensagens. Não há um ponto único que mostre quem é o responsável por cada ação, o que já foi concluído, o que está pendente e qual foi a discussão sobre o assunto. Isso gera retrabalho, esquecimento e falta de acompanhamento.

## 4. Dores do público

- Demandas espalhadas em vários canais, sem centralização.
- Falta de clareza sobre quem é o responsável por cada ação.
- Dificuldade de saber o status real e o que falta concluir.
- Discussão sobre a demanda perdida em conversas que ninguém recupera depois.
- Retrabalho e esquecimento de ações por falta de acompanhamento.

## 5. Público-alvo

Equipes internas de empresas que tocam projetos e precisam organizar demandas entre setores e pessoas. Uso interno; não voltado a cliente externo no MVP.

## 6. Personas e tipos de usuário

| Perfil | Objetivo principal | Contexto de uso |
|---|---|---|
| Administrador | Manter o sistema e os usuários funcionando | Convida usuários, define perfis, ajusta configurações e tem visão de todas as demandas |
| Gestor/Responsável | Organizar e acompanhar as demandas | Cria demandas, monta o plano de ação, atribui responsáveis e acompanha o andamento |
| Colaborador | Executar e concluir as ações sob sua responsabilidade | Vê suas demandas/ações, comenta e conclui o que é seu |

## 7. Proposta de valor

Centralizar as demandas de projeto e transformá-las em ações acompanháveis: cada demanda vira um plano de ação com responsáveis, pré-requisitos e discussão registrada. A equipe sabe o que fazer, quem faz e o que falta para concluir, com histórico que não se perde.

## 8. Regras de negócio

1. Toda ação pertence a uma demanda; uma demanda pode ter várias ações.
2. Apenas Gestor/Responsável e Administrador podem criar/editar demandas e montar o plano de ação.
3. A atribuição de responsável (de demanda e de ação) é feita por Gestor/Responsável ou Administrador.
4. Uma ação só pode ser concluída pelo seu responsável (o usuário atribuído àquela ação).
5. Cada demanda tem uma única ação marcada como "chave". Quando a ação chave é concluída, a demanda é considerada concluída.
6. Ações podem ter um ou mais pré-requisitos (outras ações da mesma demanda). Uma ação só pode ser concluída depois que **todos** os seus pré-requisitos estiverem concluídos. O sistema bloqueia a conclusão enquanto houver pré-requisito pendente. Não é permitido criar dependência circular.
7. Comentários ficam vinculados à ação e mantêm histórico. O autor pode editar o próprio comentário; ninguém pode excluir comentário.
8. Ninguém exclui demanda ou ação. Em vez de excluir, elas são arquivadas/canceladas via status (por Gestor/Responsável ou Administrador), mantendo o histórico (exclusão lógica).
9. Ações têm prazo (data prevista de conclusão), base da métrica de sucesso (% de ações concluídas no prazo).
10. A permissão real é sempre validada no backend, nunca apenas no frontend.

## 9. Permissões de usuário

> A permissão real é validada no backend (PHP).

| Perfil | Pode ver | Pode criar | Pode editar | Pode excluir |
|---|---|---|---|---|
| Administrador | Todas as demandas, ações, comentários e usuários | Usuários (convite), demandas e ações | Usuários, perfis, configurações, demandas e ações | Não exclui; arquiva/cancela demanda e ação via status |
| Gestor/Responsável | Demandas que gerencia e as da sua equipe | Demandas, ações, comentários | Demandas e ações que gerencia; o próprio comentário | Não exclui; arquiva/cancela demanda e ação via status |
| Colaborador | Demandas/ações em que está envolvido | Comentários nas suas ações | Conclui as ações sob sua responsabilidade; edita o próprio comentário | Não exclui nada |

> Não há exclusão física no sistema. Demandas e ações são arquivadas/canceladas via status (exclusão lógica), mantendo o histórico. Comentários nunca são excluídos.

### Escopo de visibilidade

- **Administrador:** vê todas as demandas e ações.
- **Gestor/Responsável:** vê todas as demandas e ações (escopo amplo). Apenas o Colaborador é restrito.
- **Colaborador:** vê uma demanda quando está **envolvido** nela. Considera-se envolvido o usuário que é **responsável por ao menos uma ação da demanda** OU que **já comentou em alguma ação da demanda**. Fora isso, não acessa a demanda.

O escopo é sempre aplicado no backend, nas consultas e na verificação de acesso, nunca apenas no frontend.

## 10. Funcionalidades do MVP

- Login, recuperação de senha e logout.
- Convite e gestão de usuários (administração).
- CRUD de demandas (criar, listar, detalhe, editar, status).
- Plano de ação com ações concluíveis dentro de cada demanda.
- Ação chave (conclui a demanda) e pré-requisito entre ações.
- Comentários nas ações (editar o próprio, sem excluir).
- Atribuição de responsável (demanda e ação) com filtro por responsável.
- Dashboard com demandas por status, minhas ações e pendências.
- Notificações internas no sistema.
- Notificações por e-mail em eventos importantes (envio pelo backend).

## 11. Funcionalidades futuras

- Relatórios (fase seguinte ao MVP: demandas por status, produtividade por responsável, ações concluídas no período).
- Pagamentos / assinatura.
- Gamificação (pontos, níveis, ranking).
- Funcionamento offline / sincronização.
- Notificações push e WhatsApp.
- Integrações externas (além do envio de e-mail).

## 12. Jornada principal do usuário

1. Recebe convite por e-mail e define a senha.
2. Faz login e cai no dashboard.
3. Cria (ou abre) uma demanda.
4. Desdobra a demanda em um plano de ação (lista de ações), marca a ação chave e define pré-requisitos quando houver.
5. Atribui responsáveis às ações.
6. A equipe comenta e conclui as ações, respeitando os pré-requisitos.
7. Ao concluir a ação chave, a demanda é concluída e o time acompanha o resultado.

## 13. Fluxo de onboarding

Convite por e-mail → definição de senha → primeira tela orientando como criar a primeira demanda e montar o plano de ação. O onboarding deve deixar claro o conceito central: demanda → ações → ação chave → conclusão.

## 14. Fluxo de login e cadastro

- Cadastro: por convite. O administrador cria/convida os usuários. Não há cadastro aberto no MVP.
- **Bootstrap do primeiro administrador**: enquanto não existir nenhum usuário, uma tela/endpoint de setup permite criar a primeira conta, que recebe perfil administrador. Assim que houver ao menos um usuário, esse caminho é desativado e o acesso volta a ser somente por convite.
- Login: e-mail e senha.
- Recuperação de senha: sim, por e-mail.
- Logout: encerra a sessão.

> Segurança: senha com `password_hash`, sessão segura por cookie (`httponly`, `secure`, `samesite`), regenerar sessão após login, sem token sensível no `localStorage`.

## 15. Funcionalidades principais

### Demandas

- O que faz: registrar e acompanhar uma demanda de projeto (título, descrição, status, responsável).
- Quem usa: Gestor/Responsável e Administrador criam e editam; Colaborador visualiza as suas.
- Regras básicas: toda demanda tem um plano de ação; é concluída pela ação chave.

### Plano de ação e ações

- O que faz: desdobrar a demanda em ações concluíveis, com responsável, status, prazo, marcação de ação chave e pré-requisitos opcionais (uma ou mais).
- Quem usa: Gestor/Responsável e Administrador montam o plano; Colaborador conclui as ações sob sua responsabilidade.
- Regras básicas: ação só é concluída pelo responsável; ação com pré-requisito pendente é bloqueada; concluir a ação chave (uma por demanda) conclui a demanda; demanda/ação não são excluídas, apenas arquivadas/canceladas via status.

### Comentários

- O que faz: discussão em formato de tópico dentro de cada ação (o "fórum").
- Quem usa: todos os envolvidos na demanda.
- Regras básicas: autor edita o próprio comentário; ninguém exclui; mantém histórico.

### Atribuição

- O que faz: definir o responsável por demanda e por ação, e filtrar por responsável.
- Quem usa: Gestor/Responsável e Administrador.
- Regras básicas: só esses perfis atribuem; o responsável é quem pode concluir a ação.

### Dashboard

- O que faz: visão geral de demandas por status, "minhas ações" e pendências.
- Quem usa: todos os perfis, com escopo conforme permissão.
- Regras básicas: cada usuário vê apenas o que tem permissão de ver.

### Administração de usuários

- O que faz: convidar usuários, definir perfis e gerenciar acessos.
- Quem usa: Administrador.
- Regras básicas: entrada apenas por convite no MVP.

## 16. Notificações

- Precisa no MVP? Sim.
- Tipos: interna (dentro do sistema) e e-mail (envio pelo backend).
- Eventos que disparam:
  - Demanda ou ação atribuída a um usuário.
  - Novo comentário em uma ação que o usuário acompanha.
  - Mudança de status da demanda.
  - Conclusão de ação e conclusão da demanda (ação chave).
- **Quem acompanha uma ação** (recebe notificação de novo comentário): o **responsável da ação**, o **criador da demanda** e **quem já comentou** naquela ação. O autor do próprio comentário não é notificado do próprio comentário. Evitar duplicidade quando o usuário se enquadrar em mais de um critério.
- Consentimento e opt-out: no MVP, os e-mails são operacionais e sempre enviados; não há opt-out nesta fase.
- Provedor de e-mail: **SMTP** configurado no backend (credenciais protegidas, fora do frontend).
- Envio: por **fila** (entidade `fila_email`) processada por **cron**, com reprocessamento limitado em caso de falha; o envio não trava a ação do usuário.

> Notificação não carrega dado sensível. O envio passa pelo backend, com credenciais SMTP protegidas e fila para tolerar falhas.

## 17. Gamificação

Gamificação **v1 incluída** (decisão de produto — `docs/decisoes-pendentes.md` D14).
Progresso **pessoal, sem ranking**: pontos **derivados das ações reais** (ação concluída
no prazo/atraso e ação chave), **níveis** (Bronze → Platina) e **conquistas**, exibidos na
tela **"Progresso"**. O **placar (pontos/nível/números) é MENSAL** (renova todo mês — justo
para novatos e veteranos); as **conquistas são vitalícias** (histórico permanente). O **backend calcula** (sem tabela nova; agregado em runtime das
ações); o **frontend só exibe**. Regras detalhadas em `docs/gamificacao/10-plano-gamificacao.md`.

## 18. Retenção de usuário

Valor recorrente de acompanhamento: dashboard com pendências e "minhas ações", notificações de atribuição e de novos comentários trazendo o usuário de volta, e histórico organizado de cada demanda.

## 19. Dados principais do sistema

| Entidade | O que representa | Relaciona-se com |
|---|---|---|
| usuarios | Pessoas que acessam o sistema, com perfil/permissão; inclui marcação de onboarding concluído | demandas, acoes, comentarios, notificacoes |
| convites | Convite de acesso criado pelo Administrador (token, e-mail, perfil pré-definido, validade, status, criado_por) | usuarios (criado_por; usuario gerado ao aceitar) |
| tokens_recuperacao | Token de redefinição de senha (usuario_id, token, expiracao, usado) | usuarios |
| demandas | Demanda de projeto a ser acompanhada | usuarios (criador/responsável), acoes |
| acoes | Item do plano de ação de uma demanda; tem responsável, status, prazo e marcação de chave | demandas, usuarios (responsável), acao_prerequisitos, comentarios |
| acao_prerequisitos | Dependência entre ações: uma ação pode depender de uma ou mais ações da mesma demanda | acoes (ação e ação pré-requisito) |
| comentarios | Mensagem em uma ação (o "fórum") | acoes, usuarios (autor) |
| notificacoes | Avisos internos e registro de envio por e-mail | usuarios |
| fila_email | Fila de envio de e-mail operacional, processada por cron, com reprocessamento de falhas | usuarios |
| logs | Registro de ações críticas (login, convite, mudança de permissão, etc.) | usuarios |

> A modelagem final de campos, índices e constraints será feita na etapa de banco de dados, seguindo `boas-praticas-banco-dados.md`. O pré-requisito de ação é um relacionamento de uma ação para outra ação dentro da mesma demanda.

### Convites e tokens de recuperação

- **Convite:** validade de **7 dias**, **uso único**. Reenviar um convite gera um novo token e invalida o anterior. O perfil do usuário já vem definido no convite.
- **Token de recuperação de senha:** validade de **30 minutos**, **uso único**.

### Status válidos (lista fechada)

- **Demanda:** `aberta`, `em_andamento`, `concluida`, `arquivada`, `cancelada`.
- **Ação:** `pendente`, `bloqueada`, `concluida`, `cancelada`.

A ação fica `bloqueada` quando tem pré-requisito ainda não concluído. A demanda passa a `concluida` quando sua ação chave é concluída. Os valores são validados no backend; nenhum status fora desta lista é aceito.

### Observadores de ação

O conjunto de observadores de uma ação (para notificação de novo comentário) é derivado em tempo de execução: responsável da ação + criador da demanda + autores de comentários naquela ação. Não exige tabela própria no MVP; se a derivação ficar custosa, avaliar uma tabela de observadores na etapa de banco.

## 20. Integrações previstas

Nenhuma no MVP, exceto o envio de e-mail por **SMTP**, tratado pelo backend com credenciais protegidas. O backend centraliza o envio numa única função, mantendo a fila (`fila_email`) e o cron de processamento.

## 21. Requisitos não funcionais

- Responsividade: funcionar bem em desktop e mobile via layout responsivo.
- Segurança: prepared statements, validação no backend, permissões reais no servidor, log em ações críticas, sem segredo no frontend.
- Stack: HTML, CSS, JavaScript puro, PHP procedural, MySQL, APIs JSON.
- Desempenho: listas com paginação e busca apenas dos campos necessários; evitar `SELECT *` em endpoints finais.
- Disponibilidade: melhor esforço no MVP; meta formal (SLA) definida na fase de infraestrutura. Manter backup conforme as boas práticas.
- Acessibilidade básica: HTML semântico, labels em campos, contraste adequado, foco visível, não depender só de cor.

## 22. Critérios de sucesso do MVP

- Métrica principal: **% de ações concluídas no prazo** (dentro da data prevista). Esta é a medida objetiva de sucesso do MVP.
- A equipe consegue, sem ajuda, criar uma demanda, desdobrá-la em ações, atribuir responsáveis e concluir as ações até a ação chave.
- As demandas deixam de se perder em e-mail/planilha; tudo fica registrado em um lugar.
- É possível ver rapidamente o que está pendente e de quem é a responsabilidade.

## 23. O que não deve ser feito agora

- Sem pagamentos.
- Gamificação além da v1 pessoal (ex.: ranking competitivo) — fora do escopo por ora (ver §17).
- Sem funcionamento offline.
- Sem relatórios (fica para a fase seguinte).
- Sem notificações push e WhatsApp.
- Sem integrações externas além do envio de e-mail.
- Sem cadastro aberto (apenas convite).
- Sem criação de telas, endpoints ou tabelas fora do escopo deste documento.

## 24. Decisões pendentes

Decisões de produto resolvidas (registradas nas seções acima):

- Ação chave: uma única por demanda. ✔
- Pré-requisito de ação: bloqueia a conclusão enquanto pendente. ✔
- Exclusão: ninguém exclui; demanda/ação são arquivadas/canceladas via status (exclusão lógica). ✔
- E-mail: operacional e sempre enviado; sem opt-out no MVP. ✔
- Métrica de sucesso: % de ações concluídas no prazo. ✔
- Identidade visual: definida no `02-guia-visual.md` (marca Grupo Nexius). ✔
- D1 Convites: validade 7 dias, uso único, reenvio invalida o anterior. ✔
- D2 Token de recuperação: validade 30 minutos, uso único. ✔
- D3 Escopo do Colaborador: envolvido = responsável de ação OU autor de comentário na demanda. ✔
- D4 Escopo do Gestor: vê todas as demandas; só Colaborador é restrito. ✔
- D5 Observadores de ação: responsável da ação + criador da demanda + autores de comentário. ✔
- D6 Status: listas fechadas definidas para demanda e ação. ✔

Também resolvidas (ver `docs/decisoes-pendentes.md`):

- D7 Fila de e-mail: tabela `fila_email` + cron. ✔
- D8 Provedor de e-mail: SMTP no backend. ✔
- D9 Flag de onboarding concluído: campo em `usuarios`. ✔
- D10 Pré-requisitos: múltiplos por ação (tabela `acao_prerequisitos`). ✔
- D11 Configurações: unida ao Perfil (sem tela separada no MVP). ✔
- D12 Suporte: e-mail de suporte na tela de Ajuda. ✔
- D13 Disponibilidade: melhor esforço (SLA na infra) · Ícones: CDN externo aprovado · Modo escuro: incluído no MVP. ✔

Não há decisões pendentes bloqueantes. Itens de implementação a confirmar: endereço do e-mail de suporte e qual CDN/conjunto de ícones (registrados em `docs/decisoes-pendentes.md`).

---

## Checklist de validação

- [x] Este documento foi preenchido?
- [x] Está coerente com o MVP?
- [x] Está coerente com a stack?
- [x] Está coerente com as boas práticas?
- [ ] Existem decisões pendentes? (apenas provedor de e-mail e identidade visual — ver seção 24)
