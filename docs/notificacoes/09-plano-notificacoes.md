# Plano de Notificações

Base: `01-descricao-produto.md` (§16), `boas-praticas-notificacoes.md` e `03-mapa-de-telas.md`.

## 1. Objetivo

Manter o usuário informado de eventos relevantes do seu trabalho (atribuições, comentários, mudanças de status e conclusões), sem spam e sem dado sensível.

## 2. Canais do MVP

- **Interna** (dentro do sistema): **implementada** nesta fase (tabela `notificacoes`).
- **E-mail** (SMTP): faz parte do MVP, mas o **envio real (SMTP + cron) ainda não está configurado**. Nesta fase fica o **contrato/template + fila** (`fila_email`) e a pendência registrada.
- **SMS, WhatsApp, push web:** fora do MVP.

## 3. Eventos de disparo

- **Atribuição**: usuário atribuído como responsável de uma demanda ou ação.
- **Novo comentário**: comentário criado em uma ação.
- **Mudança de status da demanda**: status alterado (ex.: aberta → em andamento, arquivada).
- **Conclusão**: ação concluída e demanda concluída (pela ação chave).

## 4. Quem recebe

- **Atribuição**: o responsável atribuído.
- **Novo comentário**: os **observadores da ação** = responsável da ação + criador da demanda + autores de comentários anteriores na ação.
- **Status/Conclusão**: responsável e/ou criador da demanda.
- **Regra geral**: nunca notificar o **autor do próprio evento**; destinatários **deduplicados** por evento.

## 5. Quando recebe

- **Interna**: no momento do evento (síncrono), após a operação ser confirmada no banco.
- **E-mail**: seria **enfileirado** no momento do evento e enviado pelo cron (pendente).

## 6. Preferências

- **Sem preferências/opt-out no MVP** (e-mails são operacionais). A única preferência do sistema é o tema (não relacionada a notificações). Por isso **não há** `preferences.php` nesta fase.

## 7. Templates

- **Interna**: `titulo` curto + `mensagem` + `link` para a tela relacionada. Sem dado sensível.
- **E-mail** (contrato, a implementar na fase de e-mail): um template por evento (assunto + corpo curto + link), enfileirado em `fila_email`.

## 8. Logs

- Não há log por notificação interna (alto volume). Há log das ações de origem (atribuição, comentário, conclusão) já registradas nos endpoints.
- O envio de e-mail (quando existir) registrará envio/erro na própria `fila_email`.

## 9. Tentativas e falhas

- **Interna**: não falha além do insert; sem reprocessamento.
- **E-mail**: a `fila_email` tem `status`, `tentativas` e `erro`; o cron (pendente) reprocessa falhas com limite.

## 10. Limites anti-spam

- Deduplicar destinatários por evento.
- Não notificar o autor do evento.
- Conteúdo curto e sem dado sensível.

## 11. Fora do MVP

SMS, WhatsApp, push web, preferências/opt-out, central de preferências, agrupamento/digest de notificações.
