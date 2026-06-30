<?php

// cron/limpar-logs.php
// Retencao de logs: remove registros com mais de 1 ano da tabela `logs`.
// Rotina de linha de comando (CLI). Agende no EasyPanel (Scheduled Task), ex.: 1x por dia:
//   php /var/www/html/cron/limpar-logs.php

require_once __DIR__ . "/../includes/config.php";
require_once __DIR__ . "/../includes/response.php";
require_once __DIR__ . "/../includes/db.php";
require_once __DIR__ . "/../includes/log.php";

// Evita execucao pela web (a pasta cron ja e bloqueada, mas reforca).
if (PHP_SAPI !== "cli") {
    http_response_code(403);
    exit;
}

$removidos = limpar_logs_antigos();

echo "Logs: removidos " . $removidos . " registro(s) com mais de 1 ano.\n";
