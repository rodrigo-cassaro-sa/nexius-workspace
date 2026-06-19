# AGENTS.md

Este arquivo é o contrato de trabalho dos agentes de código neste projeto.

Ele orienta Codex, Claude Code e outros agentes a usarem os documentos de boas práticas sem inventar arquitetura, stack, telas, endpoints, tabelas ou integrações fora do requisito.

## Leitura obrigatória

Antes de alterar código, leia sempre:

1. `docs/boas-praticas/boas-praticas-seguranca.md`
2. `docs/boas-praticas/boas-praticas-sintaxe-logica.md`
3. `docs/boas-praticas/boas-praticas-arquitetura.md`

Depois, leia apenas os documentos da área envolvida na tarefa:

| Tipo de tarefa | Documentos adicionais |
|---|---|
| Tela, layout, HTML, CSS, JavaScript, UX, responsividade, animações | `boas-praticas-frontend.md` |
| Endpoint, API, validação, upload, webhook, integração, log, cron, fila no servidor | `boas-praticas-backend.md` |
| Tabela, campo, índice, relacionamento, migração, seed, SQL | `boas-praticas-banco-dados.md` |
| Cache local, fila local, sincronização, funcionamento sem internet, conflito offline | `boas-praticas-offline.md` |
| Notificação interna, navegador, push, e-mail, SMS, WhatsApp, templates e filas multicanal | `boas-praticas-notificacoes.md` |

Se houver `descricao-produto.md`, `guia-visual.md`, mockup aprovado ou documentação específica do projeto, leia também antes de implementar funcionalidade ou tela.

## Prioridade em caso de conflito

Use esta ordem de prioridade:

1. Segurança do projeto.
2. Stack oficial.
3. Regras de sintaxe, lógica e organização.
4. Arquitetura e separação de camadas.
5. Documento específico da área alterada.
6. Documentação do produto, mockup e requisito da tarefa.

Se o pedido do usuário contrariar segurança, stack ou arquitetura, não implemente direto. Explique o conflito e proponha o menor ajuste seguro.

## Stack oficial

A stack padrão deste kit é:

```txt
HTML
CSS
JavaScript puro
PHP procedural
MySQL
APIs JSON
```

Não usar sem aprovação explícita:

```txt
React
Vue
Angular
Next.js
TypeScript
Tailwind
Bootstrap
jQuery
Node.js
Laravel
Symfony
Supabase
Firebase
n8n
Orientação a objeto
Classes
Framework obrigatório
Biblioteca externa desnecessária
```

Recursos como `IndexedDB`, `Service Worker`, `Cache API`, `Push API`, `Notifications API`, VAPID, provedor de e-mail, provedor de SMS e provedor de WhatsApp só podem ser usados quando a tarefa realmente exigir e depois de ler os documentos de offline e notificações.

## Regra principal

Crie somente o que foi pedido.

Não crie automaticamente:

- telas extras;
- endpoints extras;
- tabelas extras;
- pastas extras;
- filas extras;
- integrações externas;
- notificações;
- offline/PWA;
- Service Worker;
- relatórios;
- automações;
- webhooks;
- uploads;
- dependências.

Use sempre a menor solução segura e compatível com os documentos.

## Antes de implementar

Faça esta checagem mental antes de editar arquivos:

- A tarefa exige frontend, backend, banco, offline ou notificações?
- Li os documentos certos para essa área?
- Existe mockup, guia visual ou descrição de produto?
- A alteração respeita HTML, CSS, JavaScript puro, PHP procedural e MySQL?
- A alteração evita framework, classe, dependência e arquitetura nova?
- A alteração exige login, permissão, validação, prepared statement ou log?
- Há risco de expor senha, token, chave, dado sensível ou erro técnico?
- Há risco de duplicidade, conflito offline ou envio duplicado de notificação?
- Estou criando só o mínimo necessário?

## Padrões obrigatórios

- APIs sempre retornam JSON com `ok`.
- Erros de API não expõem detalhes técnicos ao usuário final.
- SQL sempre usa prepared statements.
- Senhas nunca são salvas puras.
- Tokens sensíveis nunca são salvos em `localStorage`.
- Segredos, chaves privadas e tokens de provedor nunca ficam no frontend.
- Endpoints privados exigem autenticação e permissão.
- Ações críticas geram log.
- Nomes de arquivos, funções, variáveis, tabelas e campos devem ser claros, em português simples, sem acentos e sem caracteres especiais.
- HTML, CSS e JavaScript devem ficar separados quando possível.
- PHP deve ser procedural.
- O banco deve ser simples, normalizado quando fizer sentido, com chaves, constraints e índices necessários.
- Offline deve ter idempotência, fila local segura e confirmação do backend antes de marcar ação como concluída.
- Notificações devem respeitar consentimento, canal preferencial, anti-spam, opt-out quando aplicável e não devem carregar dados sensíveis.

## Fluxo recomendado por tipo de entrega

### Nova tela

1. Ler segurança, sintaxe, arquitetura e frontend.
2. Ler mockup ou guia visual, se existir.
3. Criar somente os arquivos necessários.
4. Separar HTML, CSS e JavaScript.
5. Usar estados de carregando, vazio, erro e sucesso quando fizer sentido.
6. Não colocar regra sensível no frontend.

### Novo endpoint

1. Ler segurança, sintaxe, arquitetura e backend.
2. Validar entrada.
3. Verificar autenticação e permissão.
4. Usar prepared statement.
5. Retornar JSON padronizado.
6. Registrar log quando a ação for crítica.

### Nova tabela ou migração

1. Ler segurança, arquitetura e banco de dados.
2. Criar apenas campos comprovados pelo requisito.
3. Definir chave primária, foreign keys, constraints e índices necessários.
4. Usar nomes claros e consistentes.
5. Não salvar senha pura nem segredo.

### Recurso offline

1. Ler segurança, frontend, backend, banco e offline.
2. Definir quais dados podem ser consultados offline.
3. Definir quais ações podem entrar em fila local.
4. Criar idempotência antes de sincronização.
5. Tratar conflitos claramente.
6. Limpar dados locais no logout.

### Recurso de notificação

1. Ler segurança, backend, banco e notificações.
2. Definir canal, consentimento, prioridade e template.
3. Usar fila quando houver envio externo.
4. Evitar duplicidade e spam.
5. Não enviar dados sensíveis no conteúdo da mensagem.

## Como responder ao usuário

Ao finalizar uma alteração, informe de forma objetiva:

- o que foi alterado;
- quais arquivos foram mexidos;
- quais documentos de boas práticas foram seguidos;
- se houve algum conflito, limitação ou decisão importante;
- quais testes ou checagens foram feitos.

Não diga que algo foi testado se não foi.
Não invente evidência.
Não esconda incerteza.
