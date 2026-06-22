<?php

// api/admin/testar-email.php
// Envia um e-mail de teste para diagnostico do provedor (Resend/SMTP). Apenas Admin.
// Por ser ferramenta de diagnostico restrita ao Admin, retorna o detalhe do erro.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/mailer.php";
require_once __DIR__ . "/../../includes/email.php";

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
if (!validar_email($email)) {
    json_response(["ok" => false, "error" => "Informe um e-mail valido.", "errors" => ["email" => "E-mail invalido."]], 400);
}

if (!email_configurado()) {
    json_erro("Nenhum provedor de e-mail configurado. Defina RESEND_API_KEY ou as variaveis SMTP_*.", 400);
}

$resultado = enviar_email(
    $email,
    "Teste de e-mail - Workspace S&A",
    "Este e um e-mail de teste do Workspace S&A. Se voce recebeu, o envio esta funcionando."
);

registrar_log("email_teste", "destino=" . $email . " ok=" . ($resultado["ok"] ? "1" : "0"));

if ($resultado["ok"]) {
    json_sucesso(null, "E-mail de teste enviado para " . $email . ". Verifique a caixa de entrada e o spam.");
}

// Diagnostico para o admin: mostra o motivo da falha.
json_response(["ok" => false, "error" => "Falha no envio.", "detalhe" => $resultado["erro"]], 502);
