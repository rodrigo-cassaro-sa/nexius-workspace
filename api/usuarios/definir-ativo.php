<?php

// api/usuarios/definir-ativo.php
// Ativa ou inativa um usuario. Apenas Admin. Nao permite inativar a si mesmo
// (evita o admin se trancar pra fora e garante um administrador ativo).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
$id = isset($body["id"]) ? (int) $body["id"] : 0;
$ativo = !empty($body["ativo"]) ? 1 : 0;

if ($id <= 0) {
    json_erro("Usuario nao informado.", 400);
}
if ($id === (int) obter_usuario_logado_id()) {
    json_erro("Voce nao pode inativar a si mesmo.", 409);
}

$alvo = buscar_usuario_por_id($id);
if (!$alvo) {
    json_erro("Usuario nao encontrado.", 404);
}

if (!definir_ativo_usuario($id, $ativo)) {
    json_erro("Nao foi possivel atualizar o usuario.", 500);
}

registrar_log("usuario_ativo_alterado", "usuario_id=" . $id . " ativo=" . $ativo);

json_sucesso(null, $ativo ? "Usuario reativado." : "Usuario inativado.");
