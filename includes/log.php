<?php

// log.php
// Registro de acoes criticas (ver boas-praticas-seguranca).
// Nunca registrar senha, token ou segredo.
// Nesta fase inicial grava em arquivo (logs/app.log).
// Quando a tabela "logs" existir, este helper podera tambem persistir no banco.

function registrar_log($acao, $detalhes = "")
{
    $linha = json_encode([
        "data" => date("Y-m-d H:i:s"),
        "usuario_id" => function_exists("obter_usuario_logado_id") ? obter_usuario_logado_id() : null,
        "acao" => $acao,
        "ip" => $_SERVER["REMOTE_ADDR"] ?? null,
        "user_agent" => $_SERVER["HTTP_USER_AGENT"] ?? null,
        "detalhes" => $detalhes
    ], JSON_UNESCAPED_UNICODE);

    $caminho = __DIR__ . "/../logs/app.log";
    @file_put_contents($caminho, $linha . PHP_EOL, FILE_APPEND);
}
