# Boas Práticas de Offline

Este documento define boas práticas para funcionamento offline em projetos criados ou alterados por IA de coding.

O objetivo é orientar a criação de recursos offline, cache local, fila local, sincronização, reenvio, conflitos e consulta de dados locais de forma simples, segura e previsível.

---

## 1. Escopo deste documento

Este documento cuida apenas de funcionamento offline.

Ele não define:

* Telas do sistema
* Design visual
* Schema final do banco
* Regras de negócio específicas
* Funcionalidades obrigatórias
* Endpoints finais do projeto
* Permissões finais do sistema

O funcionamento offline deve ser criado apenas quando o projeto, requisito, mockup ou tarefa solicitar.

A IA não deve criar protocolo offline sem necessidade real.

---

## 2. Regra de criação mínima

A IA deve criar apenas o necessário para o offline solicitado.

Não criar:

* Sincronização completa sem requisito
* Cache local para todos os dados
* Fila local sem necessidade
* Service Worker sem necessidade
* PWA sem solicitação
* Endpoints de sync sem requisito
* Estrutura de conflito sem uso real
* Tabelas extras sem necessidade
* Dados locais sensíveis sem necessidade
* Download automático de dados demais

Offline deve ser implementado por partes, conforme necessidade real do projeto.

---

## 3. Stack oficial para offline

O offline deve usar recursos nativos do navegador sempre que possível.

Stack recomendada:

```txt
HTML
CSS
JavaScript puro
IndexedDB
PHP procedural
MySQL
APIs JSON
```

Pode usar, se o projeto exigir:

```txt
Service Worker
Cache API
Manifest PWA
```

Não usar bibliotecas externas de offline sem aprovação.

---

## 4. Objetivo do offline

Offline pode atender três necessidades principais:

```txt
1. Consultar dados já baixados
2. Criar ou editar dados localmente
3. Enviar dados depois quando a internet voltar
```

A IA deve identificar qual tipo de offline o projeto precisa antes de implementar.

Não assumir que todo projeto precisa dos três tipos.

---

## 5. Tipos de offline

### Consulta offline

Permite visualizar dados já baixados.

Exemplos:

* Lista já carregada
* Perfil já baixado
* Materiais já sincronizados
* Histórico local
* Dados de apoio

### Escrita offline

Permite criar ou alterar dados sem internet.

Exemplos:

* Rascunho
* Checklist
* Presença
* Anotação
* Formulário simples

### Sincronização offline

Permite enviar ações locais ao servidor quando a internet voltar.

Exemplos:

* Criar registro
* Atualizar registro
* Enviar formulário
* Confirmar ação pendente

---

## 6. Operações permitidas offline

Nem toda ação deve funcionar offline.

### Pode funcionar offline quando o projeto permitir

* Rascunhos
* Anotações
* Checklists
* Formulários simples
* Presenças locais
* Dados de consulta já baixados
* Ações que podem ser sincronizadas depois

### Deve exigir internet

* Login inicial
* Pagamento
* Alteração de senha
* Alteração de permissão
* Exclusão sensível
* Consulta de dado não baixado
* Ação que depende de validação externa
* Ação que exige confirmação imediata do servidor

A regra final depende do projeto.

---

## 7. Responsabilidade do frontend no offline

O frontend pode cuidar de:

* Detectar se há internet
* Mostrar estado online ou offline
* Salvar dados locais
* Salvar ações pendentes
* Consultar dados locais
* Enviar ações quando a internet voltar
* Mostrar status de sincronização
* Mostrar erro ou conflito
* Limpar dados locais quando necessário

O frontend não deve:

* Ignorar permissão do backend
* Salvar senha localmente
* Salvar segredo localmente
* Tratar dado local como confirmado pelo servidor
* Criar duplicidade ao reenviar ações
* Manter dados sensíveis sem necessidade

---

## 8. Responsabilidade do backend no offline

O backend deve estar preparado para:

* Receber ações atrasadas
* Validar autenticação
* Validar permissão
* Validar dados
* Evitar duplicidade
* Registrar sincronização
* Retornar ações aceitas
* Retornar ações rejeitadas
* Retornar conflitos
* Manter integridade do banco

O backend nunca deve confiar que uma ação é válida apenas porque veio da fila local.

---

## 9. Armazenamento local

O armazenamento local recomendado é:

```txt
IndexedDB
```

Usar IndexedDB para:

* Dados estruturados
* Listas
* Cache local
* Fila de ações
* Dados que precisam persistir offline

Usar `localStorage` apenas para:

* Preferências simples
* Configurações visuais simples
* Flags não sensíveis

Não usar `localStorage` para:

* Senhas
* Tokens sensíveis
* Dados privados importantes
* Fila de ações complexas
* Dados grandes

---

## 10. Estrutura local de referência

A estrutura abaixo é apenas uma referência.

Criar apenas o que for necessário.

```txt
IndexedDB
  dados_cache
  fila_acoes
  metadados_sync
```

### dados_cache

Guarda dados baixados para consulta offline.

### fila_acoes

Guarda ações criadas offline ou que falharam no envio.

### metadados_sync

Guarda informações de controle da sincronização.

---

## 11. Fila local de ações

Quando o projeto exigir envio posterior, criar fila local.

Campos de referência:

```txt
id_local
tipo
payload
status
criado_em
atualizado_em
tentativas
erro
```

Status comuns:

```txt
pendente
sincronizando
sincronizado
erro
conflito
cancelado
```

Criar apenas os campos necessários para o projeto.

---

## 12. Identificador local

Toda ação criada offline deve ter identificador local.

Campo recomendado:

```txt
id_local
```

ou:

```txt
uuid_local
```

Regras:

* Criar no dispositivo.
* Enviar ao backend.
* Usar para evitar duplicidade.
* Manter o mesmo identificador em reenvios.
* Não gerar novo identificador para a mesma ação pendente.

---

## 13. Idempotência

Endpoints de sincronização devem ser idempotentes quando houver reenvio.

Idempotência significa que enviar a mesma ação mais de uma vez não deve criar duplicidade.

Boas práticas:

* Receber `id_local` ou `idempotency_key`.
* Verificar se a ação já foi processada.
* Retornar o resultado anterior quando já existir.
* Não criar registro duplicado.
* Registrar tentativa repetida quando necessário.

Campos de referência no servidor:

```txt
id_local
idempotency_key
sincronizado_em
```

Criar apenas quando houver necessidade real de sincronização offline.

---

## 14. Endpoints de sincronização

Criar endpoints de sync apenas se o projeto exigir offline.

Exemplos genéricos:

```txt
api/sync/enviar.php
api/sync/baixar.php
api/sync/status.php
```

Não criar esses endpoints sem requisito.

---

## 15. Envio de ações pendentes

O frontend pode enviar ações pendentes em lote.

Payload genérico:

```json
{
  "acoes": [
    {
      "id_local": "abc-123",
      "tipo": "criar_registro",
      "payload": {},
      "criado_em": "2026-06-18 10:00:00"
    }
  ]
}
```

Resposta recomendada:

```json
{
  "ok": true,
  "data": {
    "processadas": [],
    "rejeitadas": [],
    "conflitos": []
  }
}
```

Regras:

* Enviar apenas ações pendentes.
* Manter ações com erro para nova tentativa.
* Marcar como sincronizado apenas após confirmação do backend.
* Não remover ação local antes de confirmar sucesso.
* Não reenviar ação já sincronizada.

---

## 16. Baixa de dados para consulta offline

Quando o projeto exigir consulta offline, o backend pode fornecer dados para cache local.

Boas práticas:

* Baixar apenas dados necessários.
* Respeitar escopo do usuário.
* Não baixar dados sensíveis sem necessidade.
* Usar paginação quando houver muitos dados.
* Usar sincronização incremental quando possível.
* Usar campo de atualização para baixar apenas mudanças.

Campos úteis:

```txt
atualizado_em
versao
status
```

Exemplo genérico:

```txt
api/sync/baixar.php?desde=2026-06-18 10:00:00
```

Criar apenas se o projeto precisar.

---

## 17. Sincronização incremental

Sempre que possível, evitar baixar tudo novamente.

Boas práticas:

* Guardar data da última sincronização.
* Enviar `desde` para o backend.
* Receber apenas registros alterados.
* Atualizar cache local.
* Remover ou marcar localmente registros excluídos, se o projeto usar exclusão lógica.

Metadados úteis:

```txt
ultima_sincronizacao
ultima_versao
usuario_id
```

---

## 18. Conflitos de sincronização

Conflito acontece quando o dado local e o dado do servidor foram alterados antes da sincronização.

A estratégia de conflito deve vir do projeto.

Estratégias possíveis:

```txt
servidor_vence
cliente_vence
mais_recente_vence
revisao_manual
```

Não inventar estratégia de conflito sem requisito.

Resposta de conflito:

```json
{
  "ok": true,
  "data": {
    "conflitos": [
      {
        "id_local": "abc-123",
        "motivo": "Registro alterado no servidor antes da sincronização."
      }
    ]
  }
}
```

---

## 19. Regras para conflito

Boas práticas:

* Detectar conflito quando possível.
* Retornar conflito de forma clara.
* Não sobrescrever dado sensível sem regra definida.
* Não apagar dado local em conflito automaticamente.
* Permitir revisão quando necessário.
* Registrar conflito no backend quando fizer sentido.

---

## 20. Dados que podem ser cacheados

Podem ser cacheados quando o projeto permitir:

* Dados de apoio
* Listas de referência
* Catálogos
* Configurações públicas
* Dados do próprio usuário
* Conteúdo já autorizado
* Rascunhos
* Dados de tela já carregados

Não cachear sem necessidade:

* Dados sensíveis
* Dados de outros usuários
* Informações financeiras críticas
* Permissões
* Senhas
* Tokens secretos

---

## 21. Segurança no offline

Regras detalhadas de segurança ficam em:

```txt
boas-praticas-seguranca.md
```

Boas práticas específicas:

* Não salvar senha no dispositivo.
* Não salvar segredo no dispositivo.
* Não salvar token sensível em `localStorage`.
* Evitar salvar dados sensíveis localmente.
* Salvar apenas o necessário para a experiência offline.
* Limpar dados locais no logout quando necessário.
* Revalidar tudo no backend ao sincronizar.
* Não permitir que dado offline ignore permissão do backend.

---

## 22. Logout e limpeza local

Ao sair da conta, avaliar se os dados locais devem ser removidos.

Limpar quando houver:

* Dados sensíveis
* Dados privados
* Dados de usuário logado
* Fila pendente de usuário específico
* Cache de informações pessoais

Pode manter quando forem:

* Configurações visuais
* Preferências simples
* Assets públicos
* Dados públicos

A regra depende do projeto.

---

## 23. Status visual de sincronização

A interface deve informar o estado quando fizer sentido.

Estados comuns:

```txt
online
offline
sincronizando
sincronizado
pendente
erro
conflito
```

Boas práticas:

* Mostrar quando há ações pendentes.
* Mostrar quando uma ação foi salva localmente.
* Mostrar quando sincronização concluir.
* Mostrar erro quando não foi possível sincronizar.
* Não prometer que algo foi salvo no servidor antes de confirmação.

---

## 24. Experiência do usuário offline

Boas práticas:

* Avisar quando o usuário estiver offline.
* Permitir continuar ações offline quando permitido.
* Informar que os dados serão enviados depois.
* Diferenciar “salvo no dispositivo” de “salvo no servidor”.
* Não bloquear toda a interface sem necessidade.
* Não esconder erros de sincronização.
* Não perder dados preenchidos em formulário.

Mensagens úteis:

```txt
Você está offline.
Salvo no dispositivo.
Será enviado quando a internet voltar.
Sincronizando...
Sincronizado com sucesso.
Não foi possível sincronizar.
Existe um conflito que precisa de revisão.
```

---

## 25. Reenvio de ações

Quando a internet voltar, o sistema pode reenviar ações pendentes.

Boas práticas:

* Reenviar apenas ações pendentes.
* Controlar número de tentativas.
* Não tentar infinitamente sem limite.
* Manter erro registrado.
* Permitir nova tentativa manual quando necessário.
* Não duplicar registros no servidor.
* Usar idempotência.

Campos úteis:

```txt
tentativas
ultimo_erro
ultima_tentativa_em
```

---

## 26. Processamento em lote

Ações pendentes podem ser enviadas em lote.

Boas práticas:

* Enviar lote pequeno e controlado.
* Evitar enviar muitos dados de uma vez.
* Processar cada ação de forma independente no backend.
* Retornar resultado por ação.
* Não falhar o lote inteiro se apenas uma ação falhar, quando possível.

Resposta por ação:

```json
{
  "id_local": "abc-123",
  "ok": true,
  "servidor_id": 10
}
```

---

## 27. Dados locais e versão

Quando houver cache local, cada registro pode ter metadados.

Campos úteis:

```txt
id_servidor
id_local
atualizado_em
sincronizado_em
versao
status_sync
```

Usar apenas os campos necessários.

---

## 28. Service Worker

Service Worker pode ser usado quando o projeto exigir comportamento mais próximo de PWA.

Pode ser usado para:

* Cache de arquivos estáticos
* Funcionamento básico sem conexão
* Tela carregando mesmo offline
* Estratégias de cache

Não criar Service Worker sem necessidade.

Não usar Service Worker para guardar dados sensíveis.

Não usar Service Worker como substituto da validação do backend.

---

## 29. Cache de arquivos estáticos

Arquivos estáticos podem ser cacheados quando fizer sentido.

Exemplos:

```txt
HTML
CSS
JavaScript
imagens públicas
ícones
fontes
```

Boas práticas:

* Cachear apenas arquivos públicos.
* Atualizar cache quando houver nova versão.
* Não cachear resposta privada sem necessidade.
* Não cachear dados sensíveis.
* Não deixar o usuário preso em versão antiga sem estratégia de atualização.

---

## 30. Dados locais e permissões

Dados baixados devem respeitar o escopo do usuário.

Boas práticas:

* Baixar apenas dados que o usuário pode acessar.
* Revalidar permissões no backend.
* Limpar cache ao trocar de usuário.
* Não misturar dados de usuários diferentes.
* Não confiar em permissão armazenada localmente.
* Não permitir que cache antigo conceda acesso indevido.

---

## 31. Offline e uploads

Uploads offline devem ser tratados com cuidado.

Boas práticas:

* Criar apenas se o projeto exigir.
* Guardar arquivo local apenas quando necessário.
* Validar tipo e tamanho antes de guardar.
* Enviar quando a internet voltar.
* Mostrar status de upload pendente.
* Não perder arquivo antes de confirmar envio.
* Não permitir upload de arquivo perigoso.
* Revalidar upload no backend.

---

## 32. Offline e exclusões

Exclusões offline devem ser evitadas em dados sensíveis.

Boas práticas:

* Preferir marcar para excluir depois.
* Confirmar no backend antes de remover definitivamente.
* Usar exclusão lógica quando fizer sentido.
* Mostrar exclusão pendente.
* Tratar conflito se o registro foi alterado no servidor.
* Não apagar localmente dado importante sem confirmação.

---

## 33. Offline e login

Login inicial deve exigir internet.

Boas práticas:

* Não criar login offline sem requisito específico.
* Não salvar senha para login offline.
* Permitir consulta offline apenas se o usuário já estava autenticado e o projeto permitir.
* Revalidar sessão quando a internet voltar.
* Limpar dados locais quando a sessão expirar, se necessário.

---

## 34. Performance offline

Boas práticas:

* Não baixar dados demais.
* Baixar apenas o necessário.
* Usar sincronização incremental.
* Evitar sincronizar tudo a cada abertura.
* Enviar ações em lote quando fizer sentido.
* Limitar tentativas de reenvio.
* Evitar travar a interface durante sincronização.
* Evitar IndexedDB com dados desnecessários.

---

## 35. O que a IA não deve fazer

A IA não deve:

* Criar offline sem requisito.
* Criar PWA sem solicitação.
* Criar Service Worker sem necessidade.
* Criar IndexedDB para tudo sem critério.
* Salvar senha localmente.
* Salvar segredo localmente.
* Salvar token sensível em `localStorage`.
* Baixar dados sensíveis sem necessidade.
* Criar cache de dados de todos os usuários.
* Criar fila local sem idempotência.
* Criar sincronização que duplica registros.
* Remover dados pendentes antes de confirmar envio.
* Marcar ação como concluída antes do backend confirmar.
* Criar conflito sem resposta clara.
* Ignorar validação no backend ao sincronizar.
* Criar endpoints de sync sem necessidade real.

---

## 36. Ordem recomendada para criar offline com IA

Ao criar funcionalidade offline, seguir esta ordem:

1. Ler os documentos de boas práticas.
2. Ler a descrição do produto.
3. Identificar se offline é realmente necessário.
4. Identificar quais telas precisam offline.
5. Identificar quais dados podem ser consultados offline.
6. Identificar quais ações podem ser feitas offline.
7. Identificar quais ações exigem internet.
8. Definir armazenamento local necessário.
9. Definir fila local, se necessária.
10. Definir endpoints de sincronização, se necessários.
11. Definir regra de idempotência.
12. Definir regra de conflito.
13. Definir limpeza no logout.
14. Implementar o mínimo necessário.
15. Revisar segurança, backend, frontend e banco.

---

## 37. Checklist de offline

Antes de finalizar qualquer funcionalidade offline, revisar:

* [ ] O offline foi solicitado pelo projeto?
* [ ] Foram criados apenas recursos necessários?
* [ ] Os dados locais são realmente necessários?
* [ ] Dados sensíveis foram evitados?
* [ ] Senhas não são salvas localmente?
* [ ] Segredos não são salvos localmente?
* [ ] `localStorage` não guarda token sensível?
* [ ] IndexedDB é usado apenas quando faz sentido?
* [ ] Existe fila local apenas se necessária?
* [ ] A fila local usa `id_local` ou equivalente?
* [ ] O backend evita duplicidade?
* [ ] A sincronização é idempotente quando há reenvio?
* [ ] A interface diferencia salvo localmente de salvo no servidor?
* [ ] A ação só é marcada como sincronizada após confirmação?
* [ ] Conflitos têm resposta clara?
* [ ] Dados locais são limpos no logout quando necessário?
* [ ] Dados são revalidados no backend ao sincronizar?
* [ ] O cache respeita o escopo do usuário?
* [ ] Não foi criado Service Worker sem necessidade?
* [ ] Não foi criada PWA sem solicitação?
