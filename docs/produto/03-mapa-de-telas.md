# Mapa de Telas

Este documento mapeia as telas principais do Workspace S&A. Cada tela é descrita com um padrão fixo para orientar o frontend.

Regras de uso deste documento:

- Telas derivadas do `01-descricao-produto.md` e do `02-guia-visual.md`.
- Use `[PREENCHER]` para o que ainda depender de definição.
- Use `[DECISÃO PENDENTE]` para decisões em aberto.
- Toda tela funciona em desktop e mobile pelo mesmo layout responsivo (topbar + sidebar no desktop; sidebar deslizante no mobile).
- A permissão real é validada no backend; o estado "Sem permissão" é apenas experiência do usuário.
- Não há exclusão física: demandas e ações são arquivadas/canceladas via status.

Estados padrão de cada tela:

- Carregando: enquanto busca dados.
- Vazio: quando não há dados para mostrar.
- Erro: quando a busca ou ação falha.
- Sucesso: quando há dados ou a ação foi concluída.
- Sem permissão: quando o usuário não pode acessar aquele conteúdo.

Perfis do sistema: Administrador, Gestor/Responsável, Colaborador.

---

## Login

### Objetivo da tela

Permitir que um usuário já cadastrado entre no sistema com e-mail e senha.

### Tipo de usuário que acessa

Visitante não autenticado (qualquer perfil antes do login).

### Dados exibidos

Campo de e-mail, campo de senha, link "Esqueci minha senha", identidade visual (logo/placeholder).

### Ações disponíveis

Entrar; ir para recuperação de senha.

### Regras de negócio aplicadas

Não há cadastro aberto (entrada apenas por convite). Senha validada no backend com `password_verify`; sessão segura após login.

### Estados da tela

- Carregando: botão "Entrar" em estado de carregamento durante a validação.
- Vazio: não se aplica.
- Erro: credenciais inválidas — mensagem genérica ("E-mail ou senha incorretos.").
- Sucesso: redireciona para o Dashboard.
- Sem permissão: não se aplica.

### Comportamento responsivo

Cartão central único, ocupa largura confortável no mobile.

### Observações visuais

Estilo sóbrio, fundo cinza claro, cartão branco, botão primário em marrom institucional.

---

## Cadastro

### Objetivo da tela

Concluir o cadastro a partir de um convite: o usuário convidado define a própria senha.

### Tipo de usuário que acessa

Pessoa convidada por um Administrador (acessa via link de convite).

### Dados exibidos

E-mail do convite (somente leitura), nome, campo de senha e confirmação de senha.

### Ações disponíveis

Definir senha e ativar a conta.

### Regras de negócio aplicadas

Não há auto-cadastro aberto. O convite tem validade e é de uso único; o vínculo (perfil) já foi definido pelo Administrador. Senha salva com `password_hash`.

### Estados da tela

- Carregando: validando o convite ao abrir a tela.
- Vazio: não se aplica.
- Erro: convite inválido, expirado ou já usado — mensagem orientando a pedir novo convite.
- Sucesso: conta ativada; segue para o onboarding/login.
- Sem permissão: convite inexistente.

### Comportamento responsivo

Mesmo cartão central do login.

### Observações visuais

Indicar requisitos mínimos de senha de forma simples.

---

## Recuperação de senha

### Objetivo da tela

Permitir que o usuário redefina a senha por e-mail.

### Tipo de usuário que acessa

Usuário cadastrado que esqueceu a senha.

### Dados exibidos

Campo de e-mail (etapa 1); campo de nova senha e confirmação (etapa 2, via link recebido).

### Ações disponíveis

Solicitar link de redefinição; definir nova senha.

### Regras de negócio aplicadas

Token de redefinição com validade e uso único; mensagem neutra para não revelar se o e-mail existe. Nova senha com `password_hash`.

### Estados da tela

- Carregando: durante o envio do e-mail ou a gravação da nova senha.
- Vazio: não se aplica.
- Erro: token inválido/expirado.
- Sucesso: "Se o e-mail existir, enviamos as instruções." / "Senha alterada com sucesso."
- Sem permissão: não se aplica.

### Comportamento responsivo

Cartão central, igual ao login.

### Observações visuais

Mensagens claras de confirmação.

---

## Onboarding

### Objetivo da tela

No primeiro acesso, apresentar o conceito central do sistema: demanda → plano de ação → ação chave → conclusão.

### Tipo de usuário que acessa

Usuário recém-ativado, principalmente Gestor/Responsável e Administrador.

### Dados exibidos

Passos curtos explicando como criar uma demanda, adicionar ações, marcar a ação chave e atribuir responsáveis.

### Ações disponíveis

Avançar/pular; ir direto para criar a primeira demanda.

### Regras de negócio aplicadas

Exibido apenas no primeiro acesso (ou enquanto o usuário não concluir/pular).

### Estados da tela

- Carregando: ao iniciar.
- Vazio: não se aplica.
- Erro: não crítico; permitir seguir mesmo assim.
- Sucesso: leva ao Dashboard ou à criação de demanda.
- Sem permissão: não se aplica.

### Comportamento responsivo

Conteúdo em passos, leitura confortável no mobile.

### Observações visuais

Tom sóbrio; ilustração mínima opcional, sem mascote.

---

## Dashboard

### Objetivo da tela

Dar a visão geral do trabalho: demandas por status, "minhas ações" e pendências (incluindo ações em atraso e bloqueadas por pré-requisito).

### Tipo de usuário que acessa

Todos os perfis, com escopo conforme permissão.

### Dados exibidos

Resumo de demandas por status; lista "minhas ações" (com prazo e situação); ações atrasadas; ações bloqueadas por pré-requisito; indicador de % de ações concluídas no prazo; **total de tarefas recusadas** e **contador de tarefas por tipo** (análise/desenvolvimento/entrega/incidente/reunião). Todos respeitam o escopo: Colaborador vê apenas as suas.

### Ações disponíveis

Abrir uma demanda ou ação; criar nova demanda (Gestor/Admin); ir para Notificações.

### Regras de negócio aplicadas

Cada usuário vê apenas o que tem permissão de ver. Colaborador vê suas demandas/ações; Gestor vê as que gerencia; Administrador vê tudo.

### Estados da tela

- Carregando: skeleton nos cards/listas.
- Vazio: sem demandas/ações — orientar a criar a primeira (Gestor/Admin) ou informar que não há ações atribuídas (Colaborador).
- Erro: falha ao carregar — opção "Tentar novamente".
- Sucesso: cards e listas preenchidos.
- Sem permissão: não se aplica (tela disponível a todos os autenticados).

### Comportamento responsivo

Cards em grade no desktop; empilhados no mobile. Listas viram cartões no mobile.

### Observações visuais

Badges de status com texto + cor; números de resumo em destaque sóbrio.

---

## Ações (lista global)

> Tela acrescentada por decisão de produto (D16 em `decisoes-pendentes.md`). Consolida
> elementos já documentados — lista de ações, filtros como na lista de demandas, popup de
> detalhe da ação e escopo de visibilidade — numa visão única de **todas as ações** que o
> usuário acompanha. Corresponde ao slot "Plano de ação" do mockup. Sem tabela nova (usa `acoes`).

### Objetivo
Ver e filtrar rapidamente todas as ações (de várias demandas), sem abrir uma a uma.

### Quem acessa
Todos os perfis. O conteúdo respeita o **escopo** (Colaborador só vê ações de demandas em
que está envolvido; Gestor/Admin veem todas) — validado no backend.

### Dados exibidos
Tabela: ação (+ marca de chave), demanda (link), responsável, prazo, status (com "bloqueada"
derivada de pré-requisito). Filtros: busca por título, status, responsável, situação
(atrasadas/bloqueadas). Paginação. Popup de detalhe: descrição, responsável, prazo, status,
chave, "quem visualizou" (marca a visualização ao abrir) e atalho para a demanda.

### Visões (Lista / Calendário)
A mesma tela tem um alternador **Lista** | **Calendário**. A visão **Calendário** posiciona as
ações pelo **prazo** numa grade mensal (navegação mês anterior/próximo + "Hoje"), respeitando os
mesmos filtros e o mesmo escopo da lista. Cores por situação (atrasada, bloqueada, pendente,
concluída); clicar numa ação abre o mesmo popup de detalhe. Só ações **com prazo** aparecem no
calendário (ação sem prazo não tem dia para ocupar e segue visível apenas na Lista). Sem tabela
nova: usa `acoes` num intervalo de datas (endpoint `api/acoes/calendario.php`).

### Estados
Carregando (skeleton/“Carregando…”), vazio ("Nenhuma ação encontrada" na Lista; no Calendário, o
mês sem ações mostra a grade vazia), erro, sucesso, sem permissão (o escopo limita o conteúdo).

### Responsivo
Tabela vira cards no mobile (mesmo padrão da lista de demandas). O calendário mantém as 7 colunas
da semana com células e chips compactos no mobile (sem rolagem horizontal).

---

## Tela principal da operação — Detalhe da demanda (plano de ação)

> Esta é a tela central do produto. Mostra a demanda e seu plano de ação (lista de ações), com comentários por ação.

### Objetivo da tela

Acompanhar e operar uma demanda: ver dados, gerenciar o plano de ação, concluir ações e discutir por comentários.

### Tipo de usuário que acessa

Todos os perfis envolvidos na demanda; edição do plano apenas Gestor/Responsável e Administrador.

### Dados exibidos

Dados da demanda (título, descrição, status, responsável); **anexos** (arquivos enviados na criação, com download seguro — ver D17); lista de ações (ação, responsável, prazo, status, marcação de chave e pré-requisito); progresso ("X/Y concluídas"); comentários dentro de cada ação.

> **Anexos (D17):** na criação da demanda (modal Nova demanda, Gestor/Admin) é possível anexar arquivos de apoio (PDF, imagens, Office, TXT, CSV, ZIP; até 10 arquivos de 10 MB). Eles aparecem aqui em uma seção "Anexos" somente leitura, com botão **Baixar**. Os arquivos ficam em pasta privada e só são servidos via API com login + escopo de visibilidade da demanda.

### Ações disponíveis

- Gestor/Admin: adicionar/editar ação, definir ação chave, definir pré-requisito, atribuir responsável, editar a demanda, arquivar/cancelar demanda ou ação.
- Responsável da ação: concluir a própria ação.
- Todos os envolvidos: comentar; editar o próprio comentário.

### Regras de negócio aplicadas

- Ação só é concluída pelo seu responsável.
- Ação com pré-requisito pendente fica bloqueada para conclusão.
- Uma única ação chave por demanda; concluí-la conclui a demanda.
- Comentário não pode ser excluído; autor pode editar o próprio.
- Demanda/ação não são excluídas, apenas arquivadas/canceladas via status.

### Estados da tela

- Carregando: skeleton da demanda e da lista de ações.
- Vazio: demanda sem ações — "Adicione a primeira ação" (Gestor/Admin).
- Erro: falha ao carregar/salvar — mensagem genérica.
- Sucesso: ação concluída, comentário salvo, plano atualizado.
- Sem permissão: usuário sem vínculo com a demanda não acessa; ação de concluir aparece bloqueada para quem não é o responsável.

### Comportamento responsivo

Desktop: lista de ações em tabela; comentários em painel/expansão por ação. Mobile: ações viram cards; comentários abrem em tela/seção dedicada.

### Observações visuais

Indicar visualmente: ação chave (destaque), ação bloqueada por pré-requisito (ícone + texto), ação atrasada (cor de aviso).

---

## Lista principal — Lista de demandas

### Objetivo da tela

Listar as demandas com filtros, para localizar e abrir a desejada.

### Tipo de usuário que acessa

Todos os perfis, com escopo conforme permissão.

### Dados exibidos

Demandas com título, status, responsável, progresso das ações e prazo da ação chave; filtros por status e por responsável; busca por texto.

### Ações disponíveis

Filtrar; buscar; abrir detalhe; criar nova demanda (Gestor/Admin).

### Regras de negócio aplicadas

Lista respeita o escopo do usuário. Demandas arquivadas/canceladas aparecem só com o filtro correspondente.

### Estados da tela

- Carregando: skeleton de linhas/cards.
- Vazio: nenhuma demanda no filtro atual — orientar a limpar filtro ou criar demanda.
- Erro: falha ao carregar — "Tentar novamente".
- Sucesso: lista preenchida com paginação.
- Sem permissão: não se aplica (escopo limita o conteúdo).

### Comportamento responsivo

Tabela no desktop; cartões no mobile. Filtros em barra no desktop e em painel/acordeão no mobile.

### Observações visuais

Badges de status; progresso em formato "3/5".

---

## Detalhe de item — Detalhe da ação

> Tela/seção focada em uma única ação, quando aberta isoladamente (também acessível pelo detalhe da demanda).

### Objetivo da tela

Ver e operar uma ação específica e sua discussão.

### Tipo de usuário que acessa

Envolvidos na demanda; conclusão apenas pelo responsável da ação.

### Dados exibidos

Título, descrição, responsável, prazo, status, marcação de chave, pré-requisito (e situação dele), comentários.

### Ações disponíveis

Concluir (somente responsável, e se o pré-requisito estiver concluído); comentar; editar o próprio comentário; editar a ação (Gestor/Admin).

### Regras de negócio aplicadas

Bloqueio por pré-requisito; conclusão restrita ao responsável; comentário sem exclusão.

### Estados da tela

- Carregando: skeleton.
- Vazio: ação sem comentários — convidar a comentar.
- Erro: falha ao concluir/comentar.
- Sucesso: ação concluída (e demanda concluída, se for a ação chave).
- Sem permissão: botão concluir bloqueado/oculto para quem não é o responsável.

### Comportamento responsivo

Conteúdo em coluna única no mobile; comentários roláveis.

### Observações visuais

Deixar claro quando a ação está bloqueada e por qual pré-requisito.

---

## Criação/edição de item — Demanda e ação

### Objetivo da tela

Criar ou editar uma demanda e suas ações (formulário).

### Tipo de usuário que acessa

Gestor/Responsável e Administrador.

### Dados exibidos

- Demanda: título, descrição, responsável, status.
- Ação: título, descrição, responsável, prazo, marcação de ação chave, pré-requisito (seleção de outra ação da mesma demanda).

### Ações disponíveis

Salvar; cancelar; adicionar ação ao plano; marcar ação chave; definir pré-requisito.

### Regras de negócio aplicadas

Validação no frontend (experiência) e no backend (real). Apenas uma ação chave por demanda. Pré-requisito só pode apontar para outra ação da mesma demanda, sem criar dependência circular.

### Estados da tela

- Carregando: ao abrir em modo edição.
- Vazio: formulário novo.
- Erro: validação ou falha ao salvar — mensagens por campo.
- Sucesso: "Demanda salva." / "Ação salva."
- Sem permissão: Colaborador não acessa esta tela.

### Comportamento responsivo

Formulário em coluna única no mobile; seleção de pré-requisito por lista/select.

### Observações visuais

Indicar campos obrigatórios; destacar a marcação de ação chave.

---

## Notificações

### Objetivo da tela

Listar as notificações internas do usuário e permitir marcá-las como lidas.

### Tipo de usuário que acessa

Todos os perfis (cada um vê as suas).

### Dados exibidos

Lista de notificações (título, mensagem curta, data, lida/não lida) com link para a demanda/ação relacionada.

### Ações disponíveis

Abrir item relacionado; marcar como lida; marcar todas como lidas.

### Regras de negócio aplicadas

Notificações geradas por: atribuição, novo comentário, mudança de status, conclusão de ação/demanda. Conteúdo sem dado sensível. Link valida permissão no backend ao abrir.

### Estados da tela

- Carregando: skeleton de lista.
- Vazio: "Você está em dia. Nenhuma notificação."
- Erro: falha ao carregar.
- Sucesso: lista preenchida.
- Sem permissão: não se aplica.

### Comportamento responsivo

Lista vertical em ambos; confortável no mobile.

### Observações visuais

Não lidas com leve destaque; não depender só de cor (usar marcador/texto).

---

## Gamificação/progresso

### Objetivo da tela

Fora do MVP. Não construir nesta fase.

### Tipo de usuário que acessa

Fora do MVP.

### Dados exibidos

Fora do MVP.

### Ações disponíveis

Fora do MVP.

### Regras de negócio aplicadas

Fora do MVP.

### Estados da tela

- Carregando:
- Vazio:
- Erro:
- Sucesso:
- Sem permissão:

### Comportamento responsivo

Fora do MVP.

### Observações visuais

Fora do MVP.

---

## Perfil do usuário

### Objetivo da tela

Ver e ajustar os próprios dados básicos e a senha.

### Tipo de usuário que acessa

Todos os perfis (dados próprios).

### Dados exibidos

Nome, e-mail, perfil (somente leitura), opção de alterar senha e preferência de tema (claro/escuro).

### Ações disponíveis

Editar nome; alterar senha; alternar tema claro/escuro; sair (logout).

### Regras de negócio aplicadas

Perfil/permissão não é alterado pelo próprio usuário (só Administrador). Alteração de senha exige senha atual e usa `password_hash`.

### Estados da tela

- Carregando: ao abrir.
- Vazio: não se aplica.
- Erro: falha ao salvar / senha atual incorreta.
- Sucesso: "Dados atualizados." / "Senha alterada."
- Sem permissão: não se aplica (dados próprios).

### Comportamento responsivo

Formulário em coluna única no mobile.

### Observações visuais

Campo de perfil claramente como somente leitura.

---

## Configurações

No MVP, **não há tela separada de Configurações**. Os poucos ajustes do MVP (dados básicos, senha e preferência de tema claro/escuro) ficam na tela de **Perfil do usuário**. Esta tela poderá voltar a existir quando houver preferências reais (ex.: opt-out de notificações em fase futura).

---

## Administração

### Objetivo da tela

Área administrativa para gerenciar usuários e acessos.

### Tipo de usuário que acessa

Apenas Administrador.

### Dados exibidos

Lista de usuários (nome, e-mail, perfil, **setor**, situação ativo/inativo); convites pendentes; **card "Setores"** com o responsável principal de cada setor (D21).

### Ações disponíveis

Convidar usuário (**com setor opcional**); reenviar/cancelar convite; alterar perfil; **definir o setor do usuário**; ativar/inativar usuário; **definir o responsável principal de cada setor** (D21).

### Regras de negócio aplicadas

Acesso restrito ao Administrador (validado no backend). Ações administrativas geram log. Não há exclusão física de usuário; usar inativação.

### Estados da tela

- Carregando: skeleton de lista.
- Vazio: sem usuários além do próprio — orientar a convidar.
- Erro: falha ao carregar/salvar.
- Sucesso: "Convite enviado." / "Perfil atualizado."
- Sem permissão: Gestor e Colaborador não acessam; item de menu oculto e acesso bloqueado no backend.

### Comportamento responsivo

Tabela no desktop; cartões no mobile.

### Observações visuais

Distinguir convites pendentes de usuários ativos.

---

## Permissões/usuários

### Objetivo da tela

Gerenciar o perfil de cada usuário (Administrador, Gestor/Responsável, Colaborador). No MVP, faz parte da área de Administração.

### Tipo de usuário que acessa

Apenas Administrador.

### Dados exibidos

Usuário e seu perfil atual; opções de perfil disponíveis.

### Ações disponíveis

Alterar o perfil de um usuário.

### Regras de negócio aplicadas

Apenas Administrador altera perfis. Mudança de permissão gera log. A permissão real vale no backend.

### Estados da tela

- Carregando: ao abrir.
- Vazio: não se aplica (sempre há ao menos o próprio Administrador).
- Erro: falha ao salvar.
- Sucesso: "Perfil atualizado."
- Sem permissão: não acessível a Gestor/Colaborador.

### Comportamento responsivo

Integrada à lista de Administração; edição por linha/card.

### Observações visuais

Deixar claro o impacto de cada perfil.

---

## Ajuda/suporte

### Objetivo da tela

Oferecer orientação básica de uso e canal de contato.

### Tipo de usuário que acessa

Todos os perfis.

### Dados exibidos

Texto de ajuda (como criar demanda, plano de ação, ação chave, pré-requisito) e um e-mail de suporte (link mailto). [PREENCHER] endereço do e-mail de suporte.

### Ações disponíveis

Ler ajuda; acionar o e-mail de suporte (mailto).

### Regras de negócio aplicadas

Conteúdo informativo; sem dado sensível.

### Estados da tela

- Carregando: não crítico.
- Vazio: não se aplica (conteúdo estático).
- Erro: não se aplica.
- Sucesso: conteúdo exibido.
- Sem permissão: não se aplica.

### Comportamento responsivo

Texto em coluna única, leitura confortável no mobile.

### Observações visuais

Conteúdo escaneável, com títulos e listas curtas.

---

## Tela de erro

### Objetivo da tela

Mostrar páginas de erro de forma amigável (não encontrada, sem permissão, falha inesperada) sem expor detalhes técnicos.

### Tipo de usuário que acessa

Qualquer usuário.

### Dados exibidos

Mensagem amigável e ação para voltar (Dashboard ou login).

### Ações disponíveis

Voltar ao início; tentar novamente quando aplicável.

### Regras de negócio aplicadas

Nunca exibir erro técnico, SQL, caminho interno ou stack trace.

### Estados da tela

- Carregando: não se aplica.
- Vazio: não se aplica.
- Erro: é o próprio propósito da tela.
- Sucesso: não se aplica.
- Sem permissão: variante "Você não tem acesso a este conteúdo."

### Comportamento responsivo

Cartão central, igual ao padrão de login.

### Observações visuais

Tom sóbrio; sem alarmismo.

---

## Estado vazio

> Padrão reutilizável de bloco/tela sem dados, usado nas listas e seções.

### Objetivo da tela

Orientar o usuário quando não há dados, sugerindo o próximo passo.

### Tipo de usuário que acessa

Todos os perfis.

### Dados exibidos

Mensagem curta + ação sugerida (quando o usuário tiver permissão para a ação).

### Ações disponíveis

Ação principal sugerida (ex.: "Criar demanda", "Adicionar ação"), conforme permissão.

### Regras de negócio aplicadas

A ação sugerida só aparece se o usuário puder executá-la.

### Estados da tela

- Carregando: precede o estado vazio.
- Vazio: é o próprio propósito.
- Erro: estado vazio não substitui mensagem de erro.
- Sucesso: deixa de ser vazio quando há dados.
- Sem permissão: mostrar texto sem a ação sugerida.

### Comportamento responsivo

Centralizado, confortável no mobile.

### Observações visuais

Ilustração mínima opcional, sem mascote.

---

## Versão mobile das telas principais

> Não são telas novas. Descrevem como as telas principais se comportam no mobile pelo mesmo layout responsivo.

### Telas principais consideradas

Dashboard, Lista de demandas, Detalhe da demanda (plano de ação), Detalhe da ação, Notificações, Administração.

### Adaptações no mobile

- Navegação: topbar com botão de menu (hambúrguer) abrindo a sidebar como painel deslizante; item ativo destacado.
- Ordem dos blocos: no Dashboard, "minhas ações" e pendências aparecem primeiro; resumos por status em seguida.
- Tabelas: listas de demandas e de ações viram cartões empilhados (sem rolagem horizontal).
- Ações principais: botão de ação primária (ex.: "Nova demanda", "Concluir") acessível e fixo quando fizer sentido; comentários abrem em seção dedicada.

### Observações visuais

Manter contraste e alvos de toque confortáveis; preservar os badges de status com texto + cor.

---

## Tela: Mensagens (Chat 1:1) — D20 (Fase 1)

### Objetivo da tela
Conversa direta entre dois usuários do sistema, com data de envio e de leitura, e referência opcional a uma demanda. Trazida por decisão de produto (não constava no inventário original; ver D20 em `decisoes-pendentes.md`).

### Conteúdo
Duas colunas (responsivo: empilha no mobile): lista de conversas (prévia da última mensagem + contador de não lidas) e "iniciar conversa" (seleção de usuário ativo); thread da conversa selecionada com as mensagens (próprias à direita), data/hora, "Visto", links clicáveis e referência à demanda, mais a caixa de envio. Item **Mensagens** no menu, com badge de não lidas.

### Permissões
Qualquer usuário autenticado; cada um só vê as conversas das quais participa (validado no backend). Anexos, busca e exportação ficam para fases seguintes.

### Estados da tela
- Carregando: "Carregando..." na lista e na thread.
- Vazio: "Nenhuma conversa ainda." / "Selecione uma conversa para começar."
- Erro: mensagem genérica de falha ao carregar/enviar.
- Sucesso: conversas e mensagens exibidas; o envio limpa o campo.
- Sem permissão: backend bloqueia acesso a conversa de terceiros (403).

---

## Tela: Relatórios (gestão)

> Tela acrescentada pelo plano de melhorias pós-setores (item #2 em `docs/desenvolvimento/16-plano-melhorias.md`). Visão gerencial só leitura, sem tabela nova (usa `demandas`, `acoes`, `setores`, `usuarios`).

### Objetivo da tela
Dar à gestão uma visão consolidada: quantas demandas há por status e por setor, o percentual de ações concluídas no prazo num período e a produtividade por responsável.

### Tipo de usuário que acessa
Apenas **Gestor** e **Administrador** (validado no backend com `exigir_perfil`). O item de menu "Relatórios" aparece só para esses perfis. O recorte por setor do key user fica para fase futura.

### Dados exibidos
- **% concluídas no prazo (período):** entre as ações concluídas no intervalo, quantas dentro do prazo.
- **Demandas por status** e **Demandas por setor:** contagem da situação atual (não filtra período).
- **Produtividade por responsável (período):** ações concluídas e quantas no prazo, por pessoa.

### Ações disponíveis
Escolher o período (datas De/Até; padrão últimos 30 dias); **exportar a produtividade em CSV** (BOM UTF-8 e separador `;`, compatível com Excel pt-BR).

### Regras de negócio aplicadas
Só leitura (não altera dados). Período em `YYYY-MM-DD`, com defaults seguros no backend. A exportação gera log (`relatorio_exportado`). Acesso restrito a Gestor/Admin no backend.

### Estados da tela
- Carregando: "Carregando..." nos blocos.
- Vazio: "Sem dados." nas listas; "Nenhuma ação concluída no período." na produtividade; "—" no KPI sem base.
- Erro: alerta genérico de falha ao carregar.
- Sucesso: KPI, listas e tabela preenchidos; CSV baixado.
- Sem permissão: Colaborador é redirecionado ao Dashboard (e o backend bloqueia).

### Comportamento responsivo
KPI e os dois painéis (status/setor) empilham no mobile; a tabela de produtividade vira cartões (mesmo padrão das demais listas).

---

## Tela: Projetos (lista) e Projeto (detalhe)

> Telas acrescentadas pelo plano de melhorias pós-setores (item #3, D22 em `decisoes-pendentes.md`). Projeto agrupa várias demandas. Tabela nova `projetos` + `demandas.projeto_id`.

### Objetivo
Agrupar demandas relacionadas sob um mesmo **Projeto** (com responsável e setor próprios, opcionais), para a empresa que trabalha por projetos.

### Tipo de usuário que acessa
Todos os perfis, com **escopo por envolvimento**: Gestor/Admin veem todos os projetos; o Colaborador vê os projetos em que é responsável, key user do setor do projeto, ou que tenham ao menos uma demanda em que esteja envolvido. Criar/editar/arquivar projeto e mover demanda = **Gestor/Admin** (validado no backend).

### Dados exibidos
- **Lista (`projetos.html`):** nome, status, responsável, setor e progresso de demandas (concluídas/total). Filtros: busca por nome, status e setor.
- **Detalhe (`projeto.html`):** nome, status, descrição, responsável, setor, criador, contagem de demandas e a **lista de demandas vinculadas** (reaproveita a listagem de demandas filtrada por projeto, respeitando o escopo). Para Gestor/Admin: edição (nome, descrição, status, responsável, setor) e ações de **arquivar/cancelar**.

### Ações disponíveis
Criar projeto (modal, Gestor/Admin); abrir detalhe; editar; arquivar/cancelar. Vincular uma demanda a um projeto pelo **modal de nova demanda** (select "Projeto") ou pelo controle **"Mover para projeto"** no detalhe da demanda.

### Regras de negócio aplicadas
Status espelha o ciclo da demanda (`aberto`, `em_andamento`, `concluido`, `arquivado`, `cancelado`); `concluido` é manual (projeto não tem ação chave). Sem exclusão física: arquiva/cancela via status. Apagar um projeto **não apaga** as demandas (`ON DELETE SET NULL`). A permissão real é do backend.

### Estados da tela
- Carregando: "Carregando..." na lista e no detalhe.
- Vazio: "Nenhum projeto encontrado." (lista); "Nenhuma demanda vinculada a este projeto." (detalhe).
- Erro: alerta genérico de falha.
- Sucesso: lista/detalhe preenchidos; criação leva ao detalhe do novo projeto.
- Sem permissão: Colaborador sem envolvimento recebe 403 ao abrir um projeto fora do seu escopo; ações de edição não aparecem para quem não é Gestor/Admin.

### Comportamento responsivo
Listas (projetos e demandas do projeto) viram cartões no mobile (mesmo padrão das demais). Formulários em coluna única.

---

## Tela: Roadmap (Gantt / linha do tempo)

> Tela acrescentada por decisão de produto (D23 em `decisoes-pendentes.md`). Mostra a fila de projetos, demandas e tarefas no tempo (pelo prazo), como um Gantt. Sem tabela nova (usa `acoes`, `demandas`, `projetos`, `setores`).

### Objetivo da tela
Dar uma visão geral (overview) do que está na fila e quando vence: posiciona as **tarefas** numa linha do tempo, agrupadas por **projeto** e **demanda**, para enxergar prazos, lacunas de tempo e o impacto de novas entradas — e permitir **prorrogar prazos**.

### Tipo de usuário que acessa
Todos os perfis, com **escopo**: Gestor/Admin veem todas as tarefas; o Colaborador vê apenas as de demandas em que está envolvido (mesma regra das Ações). Alterar prazo = **Gestor/Admin** ou **key user** do setor da demanda.

### Dados exibidos
Barras por tarefa (início = criação, fim = prazo; concluída usa a data de conclusão), agrupadas por projeto → demanda. Cor por situação (pendente, bloqueada, atrasada, concluída, recusada). Linha do "hoje". Filtros: período (De/Até, padrão ~3 meses), projeto e setor.

### Ações disponíveis
Navegar/filtrar o período, projeto e setor; clicar numa barra abre o detalhe da tarefa (com link para a demanda) e, para quem tem permissão, **alterar o prazo** (prorrogação) ou removê-lo.

### Regras de negócio aplicadas
Só tarefas **com prazo** aparecem. A prorrogação valida a data no backend, não reagenda tarefa concluída/cancelada, registra log e **notifica o responsável**. O escopo e a permissão são validados no backend.

### Estados da tela
- Carregando: "Carregando..." na área do gráfico.
- Vazio: "Nenhuma tarefa com prazo no período selecionado."
- Erro: alerta genérico de falha ao carregar/salvar.
- Sucesso: timeline renderizada; ao salvar um prazo, recarrega.
- Sem permissão: o escopo limita o conteúdo; o botão de salvar prazo só aparece para quem pode alterar.

### Comportamento responsivo
A linha do tempo rola horizontalmente no mobile (a coluna de rótulos fica fixa à esquerda). Filtros e legenda quebram em linha.

---

## Checklist de validação

- [x] Este documento foi preenchido?
- [x] Está coerente com o MVP?
- [x] Está coerente com a stack?
- [x] Está coerente com as boas práticas?
- [x] Existem decisões pendentes? (apenas itens de implementação: endereço do e-mail de suporte e CDN de ícones)
