<?php

// api/perfil/atualizar.php
// Atualiza o nome do proprio usuario logado. E-mail e perfil nao sao editaveis aqui.

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

$nome = trim($body["nome"] ?? "");

if (!validar_tamanho($nome, 2, 100)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => ["nome" => "O nome deve ter de 2 a 100 caracteres."]], 400);
}

$id = obter_usuario_logado_id();

if (!atualizar_nome($id, $nome)) {
    json_erro("Nao foi possivel salvar o perfil.", 500);
}

registrar_log("perfil_atualizado", "usuario_id=" . $id);

json_sucesso(["nome" => $nome], "Perfil atualizado.");
