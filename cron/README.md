# cron/

Rotinas automáticas executadas pelo servidor (não acessíveis pela web).

No MVP, a rotina prevista é:

- `processar-fila-email.php` — processa a tabela `fila_email` e reenvia falhas (criada na fase de notificações/e-mail).

Não criar rotinas sem necessidade real.
