# Validação da Documentação

Data da validação: 2026-06-19
Escopo: documentos de produto, design e boas práticas do Workspace S&A (marca Grupo Nexius).
Objetivo: verificar se a documentação está pronta para iniciar o desenvolvimento do MVP. Nesta etapa não há implementação de código.

Documentos analisados:

- `docs/produto/00-briefing-projeto.md`
- `docs/produto/01-descricao-produto.md`
- `docs/design/02-guia-visual.md`
- `docs/produto/03-mapa-de-telas.md`
- `docs/boas-praticas/*` (arquitetura, backend, banco, frontend, notificações, offline, segurança, sintaxe-lógica)
- `AGENTS.md`, `CLAUDE.md`

---

## 1. Status geral

- [x] Pronto para desenvolvimento
- [ ] Parcialmente pronto
- [ ] Não pronto

> Atualização 2026-06-19: as 6 decisões bloqueantes (D1–D6) e as não bloqueantes (D7–D13) foram resolvidas e propagadas para os documentos. Ver `docs/decisoes-pendentes.md` e `01-descricao-produto.md` (§8, §9, §16, §19, §24). Restam apenas itens operacionais de implementação (endereço do e-mail de suporte, CDN de ícones e logo definitiva), que não bloqueiam o desenvolvimento.

Avaliação original (mantida para histórico): a base de produto estava clara e bem escopada, mas havia lacunas de modelagem e de regra (convites, tokens de recuperação, escopo de visibilidade, observadores de ação) que bloqueavam permissões e notificações. Essas lacunas foram fechadas.

---

## 2. Pontos aprovados

- **Ideia do SaaS (item 1):** clara e consistente entre briefing (§22-28) e descrição (§1-2). Sistema para controlar demandas de projeto, com plano de ação, ação chave e pré-requisitos.
- **Público-alvo (item 2):** claro — equipes internas; uso interno, sem cliente externo no MVP (briefing §42-44; descrição §5).
- **Dores (item 3):** bem definidas e iguais entre documentos (briefing §34-40; descrição §4).
- **Separação MVP x futuro (item 4):** explícita e coerente (descrição §10, §11, §23). Pagamentos, gamificação, offline, relatórios, push/WhatsApp e integrações externas estão claramente fora.
- **Regras de negócio (item 5):** 10 regras objetivas e majoritariamente acionáveis (descrição §8). Conclusão por responsável, ação chave única, bloqueio por pré-requisito, sem exclusão física, prazo em ações.
- **Tipos de usuário e permissões (item 6):** 3 perfis com tabela de permissões (descrição §6 e §9).
- **Mapa de telas (item 7):** completo, com objetivo, dados, ações, regras, 5 estados e comportamento responsivo por tela; inclui seção mobile.
- **Guia visual (item 8):** design system consistente, com tokens, paleta Grupo Nexius (`#4E392F`/`#606062`/`#F2F1EE`), tipografia Inter e componentes mapeados às telas reais.
- **Conflitos com a stack (item 9):** nenhum. Tudo dentro de HTML, CSS, JS puro, PHP procedural, MySQL e APIs JSON. Sem SPA, sem framework, sem ORM.
- **Onboarding, login, gamificação, retenção (item 14):** definidos. Login por convite, recuperação por e-mail, onboarding de primeiro acesso, gamificação fora do MVP, retenção via dashboard/notificações.
- **Mockup:** existe imagem de referência anexada (`docs/design/mockup.png`).

---

## 3. Conflitos encontrados

1. **Identidade visual marcada como pendente em um doc, mas já definida em outro (item 10).** `01-descricao-produto.md` §24 ainda lista "[PREENCHER] Identidade visual" como pendente, enquanto `02-guia-visual.md` (§1-6) já define marca, paleta e logo. A nota de pendência está desatualizada.
2. **Listas de pendências divergentes entre documentos (item 10).** `descrição §24` cita apenas provedor de e-mail e identidade visual; `mapa de telas` (checklist final) cita preferências de Configurações, canal de suporte e unificação de Configurações; `guia §27` cita logo, ícones e modo escuro. Não há uma fonte única consolidada de pendências.
3. **Local do mockup divergente.** `guia §4` aponta o mockup para `mockups/mockup-telas.png`, mas o arquivo presente é `docs/design/mockup.png`. Conflito apenas de caminho/nome; não bloqueia.
4. **"Atribuições/responsáveis" como entidade x como campo.** Briefing §118-124 lista "Atribuições/responsáveis" entre os dados a salvar, sugerindo entidade própria; a descrição §19 trata responsável como campo de demanda/ação. Precisa ficar claro que não há tabela separada (ou que há).

> Observação: o conflito de paleta azul x marrom de versões anteriores foi resolvido — busca por valores antigos não retorna ocorrências.

---

## 4. Redundâncias encontradas

1. **Regras de negócio duplicadas integralmente** entre briefing §172-185 e descrição §8 (as mesmas 10 regras). É esperado (o briefing alimenta a descrição), mas duplicação manual tende a divergir; a descrição deveria ser a fonte única.
2. **Dores, público e jornada repetidos** entre briefing e descrição. Aceitável, mas reforça a necessidade de tratar a descrição como fonte da verdade.
3. **"Detalhe da ação" x "Detalhe da demanda".** O mapa descreve a ação tanto dentro do detalhe da demanda quanto como tela isolada. Pode ser intencional, mas há sobreposição de responsabilidade entre as duas telas que vale consolidar para evitar duplicar comportamento.

---

## 5. Lacunas encontradas

### Dados necessários sem persistência definida (item 13)

1. **Convites.** Login/cadastro do MVP são por convite (mapa: Cadastro valida convite "com validade e uso único" e "perfil já definido"). Não há entidade de convites em `descrição §19` (token, e-mail, perfil pré-definido, validade, status, criado_por). **Bloqueia cadastro/administração.**
2. **Tokens de recuperação de senha.** A tela de recuperação usa "token com validade e uso único", sem entidade correspondente em §19 (token, usuario_id, expiracao, usado). **Bloqueia recuperação de senha.**
3. **Definição de "vínculo/envolvido".** Colaborador "vê demandas/ações em que está envolvido" e o detalhe da demanda diz "usuário sem vínculo não acessa", mas não há definição do que cria esse vínculo (ser responsável de uma ação? participante? comentar?). Sem isso não há como montar as consultas nem o controle de acesso. **Bloqueia permissões/escopo.**
4. **Escopo do Gestor / conceito de "equipe".** Gestor "vê demandas que gerencia e as da sua equipe", mas não existe entidade ou regra que defina "equipe" ou "que gerencia" (criador? atribuição? agrupamento?). **Bloqueia permissões/escopo.**
5. **Quem "acompanha" uma ação.** A notificação de "novo comentário em ação que o usuário acompanha" depende de definir os observadores de uma ação (responsável? autor de comentário? criador da demanda?). Não há entidade nem regra. **Bloqueia notificações.**
6. **Fila de e-mail.** A descrição §16 menciona "fila quando o envio puder falhar", mas a lista de entidades §19 não inclui fila de e-mail. Definir se haverá tabela de fila (recomendada pelas boas práticas de notificações/backend) ou envio síncrono.
7. **Flag de onboarding concluído.** O onboarding "aparece só no primeiro acesso", o que exige um indicador por usuário (ex.: `onboarding_concluido`). Não consta em §19.
8. **Valores de status enumerados.** Regras citam status de demanda e de ação (aberta/concluída/arquivada/cancelada/pendente/bloqueada), mas não há a lista fechada de valores permitidos por entidade — necessária para o banco e a validação.

### Telas sem funcionalidade clara (item 12)

9. **Configurações.** As preferências do MVP estão como "[PREENCHER]" e não há opt-out de e-mail; a tela pode ficar sem função real. Decidir se existe no MVP ou se funde ao Perfil (mapa já levanta isso).
10. **Gamificação/progresso.** Está no mapa apenas marcada como "Fora do MVP". Não é lacuna de produto, mas a tela não deve ser construída no MVP.

### Funcionalidades sem tela (item 11)

- Não foram encontradas funcionalidades de MVP sem tela. E-mail e logs são de backend (sem tela, correto). Envio de convite tem tela (Administração); aceitar convite tem tela (Cadastro).

### Outras lacunas

11. **Pré-requisito: um ou vários por ação?** A regra fala em "depender de outra ação" (singular). Não está claro se uma ação pode ter mais de um pré-requisito. Afeta a modelagem (campo único x tabela de dependências).
12. **Canal de suporte (tela Ajuda)** está "[PREENCHER]". Não bloqueia o núcleo do MVP.
13. **Requisito não funcional "Disponibilidade"** está "[PREENCHER]" (descrição §21). Não bloqueia o início.

---

## 6. Decisões pendentes

Registradas também em `docs/decisoes-pendentes.md`.

Bloqueiam o MVP (resolver antes de codar permissões/notificações):

- D1. Estrutura de **convites** (campos e ciclo de vida).
- D2. Estrutura de **tokens de recuperação de senha**.
- D3. Definição de **"envolvido/vínculo"** para o escopo do Colaborador.
- D4. Definição de **escopo do Gestor** ("equipe"/"que gerencia") — existe conceito de equipe?
- D5. Definição de **observadores de ação** (quem recebe notificação de novo comentário).
- D6. **Lista fechada de status** de demanda e de ação.

Não bloqueiam o início (podem ser resolvidas em paralelo):

- D7. **Fila de e-mail** (síncrono x tabela de fila).
- D8. **Provedor de e-mail** (SMTP x serviço transacional).
- D9. **Flag de onboarding concluído** por usuário.
- D10. **Pré-requisito**: um único ou múltiplos por ação.
- D11. **Configurações**: tela própria no MVP ou unir ao Perfil; quais preferências.
- D12. **Canal de suporte** na tela de Ajuda.
- D13. **Disponibilidade** (requisito não funcional) e **modo escuro/ícones** (guia §27).

---

## 7. Riscos para o MVP

1. **Escopo de permissões ambíguo (alto).** Sem D3 e D4, o controle de acesso de Colaborador e Gestor não pode ser implementado com segurança; risco de vazar ou esconder dados indevidamente. Segurança exige permissão validada no backend, e a regra de escopo ainda não existe.
2. **Notificações sem regra de destinatário (médio/alto).** Sem D5, a notificação de comentário não tem público definido; risco de não notificar ninguém ou notificar em excesso (anti-spam é exigência das boas práticas).
3. **Fluxos de autenticação incompletos (médio).** Sem D1/D2, cadastro por convite e recuperação de senha — ambos MVP — não têm onde persistir tokens.
4. **Divergência de documentos (baixo/médio).** Pendências espalhadas e regras duplicadas podem gerar implementação inconsistente se a descrição não for tratada como fonte única.
5. **Status não enumerados (médio).** Sem D6, a modelagem do banco e a validação de transição de status ficam indefinidas.
6. **Configurações sem função (baixo).** Risco de criar tela vazia (violação de "não criar tela sem evidência de função").

---

## 8. Recomendações antes de codar

1. **Resolver D1–D6** (bloqueantes) e registrá-los na descrição do produto, que deve ser a fonte única de regra/dado.
2. **Consolidar as pendências** em um único lugar (`docs/decisoes-pendentes.md`) e remover/atualizar as notas divergentes nos demais documentos (sem auto-corrigir agora — apenas planejado).
3. **Atualizar `descrição §19`** com as entidades faltantes confirmadas (convites, tokens de reset, observadores/seguidores se aplicável, fila de e-mail se aplicável, flag de onboarding) e a **lista de status** por entidade.
4. **Definir o escopo de visibilidade** (Colaborador e Gestor) de forma explícita e testável, pois orienta consultas, índices e permissões.
5. **Decidir a tela de Configurações** (manter com função real ou unir ao Perfil) para não criar tela sem propósito.
6. **Ajustar o caminho do mockup** (ou mover o arquivo para o local referenciado no guia).
7. **Ordem de implementação sugerida** (em partes pequenas, após as decisões): (a) estrutura base + conexão + resposta JSON; (b) usuários, convites, login, sessão e recuperação de senha; (c) demandas; (d) ações (chave, prazo, pré-requisito); (e) comentários; (f) atribuição e escopo de permissão; (g) dashboard; (h) notificações internas; (i) notificações por e-mail.

---

## 9. Checklist final

- [x] Ideia do SaaS clara
- [x] Público-alvo claro
- [x] Dores claras
- [x] MVP separado do futuro
- [x] Regras de negócio presentes (com pontos a completar — escopo/observadores/status)
- [x] Tipos de usuário definidos
- [~] Permissões definidas (escopo de Colaborador e Gestor ainda ambíguo — D3/D4)
- [x] Mapa de telas presente e padronizado
- [x] Guia visual completo
- [x] Sem conflito com a stack
- [~] Sem conflito entre documentos (pendências divergentes e nota de visual desatualizada)
- [x] Funcionalidades do MVP têm tela
- [x] Todas as telas têm função (Configurações unida ao Perfil)
- [x] Todos os dados necessários têm persistência (convites, tokens de reset, fila de e-mail, status e flag de onboarding definidos; observadores derivados em runtime)
- [x] Onboarding, login, notificações, gamificação e retenção endereçados
- [x] Sem decisões pendentes bloqueantes (D1–D6 resolvidas)

Conclusão: **Pronto para desenvolvimento.** Todas as decisões bloqueantes e não bloqueantes foram resolvidas; restam apenas itens operacionais (e-mail de suporte, CDN de ícones, logo). Pode iniciar a implementação na ordem da seção 8.
