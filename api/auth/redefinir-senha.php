<?php

// api/auth/redefinir-senha.php
// Redefine a senha a partir de um token valido (nao usado e nao expirado).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/tokens.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$token = trim($body["token"] ?? "");
$senha = (string) ($body["senha"] ?? "");

$erros = [];
if ($token === "") {
    $erros["token"] = "Link invalido.";
}
if (!validar_tamanho($senha, 8, 72)) {
    $erros["senha"] = "A senha deve ter de 8 a 72 caracteres.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$registro = buscar_token_recuperacao($token);

if (!$registro || (int) $registro["usado"] === 1 || strtotime($registro["expira_em"]) < time()) {
    json_erro("Link invalido ou expirado. Solicite um novo.", 410);
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);

if (!atualizar_senha($registro["usuario_id"], $senha_hash)) {
    json_erro("Nao foi possivel redefinir a senha.", 500);
}

marcar_token_recuperacao_usado($registro["id"]);
registrar_log("senha_redefinida", "usuario_id=" . $registro["usuario_id"]);

json_sucesso(null, "Senha alterada com sucesso. Agora faca login.");
