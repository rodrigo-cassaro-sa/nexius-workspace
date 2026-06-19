<?php

// response.php
// Resposta JSON padronizada de toda a API.
// Formato: { "ok": true, "data": {...} } | { "ok": true, "message": "..." } | { "ok": false, "error": "..." }
// Nunca expor erro tecnico ao usuario final.

function json_response($payload, $status = 200)
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    // Respostas de API nunca devem ser cacheadas (evita estado de sessao/erro preso no navegador).
    header("Cache-Control: no-store");
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// Atalho para respostas de sucesso.
function json_sucesso($data = null, $message = null)
{
    $payload = ["ok" => true];

    if ($data !== null) {
        $payload["data"] = $data;
    }

    if ($message !== null) {
        $payload["message"] = $message;
    }

    json_response($payload, 200);
}

// Atalho para respostas de erro (mensagem simples, sem detalhe tecnico).
function json_erro($mensagem, $status = 400)
{
    json_response(["ok" => false, "error" => $mensagem], $status);
}
