<?php

// api/convites/criar.php
// Admin cria um convite (email + perfil). Gera token, validade 7 dias.
// Reenvio: cancela convites pendentes do mesmo e-mail antes de criar o novo.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/convites.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_admin();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$email = trim($body["email"] ?? "");
$perfil = trim($body["perfil"] ?? "");

$perfis_validos = ["administrador", "gestor", "colaborador"];
$erros = [];
if (!validar_email($email)) {
    $erros["email"] = "E-mail invalido.";
}
if (!valor_em_lista($perfil, $perfis_validos)) {
    $erros["perfil"] = "Perfil invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

// Nao convidar quem ja e usuario.
if (buscar_usuario_por_email($email)) {
    json_erro("Ja existe um usuario com este e-mail.", 409);
}

// Reenvio limpo: invalida convites pendentes anteriores do mesmo e-mail.
cancelar_convites_pendentes_por_email($email);

$token = bin2hex(random_bytes(32));
$expira_em = date("Y-m-d H:i:s", time() + 7 * 24 * 60 * 60);

$id = criar_convite($email, $perfil, $token, $expira_em, obter_usuario_logado_id());
if (!$id) {
    json_erro("Nao foi possivel criar o convite.", 500);
}

registrar_log("convite_criado", "email=" . $email . " perfil=" . $perfil);

// O frontend monta o link completo a partir da origem atual (cadastro.html?token=...).
json_sucesso([
    "token" => $token,
    "caminho" => "cadastro.html?token=" . $token,
    "expira_em" => $expira_em
], "Convite criado.");
