<?php

// cron/enviar-digest.php
// Resumo periodico por e-mail (D15). Rotina de linha de comando (CLI).
// Agende no EasyPanel (Scheduled Task), ex.: 1x por semana:
//   php /var/www/html/cron/enviar-digest.php
// Idempotente: nao reenvia para o mesmo usuario dentro do intervalo (digest_enviado_em).
// Anti-spam: nao envia se o usuario nao tem nada relevante. So roda com e-mail configurado.
// O envio efetivo e feito por cron/processar-fila-email.php (esta rotina so enfileira).

require_once __DIR__ . "/../includes/config.php";
require_once __DIR__ . "/../includes/response.php";
require_once __DIR__ . "/../includes/db.php";
require_once __DIR__ . "/../includes/email.php";
require_once __DIR__ . "/../includes/dashboard.php";
require_once __DIR__ . "/../includes/digest.php";

// Evita execucao pela web (a pasta cron ja e bloqueada, mas reforca).
if (PHP_SAPI !== "cli") {
    http_response_code(403);
    exit;
}

if (!email_configurado()) {
    fwrite(STDERR, "E-mail nao configurado. Defina RESEND_API_KEY ou as variaveis SMTP_*.\n");
    exit(1);
}

// Intervalo de 6 dias: digest semanal com margem para rodar diariamente sem reenviar.
$intervalo_dias = 6;
$usuarios = usuarios_para_digest($intervalo_dias);

$enfileirados = 0;
$sem_conteudo = 0;

foreach ($usuarios as $u) {
    $resumo = montar_resumo_usuario((int) $u["id"]);

    // Anti-spam: nada relevante -> nao envia (e nao marca, reavalia no proximo ciclo).
    if ((int) $resumo["pendentes"] === 0 && (int) $resumo["atrasadas"] === 0) {
        $sem_conteudo++;
        continue;
    }

    list($assunto, $mensagem) = montar_email_digest($u["nome"], $resumo);
    enfileirar_email((int) $u["id"], $u["email"], $assunto, $mensagem);
    marcar_digest_enviado((int) $u["id"]);
    $enfileirados++;
}

echo "Digest: " . count($usuarios) . " elegiveis, " . $enfileirados . " enfileirados, " . $sem_conteudo . " sem conteudo.\n";
