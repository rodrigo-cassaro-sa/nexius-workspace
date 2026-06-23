<?php

// api/acoes/definir-chave.php
// Define uma acao como a "acao chave" da demanda (marco de conclusao). Apenas Gestor e Admin.
// Toda demanda deve ter exatamente uma acao chave; este endpoint move a chave para a acao escolhida.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/demandas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$body = ler_json_entrada();
$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

if ($acao["status"] === "cancelada") {
    json_erro("Uma acao cancelada nao pode ser a chave.", 409);
}

if (!definir_acao_chave($id, $acao["demanda_id"])) {
    json_erro("Nao foi possivel definir a acao chave.", 500);
}

registrar_log("acao_chave_definida", "acao_id=" . $id . " demanda_id=" . $acao["demanda_id"]);

json_sucesso(null, "Acao chave atualizada.");
