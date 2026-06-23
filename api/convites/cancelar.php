<?php

// api/convites/cancelar.php
// Cancela um convite pendente. Apenas Admin.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/convites.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Convite nao informado.", 400);
}

if (!cancelar_convite($id)) {
    json_erro("Convite nao encontrado ou ja nao esta pendente.", 409);
}

registrar_log("convite_cancelado", "convite_id=" . $id);

json_sucesso(null, "Convite cancelado.");
