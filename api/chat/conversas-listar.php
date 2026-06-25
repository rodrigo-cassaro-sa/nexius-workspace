<?php

// api/chat/conversas-listar.php
// Lista as conversas do usuario logado (outro participante, ultima mensagem, nao lidas).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/chat.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(["conversas" => listar_conversas(obter_usuario_logado_id())]);
