<?php

// api/notificacoes/marcar-lida.php
// Marca uma notificacao do usuario como lida.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Notificacao nao informada.", 400);
}

marcar_notificacao_lida($id, obter_usuario_logado_id());

json_sucesso(null, "Notificacao marcada como lida.");
