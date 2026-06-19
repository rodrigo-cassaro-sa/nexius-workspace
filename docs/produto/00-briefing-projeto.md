# Briefing do Projeto

Este arquivo é um formulário de preenchimento.

Preencha cada seção abaixo antes de gerar os documentos finais do produto, do guia visual, do mapa de telas e do prompt de mockup.

Instruções de uso:

- Responda logo abaixo de cada pergunta.
- Onde ainda não souber, escreva `[PREENCHER]`.
- Onde houver uma decisão em aberto, escreva `[DECISÃO PENDENTE]`.
- Onde for necessário anexar logo, cor ou referência visual, escreva `[ANEXAR]`.
- Seja específico. Quanto mais claro o briefing, melhor o resultado dos documentos seguintes.
- Lembre-se: este é um SaaS web responsivo (desktop e mobile via layout responsivo), com stack HTML, CSS, JavaScript puro, PHP procedural, MySQL e APIs JSON.

---

## Nome do SaaS

Workspace S&A

## Qual é a ideia principal do SaaS?

Ser um sistema (estilo fórum) para controlar demandas de projeto. Cada demanda é desdobrada em um plano de ação, e cada ação precisa ser concluída e pode receber comentários da equipe.

## Descrição curta (uma ou duas frases)

SaaS web para equipes internas registrarem demandas de projeto, desdobrá-las em um plano de ação com ações concluíveis e acompanhar o andamento, com discussão por comentários em cada ação.

## Qual problema o SaaS resolve?

Demandas de projeto hoje se perdem em e-mail, planilhas e conversas soltas. Falta um lugar único para registrar a demanda, transformá-la em ações claras, definir responsáveis e acompanhar o que já foi concluído e o que está pendente.

## Quais são as dores do público que ele atende?

- Demandas espalhadas em vários canais, sem centralização.
- Falta de clareza sobre quem é o responsável por cada ação.
- Dificuldade de saber o status real e o que falta concluir.
- Discussão sobre a demanda perdida em conversas que ninguém recupera depois.
- Retrabalho e esquecimento de ações por falta de acompanhamento.

## Quem é o público-alvo?

Equipes internas de empresas que tocam projetos e precisam organizar demandas entre setores e pessoas. Uso interno, não voltado a cliente externo no MVP.

## Quais são os tipos de usuários do sistema?

- Administrador
- Gestor/Responsável
- Colaborador

## Quais são as permissões de cada tipo de usuário?

- Administrador: gerencia usuários (convites e perfis), configurações do sistema, e tem acesso a todas as demandas e ações.
- Gestor/Responsável: cria e edita demandas, monta o plano de ação, atribui responsáveis, acompanha o andamento e comenta.
- Colaborador: vê as demandas/ações em que está envolvido, comenta e conclui as ações sob sua responsabilidade.

> A permissão real é sempre validada no backend (PHP), nunca apenas no frontend. Detalhar regra a regra na descrição do produto.

## Quais são as funcionalidades principais do sistema (visão geral)?

- Cadastro de demandas (criar, listar, ver detalhe, editar, mudar status).
- Plano de ação: desdobrar a demanda em ações.
- Ações concluíveis (marcar como concluída).
- Ação chave: uma ação marcada como chave; ao concluí-la, a demanda é concluída.
- Pré-requisito entre ações: uma ação pode depender de uma ou mais ações serem concluídas antes.
- Comentários nas ações (a parte de "fórum").
- Atribuição de responsável por demanda e por ação, com filtro por responsável.
- Dashboard com visão geral (por status, minhas ações, pendências).
- Notificações internas e por e-mail em eventos importantes.
- Gestão de usuários por convite (administração).

## Quais funcionalidades fazem parte do MVP (primeira versão)?

- Login, recuperação de senha e logout.
- Convite e gestão de usuários (administração).
- CRUD de demandas (criar, listar, detalhe, editar, status).
- Plano de ação com ações concluíveis dentro de cada demanda.
- Ação chave (conclui a demanda) e pré-requisito entre ações.
- Comentários nas ações.
- Atribuição de responsável (demanda e ação).
- Dashboard com demandas por status, minhas ações e pendências.
- Notificações internas no sistema.
- Notificações por e-mail em eventos importantes (envio pelo backend).

## Quais funcionalidades ficam para o futuro (fora do MVP)?

- Pagamentos / assinatura.
- Gamificação (pontos, níveis, ranking).
- Funcionamento offline / sincronização.
- Relatórios (planejados para a fase seguinte ao MVP — ex.: demandas por status, produtividade por responsável).
- Notificações push e WhatsApp.
- Integrações externas (além do envio de e-mail).

## Qual é a jornada principal do usuário?

1. Recebe convite e define a senha.
2. Faz login e cai no dashboard.
3. Cria (ou abre) uma demanda.
4. Desdobra a demanda em um plano de ação (lista de ações).
5. Atribui responsáveis às ações.
6. A equipe comenta e conclui as ações.
7. Acompanha o avanço da demanda até a conclusão.

## Como deve ser o onboarding (primeiro uso)?

Convite por e-mail → definição de senha → primeira tela orientando como criar a primeira demanda e montar o plano de ação. Mostrar de forma simples o conceito demanda → ações → conclusão.

## Como funciona o login e o cadastro?

- Cadastro: por convite. O administrador cria/convida os usuários. Não há cadastro aberto no MVP.
- Login: e-mail e senha.
- Recuperação de senha: sim.
- Logout: encerra a sessão.

> Senha sempre com `password_hash`, sessão segura por cookie, sem token sensível no `localStorage`.

## Quais dados precisam ser salvos no sistema?

- Usuários (com perfil/permissão).
- Demandas.
- Ações (o plano de ação de cada demanda; cada ação tem responsável, status, prazo, marcação de "chave" e pré-requisitos opcionais para uma ou mais ações).
- Comentários (vinculados às ações).
- Atribuições/responsáveis.
- Notificações.
- Logs de ações críticas.

> A modelagem final de tabelas e campos será feita na etapa de banco de dados.

## O sistema precisa de notificações?

Sim, no MVP:

- Interna (dentro do sistema).
- E-mail (envio pelo backend).

Eventos sugeridos para disparar notificação:

- Demanda ou ação atribuída a um usuário.
- Novo comentário em uma ação que o usuário acompanha.
- Mudança de status da demanda.
- Conclusão de ação ou de demanda.

No MVP, os e-mails são operacionais (atribuição, comentário, status, conclusão) e sempre enviados; não há opt-out nesta fase. O envio é por SMTP, centralizado no backend (credenciais protegidas), usando uma fila (`fila_email`) processada por cron.

> Notificação não carrega dado sensível.

## O sistema precisa de gamificação?

Não no MVP.

## Como o sistema pretende reter o usuário?

Pelo valor recorrente de acompanhamento: dashboard com pendências e "minhas ações", notificações de atribuição e de novos comentários trazendo o usuário de volta, e histórico organizado da demanda.

## O sistema precisa funcionar offline?

Não no MVP.

## O sistema precisa de relatórios?

Não no MVP, mas é prioridade para a fase seguinte (ex.: demandas por status, produtividade por responsável, ações concluídas no período).

## O sistema precisa de integrações externas?

Não no MVP, exceto o provedor de envio de e-mail (tratado pelo backend, com chaves protegidas). O provedor (SMTP ou serviço transacional) será definido na implementação; o backend centraliza o envio para que a troca de provedor não afete o restante.

## O sistema precisa de pagamentos?

Não no MVP.

## Quais são as regras de negócio importantes?

> Regras propostas a partir do que conversamos. Revise e confirme; ajuste onde estiver marcado.

1. Toda ação pertence a uma demanda; uma demanda pode ter várias ações.
2. Apenas Gestor/Responsável e Administrador podem criar/editar demandas e montar o plano de ação.
3. Atribuição de responsável é feita por Gestor/Responsável ou Administrador.
4. Uma ação só pode ser concluída pelo seu responsável (o usuário atribuído àquela ação).
5. Cada demanda tem uma única ação marcada como "chave". Quando a ação chave é concluída, a demanda é considerada concluída.
6. Ações podem ter um ou mais pré-requisitos (outras ações da mesma demanda). Uma ação só pode ser concluída depois que todos os pré-requisitos estiverem concluídos. O sistema bloqueia a conclusão enquanto houver pré-requisito pendente. Sem dependência circular.
7. Comentários ficam vinculados à ação e mantêm histórico. O autor pode editar o próprio comentário; ninguém pode excluir comentário (mantém rastro).
8. Ninguém exclui demanda ou ação. Em vez de excluir, elas são arquivadas/canceladas via status (por Gestor/Responsável ou Administrador), mantendo o histórico.
9. Ações têm prazo (data prevista de conclusão), usado para medir a métrica de sucesso (% de ações concluídas no prazo).
10. A permissão real é sempre validada no backend.

## Qual é o estilo visual desejado?

Corporativo sóbrio: interface enxuta, hierarquia clara, contraste comedido e poucos elementos decorativos. Detalhado no `02-guia-visual.md`.

## Qual emoção o sistema deve transmitir?

Confiança, seriedade e clareza.

## Existem referências visuais?

Ferramentas corporativas de gestão de demandas/tarefas, com dashboard limpo. [ANEXAR] referências específicas, se houver.

## O projeto tem logo?

A marca é **Grupo Nexius**; o Workspace S&A é o sistema dentro dessa marca. Logo definitiva ainda não anexada — por enquanto, placeholder em texto "GRUPO NEXIUS" em cinza `#606062`. Logo definitiva: [ANEXAR].

## Qual é a paleta de cores?

Identidade Grupo Nexius: marrom institucional `#4E392F` (principal), cinza da marca `#606062` (apoio) e cinza claro quente `#F2F1EE` (fundo). Valores completos no `02-guia-visual.md`.

## O sistema terá mascote?

Não no MVP.

## Quais são as telas principais previstas?

- Login
- Recuperação de senha
- Onboarding
- Dashboard
- Lista de demandas
- Detalhe da demanda (com plano de ação, ações e comentários)
- Criação/edição de demanda
- Criação/edição de ação
- Notificações
- Perfil do usuário (inclui preferências e tema claro/escuro; Configurações não é tela separada no MVP)
- Administração de usuários (convites e permissões)
- Ajuda/suporte
- Tela de erro

## Quais são os critérios de sucesso do MVP?

- Métrica principal: **% de ações concluídas no prazo** (dentro da data prevista).
- A equipe consegue, sem ajuda, criar uma demanda, desdobrá-la em ações, atribuir responsáveis e concluir as ações até a ação chave.
- As demandas deixam de se perder em e-mail/planilha; tudo fica registrado em um lugar.
- É possível ver rapidamente o que está pendente e de quem é a responsabilidade.

---

## Checklist de validação

- [x] Este documento foi preenchido?
- [x] Está coerente com o MVP?
- [x] Está coerente com a stack?
- [x] Está coerente com as boas práticas?
- [ ] Existem decisões pendentes? (sim — ver itens marcados com `[DECISÃO PENDENTE]` e `[PREENCHER]`)
