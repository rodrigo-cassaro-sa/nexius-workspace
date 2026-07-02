<?php

// api/auth/captcha.php
// Gera um captcha simples para o login (usado apos algumas falhas). Publico.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/seguranca.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

json_sucesso(["pergunta" => captcha_gerar()]);
