<?php

// api/notificacoes/listar.php
// Lista as notificacoes do usuario logado, com a contagem de nao lidas.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$usuario_id = obter_usuario_logado_id();

json_sucesso([
    "notificacoes" => listar_notificacoes($usuario_id),
    "nao_lidas" => contar_notificacoes_nao_lidas($usuario_id)
]);
