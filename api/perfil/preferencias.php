<?php

// api/perfil/preferencias.php
// Salva preferencias do proprio usuario. Por ora: opt-in/out do resumo por e-mail (D15).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$valor = $body["digest_ativo"] ?? null;
$ativo = ($valor === true || $valor === 1 || $valor === "1") ? 1 : 0;

if (!definir_digest_usuario(obter_usuario_logado_id(), $ativo)) {
    json_erro("Nao foi possivel salvar a preferencia.", 500);
}

json_sucesso(["digest_ativo" => $ativo === 1], "Preferencia salva.");
