<?php

// api/usuarios/definir-setor.php
// Define (ou limpa) o setor de um usuario. Apenas Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/setores.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
$setor_id = isset($body["setor_id"]) && $body["setor_id"] !== "" ? (int) $body["setor_id"] : null;

if ($id <= 0 || !buscar_usuario_por_id($id)) {
    json_erro("Usuario nao encontrado.", 404);
}
if ($setor_id !== null && !buscar_setor($setor_id)) {
    json_erro("Setor invalido.", 400);
}

if (!definir_setor_usuario($id, $setor_id)) {
    json_erro("Nao foi possivel salvar o setor do usuario.", 500);
}

registrar_log("usuario_setor_definido", "usuario_id=" . $id . " setor_id=" . (int) $setor_id);

json_sucesso(null, "Setor do usuario atualizado.");
