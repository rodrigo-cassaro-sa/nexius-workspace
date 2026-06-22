<?php

// api/auth/recuperar-senha.php
// Solicitacao de redefinicao de senha. Gera token (30 min, uso unico) e enfileira o e-mail.
// Resposta sempre neutra: nao revela se o e-mail existe.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/tokens.php";
require_once __DIR__ . "/../../includes/email.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$email = trim($body["email"] ?? "");

if (!validar_email($email)) {
    json_response(["ok" => false, "error" => "Informe um e-mail valido.", "errors" => ["email" => "E-mail invalido."]], 400);
}

$usuario = buscar_usuario_por_email($email);

// So gera token para usuario existente e ativo. A resposta e neutra de qualquer forma.
if ($usuario && (int) $usuario["ativo"] === 1) {
    invalidar_tokens_recuperacao_do_usuario($usuario["id"]);

    $token = bin2hex(random_bytes(32));
    $expira_em = date("Y-m-d H:i:s", time() + 30 * 60);
    criar_token_recuperacao($usuario["id"], $token, $expira_em);

    $link = APP_URL . "/redefinir-senha.html?token=" . $token;
    $mensagem = "Recebemos um pedido para redefinir sua senha no Workspace S&A.\n\n"
        . "Acesse o link para criar uma nova senha:\n" . $link . "\n\n"
        . "O link vale por 30 minutos. Se nao foi voce, ignore este e-mail.";

    enfileirar_email($usuario["id"], $usuario["email"], "Redefinicao de senha - Workspace S&A", $mensagem);
    registrar_log("recuperacao_solicitada", "usuario_id=" . $usuario["id"]);
}

json_sucesso(null, "Se o e-mail existir, enviamos as instrucoes para redefinir a senha.");
