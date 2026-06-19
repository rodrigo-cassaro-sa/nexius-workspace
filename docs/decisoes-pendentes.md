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

- Endereço do **e-mail de suporte** exibido na tela de Ajuda — definir depois (placeholder em `config` até ter o oficial).
- **Logo definitiva** do Grupo Nexius (hoje placeholder em texto) — depende de anexo.

## Inconsistências de documentação — corrigidas

- `01-descricao-produto.md` §24: identidade visual já marcada como resolvida.
- Pendências consolidadas neste arquivo.
- Caminho do mockup: guia aponta `mockups/mockup-telas.png`; arquivo atual é `docs/design/mockup.png` — ajustar caminho ou mover o arquivo (item operacional).
- Briefing "Atribuições/responsáveis": confirmado como campo (responsável em demanda/ação), não tabela separada.
