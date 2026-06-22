<?php

// cron/processar-fila-email.php
// Rotina de linha de comando (CLI) que processa a fila_email e envia por SMTP.
// Agende no EasyPanel (Scheduled Task) algo como:
//   php /var/www/html/cron/processar-fila-email.php
// a cada poucos minutos. So roda se o SMTP estiver configurado.

require_once __DIR__ . "/../includes/config.php";
require_once __DIR__ . "/../includes/response.php";
require_once __DIR__ . "/../includes/db.php";
require_once __DIR__ . "/../includes/email.php";
require_once __DIR__ . "/../includes/mailer.php";

// Evita execucao pela web (esta pasta ja e bloqueada, mas reforca).
if (PHP_SAPI !== "cli") {
    http_response_code(403);
    exit;
}

if (!email_configurado()) {
    fwrite(STDERR, "E-mail nao configurado. Defina RESEND_API_KEY ou as variaveis SMTP_*.\n");
    exit(1);
}

$pendentes = buscar_emails_pendentes(20);
$enviados = 0;
$falhas = 0;

foreach ($pendentes as $email) {
    $resultado = enviar_email($email["email_destino"], $email["assunto"], $email["mensagem"]);

    if ($resultado["ok"]) {
        marcar_email_enviado($email["id"]);
        $enviados++;
    } else {
        marcar_email_erro($email["id"], $resultado["erro"], (int) $email["tentativas"] + 1);
        $falhas++;
    }
}

echo "Fila de e-mail: " . count($pendentes) . " processados, " . $enviados . " enviados, " . $falhas . " com falha.\n";
