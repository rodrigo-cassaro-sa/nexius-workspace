<?php

// api/onboarding/concluir.php
// Marca o onboarding do usuario logado como concluido.
// O onboarding e informativo (nao coleta dados), por isso ha apenas este endpoint.
// O status (onboarding_concluido) ja e retornado por api/auth/me.php.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$id = obter_usuario_logado_id();

if (!marcar_onboarding_concluido($id)) {
    json_erro("Nao foi possivel concluir o onboarding.", 500);
}

registrar_log("onboarding_concluido", "usuario_id=" . $id);

json_sucesso(null, "Onboarding concluido.");
