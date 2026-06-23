<?php

// api/usuarios/atualizar-perfil.php
// Altera o perfil de um usuario. Apenas Admin. Nao permite alterar o proprio perfil
// (evita auto-rebaixamento e garante que sempre haja um administrador ativo).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
$id = isset($body["id"]) ? (int) $body["id"] : 0;
$perfil = trim($body["perfil"] ?? "");

if ($id <= 0) {
    json_erro("Usuario nao informado.", 400);
}
if (!valor_em_lista($perfil, [PERFIL_ADMIN, PERFIL_GESTOR, PERFIL_COLABORADOR])) {
    json_erro("Perfil invalido.", 400);
}
if ($id === (int) obter_usuario_logado_id()) {
    json_erro("Voce nao pode alterar o proprio perfil.", 409);
}

$alvo = buscar_usuario_por_id($id);
if (!$alvo) {
    json_erro("Usuario nao encontrado.", 404);
}

if (!atualizar_perfil_usuario($id, $perfil)) {
    json_erro("Nao foi possivel atualizar o perfil.", 500);
}

registrar_log("usuario_perfil_alterado", "usuario_id=" . $id . " perfil=" . $perfil);

json_sucesso(null, "Perfil atualizado.");
