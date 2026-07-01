<?php

// api/logs/acoes.php
// Lista distinta de acoes registradas (para o filtro da tela de Auditoria). Apenas Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/log.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador"]);

json_sucesso(["acoes" => logs_acoes_distintas()]);
