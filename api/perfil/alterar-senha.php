<?php

// api/perfil/alterar-senha.php
// Troca a senha do proprio usuario logado. Exige a senha atual correta.

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

$senha_atual = (string) ($body["senha_atual"] ?? "");
$senha_nova = (string) ($body["senha_nova"] ?? "");

$erros = [];
if ($senha_atual === "") {
    $erros["senha_atual"] = "Informe a senha atual.";
}
if (!validar_tamanho($senha_nova, 8, 72)) {
    $erros["senha_nova"] = "A nova senha deve ter de 8 a 72 caracteres.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$id = obter_usuario_logado_id();
$hash = buscar_hash_senha($id);

// Confere a senha atual antes de permitir a troca.
if ($hash === null || !password_verify($senha_atual, $hash)) {
    json_response(["ok" => false, "error" => "Senha atual incorreta.", "errors" => ["senha_atual" => "Senha atual incorreta."]], 400);
}

$novo_hash = password_hash($senha_nova, PASSWORD_DEFAULT);

if (!atualizar_senha($id, $novo_hash)) {
    json_erro("Nao foi possivel alterar a senha.", 500);
}

registrar_log("senha_alterada", "usuario_id=" . $id);

json_sucesso(null, "Senha alterada com sucesso.");
