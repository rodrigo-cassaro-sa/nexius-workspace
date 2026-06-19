<?php

// api/convites/aceitar.php
// Aceite do convite: valida o token, cria o usuario (nome + senha) e ativa.
// Endpoint publico (a pessoa convidada ainda nao tem login).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/convites.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$token = trim($body["token"] ?? "");
$nome = trim($body["nome"] ?? "");
$senha = (string) ($body["senha"] ?? "");

$erros = [];
if ($token === "") {
    $erros["token"] = "Convite ausente.";
}
if (!campo_obrigatorio($body, "nome") || !validar_tamanho($nome, 2, 120)) {
    $erros["nome"] = "Informe o nome.";
}
if (!validar_tamanho($senha, 8, 72)) {
    $erros["senha"] = "A senha deve ter de 8 a 72 caracteres.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$convite = buscar_convite_pendente_por_token($token);
if (!$convite) {
    json_erro("Convite invalido ou ja utilizado.", 410);
}

if (strtotime($convite["expira_em"]) < time()) {
    json_erro("Convite expirado. Peca um novo ao administrador.", 410);
}

// Seguranca: se ja existe usuario com este e-mail, nao recria.
if (buscar_usuario_por_email($convite["email"])) {
    json_erro("Ja existe um usuario com este e-mail.", 409);
}

$conn = conectar_banco();
mysqli_begin_transaction($conn);

$senha_hash = password_hash($senha, PASSWORD_DEFAULT);
$usuario_id = criar_usuario($nome, $convite["email"], $senha_hash, $convite["perfil"]);
$vinculado = $usuario_id ? marcar_convite_aceito($convite["id"], $usuario_id) : false;

if (!$usuario_id || !$vinculado) {
    mysqli_rollback($conn);
    json_erro("Nao foi possivel concluir o cadastro.", 500);
}

mysqli_commit($conn);
registrar_log("convite_aceito", "usuario_id=" . $usuario_id);

json_sucesso(["email" => $convite["email"]], "Cadastro concluido. Agora faca login.");
