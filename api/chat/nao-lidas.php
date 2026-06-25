<?php

// api/chat/nao-lidas.php
// Total de mensagens nao lidas do usuario logado (contador do menu "Mensagens").

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/chat.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

json_sucesso(["total" => contar_mensagens_nao_lidas(obter_usuario_logado_id())]);
