<?php

// api/auth/login.php
// Autentica por e-mail e senha. Mensagem generica para nao revelar se o e-mail existe.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/seguranca.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$email = trim($body["email"] ?? "");
$senha = (string) ($body["senha"] ?? "");

// Anti forca-bruta: apos algumas falhas do IP, exige captcha antes de checar a senha.
$ip = $_SERVER["REMOTE_ADDR"] ?? "";
if (login_exige_captcha($ip)) {
    if (!captcha_valido($body["captcha"] ?? "")) {
        json_response([
            "ok" => false,
            "error" => "Confirme a verificação de segurança.",
            "captcha_required" => true
        ], 400);
    }
}

$erros = [];
if (!campo_obrigatorio($body, "email") || !validar_email($email)) {
    $erros["email"] = "E-mail invalido.";
}
if (!campo_obrigatorio($body, "senha")) {
    $erros["senha"] = "Informe a senha.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$usuario = buscar_usuario_por_email($email);

// Falha generica: usuario inexistente, inativo, sem senha definida ou senha errada.
if (
    !$usuario
    || (int) $usuario["ativo"] !== 1
    || !password_verify($senha, (string) $usuario["senha_hash"])
) {
    registrar_log("login_falha", "email=" . $email);
    // Se agora passou a exigir captcha, avisa o front para exibi-lo.
    json_response([
        "ok" => false,
        "error" => "E-mail ou senha incorretos.",
        "captcha_required" => login_exige_captcha($ip)
    ], 401);
}

fazer_login($usuario);
captcha_limpar();
registrar_log("login", "usuario_id=" . $usuario["id"]);

json_sucesso([
    "id" => (int) $usuario["id"],
    "nome" => $usuario["nome"],
    "email" => $usuario["email"],
    "perfil" => $usuario["perfil"],
    "onboarding_concluido" => (int) $usuario["onboarding_concluido"] === 1
], "Login realizado com sucesso.");
