# Boas Práticas de Arquitetura

Este documento define boas práticas de arquitetura para projetos criados ou alterados por IA de coding.

O objetivo é manter a estrutura simples, previsível, segura, modular e fácil de manter.

---

## 1. Escopo deste documento

Este documento cuida apenas de arquitetura.

Ele não define:

* Telas do projeto
* Regras de negócio
* Funcionalidades obrigatórias
* Design visual
* Conteúdo das páginas
* Schema final do banco
* Fluxos específicos do produto

As telas devem vir do mockup aprovado.

As funcionalidades devem vir da descrição do produto, requisitos ou tarefa solicitada.

A arquitetura apenas organiza onde cada parte deve ficar.

---

## 2. Regra de criação mínima

A IA deve criar apenas o que for necessário para a tarefa atual.

Estruturas mostradas neste documento são modelos de referência, não listas obrigatórias.

Não criar:

* Pastas vazias sem necessidade
* Áreas genéricas sem uso real
* Endpoints preventivos
* Tabelas não solicitadas
* Telas extras
* Módulos que não aparecem no mockup ou nos requisitos
* Funcionalidades inventadas

A IA não deve aumentar o escopo do projeto.

---

## 3. Origem das telas

As telas do projeto devem ser derivadas do mockup visual aprovado.

Cada tela identificada no mockup pode gerar:

* Um arquivo HTML
* Um arquivo JavaScript específico, se necessário
* Estilos reaproveitados nos arquivos CSS existentes

A IA não deve criar telas extras sem autorização.

Se uma tela não estiver no mockup ou na tarefa, não deve ser criada.

---

## 4. Origem das áreas funcionais

As áreas funcionais devem ser derivadas das funcionalidades reais do projeto.

Exemplo:

Se o projeto possui alunos, turmas e materiais, criar apenas áreas relacionadas a alunos, turmas e materiais.

Não criar áreas como pagamentos, relatórios, produtos, clientes, webhooks ou configurações se elas não forem solicitadas.

---

## 5. Princípios gerais

* Manter arquitetura simples.
* Separar responsabilidades.
* Evitar acoplamento entre frontend, backend e banco.
* Não misturar interface com regra de negócio.
* Não misturar acesso ao banco com arquivos de tela.
* Não criar arquivos genéricos demais.
* Não criar funções gigantes.
* Não duplicar lógica.
* Reutilizar funções comuns.
* Manter nomes claros.
* Manter estrutura fácil de entender.
* Não alterar arquitetura sem motivo claro.

---

## 6. Separação de camadas

A arquitetura deve separar:

* Interface
* Estilos
* Interações
* API
* Backend
* Banco de dados
* Arquivos internos
* Automações
* Logs
* Documentação

Fluxo recomendado:

```txt
Frontend
  ↓
API
  ↓
Backend
  ↓
Banco de dados
```

O frontend nunca deve acessar o banco diretamente.

---

## 7. Estrutura base de referência

A estrutura abaixo é apenas uma referência.

A IA deve usar apenas as pastas necessárias para o projeto atual.

```txt
projeto/
  public/
    css/
    js/
    assets/

  api/

  includes/

  cron/

  sql/

  storage/

  logs/

  backups/

  docs/
```

Não criar todas essas pastas automaticamente se o projeto não precisar.

---

## 8. Responsabilidade das pastas

### public

Arquivos acessíveis pelo navegador.

Pode conter:

* HTML
* CSS
* JavaScript
* Imagens públicas
* Assets públicos

Não deve conter:

* Configurações sensíveis
* Senhas
* Backups
* Logs
* Arquivos privados
* Conexão com banco
* Scripts internos

---

### api

Endpoints chamados pelo frontend ou por integrações externas.

Cada endpoint deve:

* Ter uma responsabilidade principal
* Validar entrada
* Executar uma ação clara
* Retornar resposta padronizada
* Não misturar HTML com resposta de API

---

### includes

Arquivos reutilizáveis do backend.

Pode conter funções para:

* Configuração
* Conexão com banco
* Respostas
* Autenticação
* Permissões
* Validação
* Logs
* Uploads
* Filas
* Helpers

Não deve conter telas.

Não deve conter código específico de uma única tela quando esse código não for reutilizável.

---

### cron

Rotinas automáticas executadas pelo servidor.

Pode conter tarefas como:

* Processar fila
* Enviar lembretes
* Limpar registros temporários
* Atualizar status
* Gerar relatórios
* Executar rotinas programadas

Criar esta pasta apenas se houver automações programadas.

---

### sql

Arquivos relacionados ao banco de dados.

Pode conter:

* Schema inicial
* Seeds
* Migrações
* Ajustes de estrutura
* Scripts auxiliares

Criar apenas quando houver necessidade de versionar ou documentar estrutura de banco.

---

### storage

Arquivos enviados ou gerados pelo sistema.

Pode ser dividido em:

```txt
storage/
  publicos/
  privados/
```

Arquivos privados não devem ser acessados diretamente pelo navegador.

Criar apenas se o projeto tiver upload ou geração de arquivos.

---

### logs

Registros técnicos e operacionais.

Não deve ficar acessível publicamente.

Criar apenas se o projeto registrar logs em arquivo.

---

### backups

Cópias de segurança e arquivos relacionados a backup.

Não deve ficar acessível publicamente.

Criar apenas se o projeto tiver rotina local de backup.

---

### docs

Documentação do projeto.

Pode conter:

* Boas práticas
* Decisões técnicas
* Regras do projeto
* Fluxos
* Guias para IA de coding

---

## 9. Organização por áreas

Projetos devem ser organizados por áreas funcionais reais.

Exemplos genéricos:

```txt
auth
usuarios
clientes
produtos
pedidos
pagamentos
relatorios
configuracoes
webhooks
```

Esses nomes são exemplos.

A IA deve criar apenas áreas que existam no produto atual.

---

## 10. Padrão de ações por área

Cada área pode ter ações como:

```txt
criar
listar
detalhe
atualizar
excluir
```

Criar apenas as ações necessárias.

Exemplo genérico:

```txt
api/
  usuarios/
    criar.php
    listar.php
    detalhe.php
    atualizar.php
```

Não criar arquivos vazios para ações futuras.

---

## 11. Padrão de endpoints

Cada endpoint deve ter responsabilidade única.

Preferir:

```txt
api/usuarios/criar.php
api/usuarios/listar.php
api/pagamentos/atualizar.php
```

Evitar:

```txt
api/acao.php
api/faz-tudo.php
api/sistema.php
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

## 12. Padrão de comunicação

Toda comunicação entre frontend e backend deve ser padronizada.

Formato de sucesso:

```json
{
  "ok": true,
  "data": {}
}
```

Formato de erro:

```json
{
  "ok": false,
  "error": "Mensagem de erro."
}
```

Regras:

* Não retornar texto solto.
* Não retornar HTML em API.
* Não misturar formatos de resposta.
* Manter padrão único no projeto.

---

## 13. Regras para frontend

Frontend deve cuidar de:

* Estrutura visual
* Estilo
* Interação
* Chamada de API
* Exibição de dados

Frontend não deve cuidar de:

* Permissão real
* Regra crítica
* Acesso direto ao banco
* Segredos
* Processamento sensível

---

## 14. Regras para backend

Backend deve cuidar de:

* Validação
* Autenticação
* Permissão
* Regras de negócio
* Acesso ao banco
* Logs
* Processamento de dados
* Integrações
* Automações

Backend não deve misturar:

* Tela com API
* Regra de negócio com CSS
* SQL espalhado sem padrão
* Resposta HTML em endpoint de API

---

## 15. Regras para banco de dados

O banco deve ser organizado por entidades claras.

Boas práticas:

* Usar nomes consistentes.
* Usar chave primária.
* Usar relacionamentos quando fizer sentido.
* Usar índices em campos consultados com frequência.
* Evitar duplicação desnecessária.
* Evitar campos sem finalidade clara.
* Usar campos de controle quando necessário.

Campos comuns:

```txt
id
status
created_at
updated_at
deleted_at
```

Criar apenas tabelas necessárias para as funcionalidades reais.

---

## 16. Regras para automações

Automações devem ser separadas do fluxo principal.

Tipos comuns:

* Cron
* Webhook
* Fila
* Rotina manual protegida

Fluxo recomendado:

```txt
Evento
  ↓
Registro
  ↓
Fila ou rotina
  ↓
Processamento
  ↓
Log
```

Não criar automações se a funcionalidade não exigir.

---

## 17. Regras para webhooks

Webhooks devem ficar em área própria quando existirem.

Exemplo:

```txt
api/webhooks/
```

Boas práticas:

* Um arquivo por webhook.
* Uma responsabilidade por webhook.
* Validar entrada.
* Registrar recebimento.
* Processar com segurança.
* Retornar resposta padronizada.

Não criar pasta de webhooks se o projeto não tiver integração externa.

---

## 18. Regras para uploads

Uploads devem ficar fora da lógica principal.

Boas práticas:

* Separar uploads públicos e privados.
* Não misturar upload com tela.
* Centralizar validação de upload.
* Centralizar salvamento de arquivo.
* Usar pasta própria para arquivos enviados.
* Não deixar arquivos privados públicos.

Não criar estrutura de upload se o projeto não tiver envio de arquivos.

---

## 19. Regras para logs

Logs devem registrar ações importantes.

Boas práticas:

* Centralizar função de log.
* Registrar ações críticas.
* Registrar erros relevantes.
* Separar log técnico de log de negócio.
* Não deixar logs acessíveis publicamente.

Não criar sistema de log complexo se o projeto só precisa de logs simples.

---

## 20. Regras para configuração

Configurações devem ficar separadas do código público.

Boas práticas:

* Não deixar configuração sensível em pasta pública.
* Criar arquivo de exemplo quando necessário.
* Separar configuração real de configuração modelo.
* Não versionar senhas reais.
* Não espalhar configurações em vários arquivos sem necessidade.

Exemplo:

```txt
config.example.php
```

---

## 21. Regras para dependências

Dependências devem ser evitadas quando não forem necessárias.

Antes de adicionar dependência, verificar:

* Resolve um problema real?
* Reduz complexidade?
* Não quebra a arquitetura?
* Não cria acoplamento desnecessário?
* Foi aprovada?

Se a resposta for não, não adicionar.

---

## 22. Regras para IA de coding

Antes de alterar o projeto, a IA deve:

* Ler os documentos de boas práticas.
* Identificar a área correta da alteração.
* Verificar o mockup aprovado, quando houver.
* Verificar a descrição do produto, quando houver.
* Criar apenas o que foi solicitado.
* Seguir a estrutura existente.
* Evitar criar padrão novo sem necessidade.
* Evitar criar arquivo desnecessário.
* Manter separação de responsabilidades.
* Não alterar arquitetura sem autorização.
* Não misturar camadas.
* Não criar endpoints genéricos.
* Não criar funções gigantes.
* Não duplicar lógica.
* Explicar qualquer decisão arquitetural relevante.

---

## 23. Ordem correta para criação de projeto com IA

Quando a IA for criar um projeto a partir de mockup e requisitos, seguir esta ordem:

1. Ler os documentos de boas práticas.
2. Ler a descrição do produto.
3. Analisar o mockup.
4. Listar somente as telas identificadas.
5. Listar somente as funcionalidades evidentes.
6. Propor estrutura mínima de arquivos.
7. Criar apenas os arquivos necessários.
8. Implementar tela por tela.
9. Implementar endpoint por endpoint.
10. Revisar segurança, sintaxe e arquitetura.

Não criar estrutura completa antes de entender o escopo real.

---

## 24. Checklist de arquitetura

Antes de finalizar uma alteração, revisar:

* [ ] A alteração ficou na pasta correta?
* [ ] A responsabilidade do arquivo está clara?
* [ ] O endpoint executa apenas uma ação principal?
* [ ] O frontend continua separado do backend?
* [ ] O banco continua acessado apenas pelo backend?
* [ ] As funções reutilizáveis ficaram centralizadas?
* [ ] Não foi criada dependência desnecessária?
* [ ] Não foi criado arquivo genérico demais?
* [ ] Não foi misturada regra de negócio com interface?
* [ ] Não foi alterada a arquitetura sem autorização?
* [ ] A estrutura continua simples?
* [ ] O projeto não ganhou telas extras?
* [ ] O projeto não ganhou módulos extras?
* [ ] O projeto não ganhou tabelas extras?
* [ ] O projeto não ganhou endpoints extras?
* [ ] Outro desenvolvedor conseguiria entender rapidamente?
