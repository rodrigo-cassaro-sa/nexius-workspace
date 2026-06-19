# Boas Práticas de Backend

Este documento define boas práticas para construção de backend em projetos criados ou alterados por IA de coding.

O objetivo é orientar a criação de APIs, endpoints, validações, autenticação, permissões, integrações, uploads, logs, automações e processamento no servidor de forma simples, segura e organizada.

---

## 1. Escopo deste documento

Este documento cuida apenas de backend.

Ele não define:

* Telas do sistema
* Design visual
* Componentes de frontend
* Schema final do banco
* Tabelas obrigatórias
* Regras de negócio específicas
* Funcionalidades não solicitadas
* Protocolo offline completo

As regras de negócio devem vir da descrição do produto, requisitos, mockup, tarefa solicitada ou documentação do projeto.

Se o projeto exigir funcionamento offline, seguir também:

```txt
boas-praticas-offline.md
```

---

## 2. Regra de criação mínima

A IA deve criar apenas o necessário para a tarefa atual.

Não criar:

* Endpoints preventivos
* Funções sem uso
* Includes genéricos demais
* Webhooks sem integração real
* Rotinas cron sem necessidade
* Sistema de fila sem necessidade
* Upload sem funcionalidade real
* Integrações não solicitadas
* Arquivos futuros sem uso claro
* Estrutura complexa sem necessidade

O backend deve acompanhar o escopo real do projeto.

---

## 3. Stack oficial do backend

O backend deve usar:

```txt
PHP procedural
MySQL
APIs em JSON
```

Não usar:

```txt
Orientação a objeto
Classes
Laravel
Symfony
Node.js
Express
Fastify
Supabase Functions
Firebase Functions
n8n
Framework obrigatório
```

Dependências externas só devem ser sugeridas se forem realmente necessárias e aprovadas.

---

## 4. Responsabilidade do backend

O backend deve cuidar de:

* Receber requisições
* Validar entrada
* Validar autenticação
* Validar permissão
* Executar regras de negócio
* Consultar banco de dados
* Criar registros
* Atualizar registros
* Excluir registros quando permitido
* Registrar logs
* Processar webhooks
* Processar uploads
* Processar filas do servidor
* Processar rotinas cron
* Integrar com serviços externos
* Retornar respostas JSON

O backend não deve cuidar de:

* Layout
* Estilos
* Animações
* Componentes visuais
* HTML de interface
* Conteúdo visual do mockup
* Regra visual de frontend

---

## 5. Fluxo padrão do backend

Fluxo recomendado:

```txt
Frontend ou integração
  ↓
Endpoint PHP
  ↓
Validação
  ↓
Autenticação
  ↓
Permissão
  ↓
Regra de negócio
  ↓
Banco de dados
  ↓
Log
  ↓
Resposta JSON
```

O backend deve ser previsível, seguro e consistente.

---

## 6. Estrutura base de referência

A estrutura abaixo é apenas uma referência.

A IA deve usar apenas as pastas e arquivos necessários para o projeto atual.

```txt
api/

includes/

cron/

storage/

logs/
```

Não criar todas essas pastas automaticamente se o projeto não precisar.

---

## 7. Responsabilidade da pasta api

A pasta `api` deve conter endpoints chamados pelo frontend ou por integrações externas.

Cada endpoint deve:

* Ter uma responsabilidade principal
* Validar método HTTP
* Validar entrada
* Validar sessão quando necessário
* Validar permissão quando necessário
* Executar uma ação clara
* Retornar JSON
* Não retornar HTML
* Não misturar várias ações diferentes

Exemplo genérico:

```txt
api/
  usuarios/
    criar.php
    listar.php
    detalhe.php
    atualizar.php
```

Criar apenas os endpoints necessários.

---

## 8. Responsabilidade da pasta includes

A pasta `includes` deve conter funções reutilizáveis do backend.

Pode conter funções para:

* Configuração
* Conexão com banco
* Resposta JSON
* Sessão
* Autenticação
* Permissão
* Validação
* Logs
* Upload
* Fila
* Webhook
* Helpers simples

Não deve conter:

* Telas
* HTML de interface
* Código específico de uma única página
* Funções sem uso real
* Regras visuais

---

## 9. Responsabilidade da pasta cron

A pasta `cron` deve conter rotinas automáticas executadas pelo servidor.

Pode conter:

* Processamento de fila
* Envio de lembretes
* Limpeza de sessões expiradas
* Atualização de status
* Geração de relatórios
* Reprocessamento de itens com erro

Criar apenas se houver automação programada.

---

## 10. Padrão de endpoints

Cada endpoint deve executar uma ação principal.

Preferir:

```txt
api/usuarios/criar.php
api/usuarios/listar.php
api/usuarios/detalhe.php
api/usuarios/atualizar.php
```

Evitar:

```txt
api/acao.php
api/faz-tudo.php
api/sistema.php
api/processar.php
```

Não usar um endpoint genérico para várias ações por parâmetro.

Evitar:

```txt
api/acao.php?tipo=criar
api/acao.php?tipo=excluir
api/acao.php?tipo=atualizar
```

Preferir endpoints específicos e claros.

---

## 11. Estrutura interna de endpoint

Todo endpoint deve seguir uma ordem previsível.

Ordem recomendada:

```txt
1. Carregar includes necessários
2. Validar método HTTP
3. Ler dados da requisição
4. Validar dados obrigatórios
5. Validar tipos e formatos
6. Validar autenticação, se necessário
7. Validar permissão, se necessário
8. Conectar ao banco
9. Executar ação principal
10. Registrar log, se necessário
11. Responder JSON
```

Exemplo base:

```php
<?php

require_once __DIR__ . "/../../includes/database.php";
require_once __DIR__ . "/../../includes/response.php";
require_once __DIR__ . "/../../includes/auth.php";
require_once __DIR__ . "/../../includes/validate.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response([
        "ok" => false,
        "error" => "Método não permitido."
    ], 405);
}

$body = json_decode(file_get_contents("php://input"), true);

if (!$body) {
    json_response([
        "ok" => false,
        "error" => "Dados inválidos."
    ], 400);
}

// validar dados
// validar login
// validar permissão
// executar ação
// responder JSON
```

---

## 12. Padrão de resposta JSON

Toda API deve responder em JSON.

### Sucesso simples

```json
{
  "ok": true,
  "message": "Operação realizada com sucesso."
}
```

### Sucesso com dados

```json
{
  "ok": true,
  "data": {}
}
```

### Erro

```json
{
  "ok": false,
  "error": "Não foi possível processar a solicitação."
}
```

### Regras

* Sempre retornar `ok`.
* Em sucesso, retornar `data`, `message` ou ambos.
* Em erro, retornar `error`.
* Não retornar texto solto.
* Não retornar HTML.
* Não misturar formatos diferentes.
* Não expor erro técnico ao usuário final.

---

## 13. Métodos HTTP

Usar métodos de forma previsível.

Recomendação:

```txt
GET    → consulta
POST   → criação ou ação
PUT    → atualização completa, se o projeto usar
PATCH  → atualização parcial, se o projeto usar
DELETE → exclusão, se o projeto usar
```

Para projetos simples, pode ser usado:

```txt
GET  → listar e consultar
POST → criar, atualizar, excluir e executar ações
```

O padrão escolhido deve ser mantido em todo o projeto.

---

## 14. Entrada de dados

Toda entrada deve ser validada no backend.

Validar:

* Campos obrigatórios
* Tipo dos dados
* Tamanho mínimo
* Tamanho máximo
* Formato de e-mail
* Formato de data
* Valores numéricos
* Status permitidos
* IDs existentes
* Permissão sobre o recurso solicitado

Não confiar em dados vindos do navegador.

---

## 15. Autenticação

Endpoint privado deve exigir usuário autenticado.

Boas práticas:

* Usar sessão segura.
* Verificar sessão em endpoints privados.
* Regenerar sessão após login.
* Encerrar sessão no logout.
* Não confiar em dados de usuário enviados pelo frontend.
* Obter usuário logado pela sessão no backend.

Funções comuns:

```txt
usuario_esta_logado
obter_usuario_logado
exigir_login
fazer_logout
```

Criar apenas as funções necessárias.

---

## 16. Permissões

Permissão real deve ser validada no backend.

Boas práticas:

* Validar perfil do usuário.
* Validar se o usuário pode acessar o recurso.
* Validar se o usuário pode alterar o recurso.
* Validar se o usuário pode excluir o recurso.
* Não confiar em botão escondido no frontend.
* Não confiar em perfil enviado pelo navegador.
* Não confiar em dados editáveis pelo usuário.

Funções comuns:

```txt
usuario_e_admin
usuario_pode_acessar_recurso
usuario_pode_editar_recurso
usuario_pode_excluir_recurso
```

Adaptar os nomes conforme o projeto.

---

## 17. Acesso ao banco

Acesso ao banco deve ser centralizado em funções reutilizáveis.

Boas práticas:

* Usar conexão centralizada.
* Usar prepared statements.
* Não concatenar input do usuário em SQL.
* Buscar apenas campos necessários.
* Evitar `SELECT *` em endpoints finais.
* Usar transações em operações relacionadas.
* Não espalhar conexão com banco em arquivos públicos.
* Não deixar credenciais de banco em pasta pública.

---

## 18. Transações

Usar transaction quando uma ação alterar múltiplas tabelas ou depender de consistência.

Usar transaction para:

* Criar registro principal e registros relacionados
* Confirmar pagamento e atualizar status
* Converter registro temporário em registro definitivo
* Processar lote
* Executar webhook com múltiplas alterações
* Executar ação crítica que depende de várias etapas

Fluxo recomendado:

```txt
iniciar transaction
  ↓
executar operação 1
  ↓
executar operação 2
  ↓
executar operação 3
  ↓
commit
```

Se falhar:

```txt
rollback
```

---

## 19. Logs

Operações críticas devem gerar log.

Registrar quando fizer sentido:

* Login
* Logout
* Falha de login
* Criação de registro importante
* Atualização sensível
* Exclusão
* Alteração de permissão
* Recebimento de webhook
* Erro em webhook
* Processamento de fila
* Upload de arquivo
* Falha de integração externa

Não registrar:

* Senhas
* Tokens
* Chaves secretas
* Dados sensíveis desnecessários

---

## 20. Erros

Erros devem ser tratados de forma previsível.

Boas práticas:

* Não exibir erro técnico para usuário final.
* Retornar mensagem simples.
* Registrar detalhe técnico em log quando necessário.
* Não ignorar erro silenciosamente.
* Não quebrar o padrão JSON.
* Não expor caminho interno do servidor.
* Não expor SQL na resposta.
* Não expor stack trace em produção.

Resposta segura:

```json
{
  "ok": false,
  "error": "Não foi possível processar a solicitação."
}
```

---

## 21. Uploads

Uploads devem ser tratados pelo backend.

Boas práticas:

* Validar tamanho.
* Validar extensão.
* Validar MIME type.
* Renomear arquivo.
* Não confiar no nome original.
* Separar arquivos públicos e privados.
* Não salvar arquivo privado em pasta pública.
* Registrar log quando necessário.
* Não permitir execução de arquivo enviado.
* Criar upload apenas se o projeto precisar.

---

## 22. Webhooks

Webhooks devem ficar em área própria quando existirem.

Exemplo:

```txt
api/webhooks/
```

Boas práticas:

* Aceitar apenas método necessário.
* Validar chave secreta.
* Validar body.
* Registrar recebimento.
* Evitar processar evento duplicado.
* Usar transaction quando alterar múltiplas tabelas.
* Retornar JSON.
* Não expor erro técnico.
* Criar webhooks apenas se houver integração externa real.

---

## 23. Filas do servidor

Filas devem ser usadas quando uma ação não precisa ser concluída imediatamente ou pode falhar.

Usar fila para:

* Envio de mensagens
* Envio de e-mails
* Processamento pesado
* Reprocessamento de falhas
* Integrações externas
* Rotinas demoradas

Criar fila apenas se houver necessidade real.

Campos comuns de fila:

```txt
id
tipo
payload
status
tentativas
erro
criado_em
processado_em
```

Status comuns:

```txt
pendente
processando
processado
erro
cancelado
```

---

## 24. Automações do servidor

Automações devem ser separadas do fluxo principal.

Tipos comuns:

* Cron
* Fila
* Webhook
* Rotina manual protegida

Boas práticas:

* Não criar automação sem necessidade.
* Registrar execução.
* Registrar erro.
* Permitir reprocessamento quando fizer sentido.
* Evitar duplicidade.
* Manter rotina pequena e clara.
* Não travar a experiência do usuário com processamento demorado.

---

## 25. Integrações externas

Integrações externas devem passar pelo backend.

Boas práticas:

* Não chamar integração sensível direto do frontend.
* Validar dados antes de enviar para integração.
* Registrar envio.
* Registrar resposta.
* Registrar erro.
* Usar fila quando a integração puder falhar.
* Evitar travar o usuário esperando integração demorada.
* Não expor chave de integração no frontend.

Criar integração apenas se houver necessidade real.

---

## 26. E-mails e notificações

E-mails e notificações devem ser tratados pelo backend.

Boas práticas:

* Centralizar envio.
* Validar destinatário.
* Registrar envio quando necessário.
* Registrar falha quando necessário.
* Usar fila quando o envio puder demorar.
* Não expor credenciais de envio no frontend.
* Não enviar notificação duplicada.
* Não criar envio automático sem requisito.

---

## 27. Relatórios

Relatórios devem ser criados apenas quando solicitados.

Boas práticas:

* Buscar apenas os dados necessários.
* Usar filtros claros.
* Usar paginação quando necessário.
* Evitar consultas pesadas sem índice.
* Não gerar relatório pesado durante fluxo crítico.
* Usar rotina assíncrona quando o relatório for demorado.
* Não criar relatórios preventivos.

---

## 28. Reprocessamento

Quando uma ação falhar, ela pode ser reprocessada se fizer sentido.

Boas práticas:

* Registrar número de tentativas.
* Registrar último erro.
* Definir limite de tentativas.
* Não repetir infinitamente sem controle.
* Permitir reprocessamento manual quando necessário.
* Não duplicar dados ao reprocessar.
* Registrar resultado do reprocessamento.

---

## 29. Suporte a offline

Este documento não define o protocolo offline completo.

Quando o projeto exigir funcionamento offline, seguir:

```txt
boas-praticas-offline.md
```

O backend deve apenas estar preparado para integrar com o protocolo definido no documento offline quando essa funcionalidade for solicitada.

Não criar endpoints de sincronização offline sem requisito.

Não criar fila offline sem requisito.

Não criar estrutura de conflito ou idempotência offline sem necessidade real.

---

## 30. O que a IA não deve fazer

A IA não deve:

* Criar endpoint sem necessidade.
* Criar endpoint genérico que faz tudo.
* Criar função gigante.
* Criar backend orientado a objeto.
* Criar classes.
* Adicionar framework sem aprovação.
* Misturar HTML em endpoint de API.
* Retornar texto solto em API.
* Ignorar validação.
* Ignorar permissão.
* Criar SQL inseguro.
* Criar automação sem requisito.
* Criar webhook sem integração real.
* Criar fila sem necessidade.
* Criar upload sem requisito.
* Criar integração externa sem requisito.
* Criar relatório não solicitado.
* Criar sincronização offline neste documento.
* Expor segredo no frontend.
* Expor erro técnico na resposta.

---

## 31. Ordem recomendada para criar backend com IA

Ao criar backend a partir de requisitos, seguir esta ordem:

1. Ler os documentos de boas práticas.
2. Ler a descrição do produto.
3. Identificar funcionalidades reais.
4. Identificar dados necessários.
5. Identificar endpoints necessários.
6. Identificar permissões necessárias.
7. Identificar se há necessidade de upload.
8. Identificar se há necessidade de webhook.
9. Identificar se há necessidade de fila.
10. Identificar se há necessidade de cron.
11. Identificar se há necessidade de integração externa.
12. Identificar se há necessidade de offline.
13. Criar estrutura mínima.
14. Criar includes necessários.
15. Criar endpoint por endpoint.
16. Criar automações apenas se solicitadas.
17. Criar integrações apenas se solicitadas.
18. Se houver offline, seguir `boas-praticas-offline.md`.
19. Revisar segurança, arquitetura, sintaxe e banco.

---

## 32. Checklist de backend

Antes de finalizar qualquer alteração, revisar:

* [ ] O backend segue PHP procedural?
* [ ] Nenhuma classe foi criada?
* [ ] Nenhum framework foi adicionado?
* [ ] O endpoint tem responsabilidade única?
* [ ] O endpoint valida método HTTP?
* [ ] O endpoint valida entrada?
* [ ] O endpoint valida autenticação quando necessário?
* [ ] O endpoint valida permissão quando necessário?
* [ ] A resposta é JSON?
* [ ] Não retorna HTML em API?
* [ ] Não retorna texto solto?
* [ ] Não expõe erro técnico?
* [ ] Usa prepared statement?
* [ ] Usa transaction quando necessário?
* [ ] Registra log quando necessário?
* [ ] Não criou automação sem requisito?
* [ ] Não criou webhook sem integração real?
* [ ] Não criou fila sem necessidade?
* [ ] Não criou upload sem requisito?
* [ ] Não criou integração sem requisito?
* [ ] Não criou relatório sem requisito?
* [ ] Não criou sincronização offline sem seguir o documento próprio?
* [ ] Não há dados sensíveis expostos?
* [ ] O código continua simples e fácil de manter?
