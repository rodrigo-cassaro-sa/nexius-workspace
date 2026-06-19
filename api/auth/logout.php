<?php

// api/auth/logout.php
// Encerra a sessao do usuario.

require_once __DIR__ . "/../../includes/bootstrap.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

$usuario_id = obter_usuario_logado_id();

fazer_logout();

if ($usuario_id) {
    registrar_log("logout", "usuario_id=" . $usuario_id);
}

json_sucesso(null, "Sessao encerrada.");
