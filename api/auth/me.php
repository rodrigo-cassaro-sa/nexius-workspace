<?php

// api/auth/me.php
// Retorna o usuario autenticado na sessao atual (usado pelo frontend para checar login).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

if (!usuario_esta_logado()) {
    json_response(["ok" => false, "error" => "Usuario nao autenticado."], 401);
}

$usuario = buscar_usuario_por_id(obter_usuario_logado_id());

// Sessao aponta para usuario inexistente ou inativo: encerra por seguranca.
if (!$usuario || (int) $usuario["ativo"] !== 1) {
    fazer_logout();
    json_response(["ok" => false, "error" => "Sessao invalida."], 401);
}

json_sucesso([
    "id" => (int) $usuario["id"],
    "nome" => $usuario["nome"],
    "email" => $usuario["email"],
    "perfil" => $usuario["perfil"],
    "onboarding_concluido" => (int) $usuario["onboarding_concluido"] === 1
]);
