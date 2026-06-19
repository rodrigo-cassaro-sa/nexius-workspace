<?php

// api/auth/setup.php
// Bootstrap do primeiro administrador.
// So funciona enquanto a tabela usuarios estiver VAZIA. Depois, fica bloqueado
// e o acesso passa a ser somente por convite (decisao registrada na descricao do produto).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

// Bloqueio do bootstrap: se ja existe qualquer usuario, nao permite mais.
if (contar_usuarios() > 0) {
    json_response(["ok" => false, "error" => "Configuracao inicial ja realizada."], 403);
}

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$nome = trim($body["nome"] ?? "");
$email = trim($body["email"] ?? "");
$senha = (string) ($body["senha"] ?? "");

$erros = [];
if (!campo_obrigatorio($body, "nome") || !validar_tamanho($nome, 2, 120)) {
    $erros["nome"] = "Informe o nome.";
}
if (!validar_email($email)) {
    $erros["email"] = "E-mail invalido.";
}
if (!validar_tamanho($senha, 8, 72)) {
    $erros["senha"] = "A senha deve ter de 8 a 72 caracteres.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);
$id = criar_usuario_admin_inicial($nome, $email, $senha_hash);

if (!$id) {
    json_erro("Nao foi possivel concluir o setup.", 500);
}

registrar_log("setup_admin", "usuario_id=" . $id);

json_sucesso(["id" => $id], "Administrador inicial criado. Agora faca login.");
