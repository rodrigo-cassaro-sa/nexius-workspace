# Boas Práticas de Notificações

Este documento define boas práticas para criação de notificações e mensagens multicanal em projetos criados ou alterados por IA de coding.

O objetivo é orientar o uso de notificações internas, notificações do navegador, push notification, e-mail, SMS e WhatsApp de forma simples, segura, útil e sem incomodar o usuário.

---

## 1. Escopo deste documento

Este documento cuida apenas de notificações e mensagens.

Ele não define:

* Telas obrigatórias do sistema
* Design visual completo
* Schema final do banco
* Regras de negócio específicas
* Campanhas obrigatórias
* Automações obrigatórias
* Mensagens finais de cada projeto
* Provedores obrigatórios de envio

As notificações devem existir apenas quando forem necessárias para o produto, requisito, mockup ou tarefa solicitada.

A IA não deve criar notificações sem finalidade real.

---

## 2. Regra de criação mínima

A IA deve criar apenas o tipo de notificação necessário para o projeto atual.

Não criar:

* Push notification sem requisito
* Service Worker sem necessidade
* Envio de e-mail sem necessidade
* Envio de SMS sem necessidade
* Envio de WhatsApp sem necessidade
* Tabela de inscrição push sem necessidade
* Fila multicanal sem necessidade
* Campanha automática sem solicitação
* Notificação para toda ação pequena
* Permissão de notificação antes de explicar ao usuário
* Notificação repetida
* Notificação invasiva
* Sistema completo de campanhas sem necessidade
* Integração externa sem requisito

Notificação deve resolver um problema real de comunicação.

---

## 3. Tipos de notificação

Existem tipos diferentes de notificação.

```txt
interna
navegador
push
email
sms
whatsapp
```

Criar apenas os tipos necessários para o projeto atual.

---

## 4. Stack oficial

A stack oficial continua sendo:

```txt
HTML
CSS
JavaScript puro
PHP procedural
MySQL
APIs JSON
```

Para push real, pode ser necessário usar também:

```txt
Service Worker
Notifications API
Push API
VAPID keys
HTTPS
```

Para e-mail, SMS e WhatsApp, pode ser necessário usar:

```txt
Provedor externo aprovado
API do provedor
Fila de envio
Configuração protegida no backend
```

Não usar serviço externo de notificação sem aprovação.

---

## 5. Notificação interna

Notificação interna aparece dentro do próprio sistema enquanto o usuário está usando a tela.

Exemplos:

```txt
Salvo com sucesso.
Não foi possível salvar.
Você está offline.
Sincronização concluída.
Novo aviso disponível.
```

Usar para:

* Feedback imediato
* Mensagem de sucesso
* Mensagem de erro
* Aviso dentro da tela
* Status de carregamento
* Status de sincronização
* Aviso de permissão negada
* Informação simples ao usuário

Boas práticas:

* Mensagem curta.
* Linguagem simples.
* Não usar texto técnico.
* Não mostrar erro interno.
* Não exagerar na quantidade.
* Remover automaticamente quando fizer sentido.
* Permitir fechar quando a mensagem for persistente.
* Usar componente visual reutilizável.

---

## 6. Notificação do navegador

Notificação do navegador aparece como notificação do sistema operacional, dependendo da permissão do usuário e do suporte do navegador.

Usar quando o aviso precisa chamar atenção fora da área principal do sistema.

Exemplos:

* Lembrete de aula
* Lembrete de evento
* Nova mensagem importante
* Confirmação de agendamento
* Aviso operacional importante
* Sincronização concluída em segundo plano

Boas práticas:

* Pedir permissão somente quando houver motivo claro.
* Explicar antes por que a notificação é útil.
* Não pedir permissão logo ao abrir o sistema.
* Não usar para mensagens irrelevantes.
* Não enviar notificações repetidas.
* Permitir o usuário desativar.

---

## 7. Push notification real

Push notification real pode chegar mesmo quando o sistema não está aberto, dependendo do navegador, dispositivo, permissões e instalação do app web.

Usar apenas quando o projeto precisar avisar o usuário fora do sistema.

Exemplos:

* Lembrete importante
* Aviso de aula
* Aviso de evento
* Nova tarefa relevante
* Mensagem importante
* Alteração crítica de status
* Confirmação de processo concluído

Não usar push real para:

* Pequeno feedback de tela
* Mensagem sem urgência
* Toda atualização pequena
* Erro técnico comum
* Aviso que pode aparecer só dentro do sistema

Push real deve ser tratado como recurso especial.

---

## 8. Requisitos para push real

Push real normalmente exige:

```txt
HTTPS
Service Worker
Permissão do usuário
Inscrição push no navegador
Backend para salvar inscrição
Backend para disparar notificação
Chaves VAPID
Tabela de inscrições
Controle de ativo/inativo
```

A IA não deve criar push real se o projeto não exigir.

---

## 9. E-mail

E-mail deve ser usado para comunicações mais completas, formais ou que precisam de histórico.

Usar e-mail para:

* Confirmação de cadastro
* Recuperação de senha
* Avisos importantes
* Recibos
* Comprovantes
* Relatórios
* Comunicação formal
* Resumos periódicos

Boas práticas:

* Enviar pelo backend.
* Nunca enviar direto pelo frontend.
* Usar fila quando o envio puder demorar.
* Registrar envio e erro.
* Não expor credenciais SMTP no frontend.
* Não enviar senha por e-mail.
* Não enviar dados sensíveis sem necessidade.
* Usar assunto claro.
* Usar mensagem objetiva.
* Evitar spam.
* Permitir descadastro quando for comunicação promocional.
* Separar e-mail operacional de e-mail promocional.

---

## 10. SMS

SMS deve ser usado apenas para mensagens curtas e importantes.

Usar SMS para:

* Código de verificação
* Lembrete importante
* Confirmação crítica
* Aviso urgente
* Comunicação quando internet ou app não forem confiáveis

Evitar SMS para:

* Mensagens longas
* Promoções frequentes
* Conteúdo detalhado
* Informações sensíveis
* Mensagens que podem ser enviadas por canal mais barato

Boas práticas:

* Enviar pelo backend.
* Usar provedor externo aprovado.
* Guardar chave do provedor apenas no backend.
* Registrar envio e erro.
* Controlar tentativas.
* Evitar envio duplicado.
* Validar número de telefone.
* Respeitar consentimento do usuário.
* Manter mensagem curta e clara.

---

## 11. WhatsApp

WhatsApp deve ser usado para mensagens importantes, lembretes, relacionamento e comunicação operacional.

Usar WhatsApp para:

* Lembrete de aula
* Lembrete de evento
* Confirmação de inscrição
* Aviso importante
* Mensagem de acompanhamento
* Comunicação com lead ou aluno
* Atualização operacional relevante
* Atendimento ou pós-atendimento, quando solicitado

Boas práticas:

* Enviar pelo backend.
* Usar API ou provedor aprovado.
* Não colocar token do WhatsApp no frontend.
* Registrar envio e erro.
* Controlar tentativas.
* Evitar mensagens duplicadas.
* Respeitar consentimento do usuário.
* Respeitar regras do provedor utilizado.
* Usar templates quando o provedor exigir.
* Não enviar spam.
* Não enviar mensagens fora de contexto.
* Permitir controle de opt-in e opt-out quando necessário.
* Separar mensagem operacional de mensagem promocional.

---

## 12. Escolha do canal

A escolha do canal deve seguir a importância, urgência e contexto da mensagem.

Referência:

```txt
notificacao interna → feedback dentro do sistema
push → aviso rápido fora da tela
email → comunicação formal ou detalhada
sms → aviso curto e urgente
whatsapp → relacionamento, lembrete e comunicação direta
```

Exemplos:

```txt
Salvo com sucesso → interna
Aula hoje → push ou WhatsApp
Recibo de pagamento → e-mail
Código de verificação → SMS
Aviso de evento → WhatsApp ou push
Relatório mensal → e-mail
Falha ao sincronizar → interna
```

Não enviar a mesma mensagem por todos os canais sem regra clara.

---

## 13. Canal preferencial do usuário

Quando o projeto tiver mais de um canal, pode existir preferência por usuário.

Exemplo de campos:

```txt
usuario_id
recebe_email
recebe_sms
recebe_whatsapp
recebe_push
canal_preferencial
```

Criar preferências apenas se o projeto precisar.

Não criar central de preferências complexa sem requisito.

---

## 14. Consentimento e opt-out

Mensagens externas exigem cuidado maior.

Boas práticas:

* Respeitar consentimento do usuário.
* Não enviar mensagens sem finalidade clara.
* Não enviar spam.
* Não repetir a mesma mensagem em vários canais sem necessidade.
* Permitir desativar categorias quando fizer sentido.
* Separar comunicação operacional de comunicação promocional.
* Registrar preferências quando necessário.
* Respeitar opt-out quando existir.

A IA não deve criar disparos automáticos sem regra clara de consentimento.

---

## 15. Prioridade da notificação

Toda notificação deve ter prioridade clara.

Prioridades de referência:

```txt
baixa
normal
alta
critica
```

### Baixa

Pode aparecer dentro do sistema.

### Normal

Pode aparecer na central de notificações.

### Alta

Pode justificar notificação do navegador, push ou WhatsApp.

### Crítica

Pode justificar SMS, push ou WhatsApp, desde que o usuário tenha permitido e o projeto exija.

Não usar prioridade alta ou crítica sem necessidade real.

---

## 16. Conteúdo da notificação

Notificação deve ser curta, clara e útil.

Estrutura recomendada:

```txt
titulo
mensagem
link
acao
```

Exemplo:

```txt
Aula hoje às 20:40
Sua aula começa hoje. Chegue com 10 minutos de antecedência.
```

Evitar:

* Texto longo
* Termos técnicos
* Mensagem alarmista sem motivo
* Informação sensível
* Dados pessoais desnecessários
* Promessa que depende de confirmação futura

---

## 17. Segurança do conteúdo

Não colocar em notificação:

* Senhas
* Tokens
* Dados financeiros sensíveis
* Informações privadas desnecessárias
* Dados médicos sensíveis
* Conteúdo que exponha outro usuário
* Links inseguros
* Detalhes técnicos de erro

Se a informação for sensível, a notificação deve ser genérica.

Exemplo:

```txt
Você tem uma nova atualização importante.
Abra o sistema para ver os detalhes.
```

---

## 18. Responsabilidade do frontend

O frontend pode cuidar de:

* Mostrar notificações internas
* Pedir permissão de notificação
* Registrar Service Worker quando necessário
* Criar inscrição push
* Enviar inscrição push para o backend
* Mostrar status da permissão
* Permitir ativar ou desativar notificações
* Exibir mensagens amigáveis
* Controlar preferências locais simples

O frontend não deve:

* Guardar chave privada
* Guardar token de provedor externo
* Decidir sozinho quem deve receber push
* Expor segredos
* Enviar push diretamente
* Enviar e-mail diretamente
* Enviar SMS diretamente
* Enviar WhatsApp diretamente
* Substituir permissão real do backend
* Criar notificação sem consentimento quando exigir permissão

---

## 19. Responsabilidade do backend

O backend deve cuidar de:

* Receber inscrição push
* Salvar inscrição push
* Atualizar inscrição push
* Desativar inscrição inválida
* Validar usuário logado
* Validar permissão
* Registrar envio
* Evitar envio duplicado
* Controlar quem recebe notificação
* Disparar notificações quando necessário
* Processar fila de notificações
* Integrar com provedores de e-mail, SMS e WhatsApp
* Guardar tokens e chaves em configuração protegida

O backend não deve:

* Enviar notificação sem regra clara
* Enviar para usuário sem permissão válida
* Expor chave privada
* Expor token de provedor
* Ignorar falhas de envio
* Repetir notificações sem controle

---

## 20. Provedores externos

Serviços de e-mail, SMS e WhatsApp devem ser tratados como integrações externas.

Boas práticas:

* Chaves e tokens ficam apenas no backend.
* Nunca expor segredo no frontend.
* Criar configuração protegida.
* Registrar envio.
* Registrar falha.
* Criar fila quando houver risco de falha.
* Reprocessar com limite de tentativas.
* Não travar a ação principal por causa do envio.
* Ter fallback quando fizer sentido.
* Respeitar regras do provedor utilizado.

Exemplo de fallback:

```txt
Se WhatsApp falhar, manter aviso interno pendente.
Se SMS falhar, registrar erro e permitir nova tentativa.
Se e-mail falhar, colocar na fila para reenvio.
```

---

## 21. Tabela de inscrições push

Criar tabela de inscrições push apenas se o projeto usar push real.

Estrutura de referência:

```txt
inscricoes_push
  id
  usuario_id
  endpoint
  chave_p256dh
  chave_auth
  user_agent
  dispositivo
  ativo
  criado_em
  atualizado_em
  ultimo_envio_em
```

Criar apenas os campos necessários.

Não criar essa tabela se o projeto usar apenas notificação interna, e-mail, SMS ou WhatsApp.

---

## 22. Tabela de notificações

Criar tabela de notificações apenas se o projeto precisar guardar histórico, caixa de notificações ou controle de leitura.

Estrutura de referência:

```txt
notificacoes
  id
  usuario_id
  tipo
  canal
  titulo
  mensagem
  link
  prioridade
  lida
  enviada
  criado_em
  lida_em
```

Criar apenas se houver necessidade real.

---

## 23. Fila multicanal de notificações

Quando o projeto usar vários canais, pode existir uma fila única de notificações.

Estrutura de referência:

```txt
fila_notificacoes
  id
  usuario_id
  canal
  tipo
  destino
  titulo
  mensagem
  template
  payload
  status
  tentativas
  erro
  criado_em
  agendado_para
  enviado_em
```

Canais possíveis:

```txt
interna
push
email
sms
whatsapp
```

Status possíveis:

```txt
pendente
processando
enviada
erro
cancelada
```

Criar fila multicanal apenas se o projeto precisar.

Para projeto simples, criar apenas o canal necessário.

---

## 24. Fila de e-mail

Criar fila de e-mail apenas se o projeto precisar enviar e-mails de forma assíncrona ou com controle de falha.

Campos de referência:

```txt
id
usuario_id
email_destino
assunto
mensagem
template
payload
status
tentativas
erro
criado_em
enviado_em
```

Não criar fila de e-mail se o projeto não usar e-mail.

---

## 25. Fila de SMS

Criar fila de SMS apenas se o projeto precisar enviar SMS.

Campos de referência:

```txt
id
usuario_id
telefone
mensagem
status
tentativas
erro
criado_em
enviado_em
```

Não criar fila de SMS se o projeto não usar SMS.

---

## 26. Fila de WhatsApp

Criar fila de WhatsApp apenas se o projeto precisar enviar WhatsApp.

Campos de referência:

```txt
id
usuario_id
telefone
tipo
mensagem
template
payload
status
tentativas
erro
criado_em
enviado_em
```

Não criar fila de WhatsApp se o projeto não usar WhatsApp.

---

## 27. Endpoints de notificação

Criar endpoints apenas conforme necessidade real.

Exemplos genéricos:

```txt
api/notificacoes/listar.php
api/notificacoes/marcar-lida.php
api/notificacoes/preferencias.php
api/notificacoes/salvar-inscricao-push.php
api/notificacoes/remover-inscricao-push.php
api/notificacoes/enviar-teste.php
```

Não criar todos automaticamente.

Criar apenas os endpoints solicitados ou necessários para o fluxo real.

---

## 28. Service Worker

Service Worker deve ser criado apenas quando houver necessidade de push real, PWA ou cache offline.

Boas práticas:

* Criar arquivo separado.
* Manter código simples.
* Não guardar segredo.
* Não colocar regra de negócio sensível.
* Não substituir validação do backend.
* Não cachear dados privados sem regra clara.
* Usar apenas para o que for necessário.

Arquivo de referência:

```txt
public/service-worker.js
```

Não criar Service Worker se o projeto usar apenas notificação interna, e-mail, SMS ou WhatsApp.

---

## 29. Chaves VAPID

Push real pode exigir chaves VAPID.

Boas práticas:

* Chave pública pode ir para o frontend.
* Chave privada deve ficar apenas no backend.
* Não versionar chave privada real.
* Não colocar chave privada no JavaScript.
* Não colocar chave privada em HTML.
* Não expor chave privada em resposta de API.
* Guardar chave privada em configuração protegida.

Referência:

```txt
VAPID_PUBLIC_KEY  → pode ser usada no frontend
VAPID_PRIVATE_KEY → somente backend
```

---

## 30. Envio de notificação

O envio deve ser controlado.

Antes de enviar, validar:

* Usuário existe?
* Usuário pode receber?
* Usuário ativou esse canal?
* O destino é válido?
* A notificação é necessária?
* A mensagem está correta?
* Já foi enviada recentemente?
* Existe risco de duplicidade?
* Existe consentimento quando necessário?

Não enviar notificação sem validação.

---

## 31. Evitar duplicidade

Notificações não devem ser duplicadas sem motivo.

Boas práticas:

* Usar identificador do evento quando houver.
* Registrar envio.
* Verificar se já foi enviada.
* Evitar reenviar a mesma mensagem em loop.
* Controlar tentativas.
* Cancelar inscrição inválida quando necessário.

Campos úteis:

```txt
evento_id
tipo
canal
usuario_id
enviada_em
```

---

## 32. Notificações agendadas

Criar agendamento apenas se o projeto precisar.

Exemplos:

* Lembrete antes de aula
* Lembrete antes de evento
* Cobrança programada
* Aviso em data específica
* Resumo diário
* Resumo semanal

Boas práticas:

* Guardar data e hora de envio.
* Respeitar status do usuário.
* Não enviar se o evento foi cancelado.
* Não enviar duplicado.
* Registrar envio.
* Permitir cancelamento quando necessário.
* Usar fila quando houver muitos envios.

---

## 33. Templates de mensagem

Templates devem ser usados quando houver mensagens repetitivas ou quando o provedor exigir.

Exemplos:

```txt
confirmacao_cadastro
recuperacao_senha
lembrete_aula
lembrete_evento
confirmacao_pagamento
aviso_importante
```

Boas práticas:

* Não criar template sem uso real.
* Usar nomes claros.
* Separar variáveis do texto fixo.
* Validar variáveis antes do envio.
* Não colocar dados sensíveis no template sem necessidade.
* Manter mensagem curta e objetiva.

Exemplo de variáveis:

```txt
{{nome}}
{{data}}
{{horario}}
{{link}}
```

---

## 34. Notificações e offline

Offline e notificações são recursos diferentes.

Offline cuida de:

```txt
dados locais
fila local
sincronização
consulta sem internet
```

Notificações cuidam de:

```txt
avisos
lembretes
mensagens
alertas
push
email
sms
whatsapp
```

Quando houver offline, notificações podem avisar:

```txt
Você está offline.
Salvo no dispositivo.
Será enviado quando a internet voltar.
Sincronização concluída.
Falha ao sincronizar.
```

Para regras offline completas, seguir:

```txt
boas-praticas-offline.md
```

---

## 35. Notificações internas de sistema

Toda notificação interna deve ter padrão visual consistente.

Tipos comuns:

```txt
sucesso
erro
aviso
informacao
carregando
```

Mensagens comuns:

```txt
Salvo com sucesso.
Não foi possível salvar.
Verifique os campos obrigatórios.
Você está offline.
Sincronização concluída.
```

Boas práticas:

* Usar componente reutilizável.
* Não criar alertas visuais diferentes em cada tela.
* Não usar `alert()` do navegador sem necessidade.
* Não bloquear a tela para mensagens simples.
* Usar modal apenas quando a ação exigir atenção.

---

## 36. Frequência e anti-spam

Notificações devem respeitar o usuário.

Boas práticas:

* Não enviar muitas notificações em sequência.
* Agrupar notificações semelhantes.
* Evitar repetir a mesma mensagem.
* Evitar notificar ações pequenas.
* Evitar notificações fora de contexto.
* Permitir desativar categorias quando fizer sentido.
* Não usar push, e-mail, SMS ou WhatsApp para spam.
* Evitar enviar a mesma mensagem em vários canais sem necessidade.

---

## 37. Central de notificações

Criar central de notificações apenas se o projeto precisar de histórico.

Pode conter:

* Lista de notificações
* Status lida/não lida
* Filtro por tipo
* Filtro por canal
* Link para detalhe
* Marcar como lida
* Marcar todas como lidas

Não criar central de notificações se bastar aviso simples na tela.

---

## 38. Leitura e status

Se houver histórico, controlar status.

Campos úteis:

```txt
lida
lida_em
arquivada
status
```

Status possíveis:

```txt
nao_lida
lida
arquivada
cancelada
```

Criar apenas se fizer sentido para o projeto.

---

## 39. Links em notificações

Notificações podem ter link de destino.

Boas práticas:

* Link deve levar para tela segura.
* Backend deve validar permissão ao abrir.
* Não confiar no link para liberar acesso.
* Não colocar dados sensíveis na URL.
* Usar link simples e previsível.

Exemplo:

```txt
/public/avisos/detalhe.html?id=10
```

A permissão real deve ser validada no backend.

---

## 40. Logs de notificação

Registrar logs quando houver envio importante.

Registrar quando fizer sentido:

* Notificação criada
* Push enviado
* E-mail enviado
* SMS enviado
* WhatsApp enviado
* Envio com erro
* Inscrição push criada
* Inscrição push removida
* Preferência alterada
* Notificação lida

Não registrar dados sensíveis sem necessidade.

---

## 41. Falhas de envio

Quando o envio falhar:

* Registrar erro.
* Incrementar tentativa.
* Desativar inscrição inválida quando necessário.
* Não repetir infinitamente.
* Não mostrar erro técnico para o usuário final.
* Permitir reprocessamento quando fizer sentido.
* Não marcar como enviado se falhou.

---

## 42. Compatibilidade

A IA deve considerar que nem todo navegador, dispositivo ou canal funciona da mesma forma.

Boas práticas:

* Verificar suporte antes de usar push.
* Criar fallback para notificação interna.
* Não depender exclusivamente de push.
* Não bloquear funcionalidade principal por falta de permissão.
* Não assumir que todos os usuários receberão push.
* Não assumir que e-mail, SMS ou WhatsApp serão entregues imediatamente.

Fallback recomendado:

```txt
Se push não estiver disponível, mostrar aviso dentro do sistema.
Se WhatsApp falhar, manter notificação interna.
Se e-mail falhar, registrar erro e reprocessar.
```

---

## 43. Acessibilidade

Notificações devem ser acessíveis.

Boas práticas:

* Não depender apenas de cor.
* Usar texto claro.
* Evitar animações exageradas.
* Permitir fechar mensagens persistentes.
* Não esconder informação importante rápido demais.
* Manter contraste adequado.
* Usar componentes consistentes.

---

## 44. O que a IA não deve fazer

A IA não deve:

* Criar notificação sem requisito.
* Criar push real sem necessidade.
* Criar Service Worker sem motivo.
* Criar tabela de push sem uso real.
* Criar envio por e-mail sem requisito.
* Criar envio por SMS sem requisito.
* Criar envio por WhatsApp sem requisito.
* Criar integração externa sem aprovação.
* Pedir permissão ao usuário sem explicar.
* Enviar notificação sem consentimento quando exigir permissão.
* Colocar chave privada no frontend.
* Colocar token de provedor no frontend.
* Salvar segredo no navegador.
* Enviar dados sensíveis em push, SMS, e-mail ou WhatsApp.
* Criar spam de notificações.
* Criar notificações duplicadas.
* Enviar mensagem por todos os canais sem regra.
* Criar central de notificações sem necessidade.
* Criar fila multicanal sem necessidade.
* Criar campanha automática sem requisito.
* Usar notificação para esconder erro de sistema.
* Bloquear o sistema se o usuário negar permissão.
* Tratar falha de envio como sucesso.

---

## 45. Ordem recomendada para criar notificações com IA

Ao criar notificações, seguir esta ordem:

1. Ler os documentos de boas práticas.
2. Ler a descrição do produto.
3. Identificar se notificação é realmente necessária.
4. Identificar o tipo de notificação.
5. Verificar se basta notificação interna.
6. Verificar se precisa notificação do navegador.
7. Verificar se precisa push real.
8. Verificar se precisa e-mail.
9. Verificar se precisa SMS.
10. Verificar se precisa WhatsApp.
11. Definir eventos que geram notificação.
12. Definir quem recebe.
13. Definir canal.
14. Definir mensagem.
15. Definir prioridade.
16. Definir consentimento necessário.
17. Definir se precisa histórico.
18. Definir se precisa fila.
19. Definir se precisa Service Worker.
20. Criar apenas estrutura necessária.
21. Revisar segurança, backend, frontend e banco.

---

## 46. Checklist de notificações

Antes de finalizar qualquer recurso de notificação, revisar:

* [ ] A notificação foi solicitada ou é necessária?
* [ ] Foi escolhido o tipo correto de notificação?
* [ ] Não foi criado push real sem necessidade?
* [ ] Não foi criado Service Worker sem necessidade?
* [ ] Não foi criado envio de e-mail sem requisito?
* [ ] Não foi criado envio de SMS sem requisito?
* [ ] Não foi criado envio de WhatsApp sem requisito?
* [ ] O usuário entende por que receberá notificação?
* [ ] Existe consentimento quando necessário?
* [ ] Existe opção de desativar quando fizer sentido?
* [ ] A mensagem é curta e clara?
* [ ] A mensagem não contém dado sensível?
* [ ] A notificação não duplica envio?
* [ ] A frequência é aceitável?
* [ ] O backend valida quem pode receber?
* [ ] A chave privada não está no frontend?
* [ ] Tokens de provedores não estão no frontend?
* [ ] Existe fallback se push não funcionar?
* [ ] Logs foram criados quando necessário?
* [ ] Fila foi criada apenas se necessária?
* [ ] Central de notificações foi criada apenas se necessária?
* [ ] E-mail, SMS e WhatsApp passam pelo backend?
* [ ] Falhas de envio não são tratadas como sucesso?
* [ ] O recurso continua simples e fácil de manter?
