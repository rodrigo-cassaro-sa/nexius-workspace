<?php

// bootstrap.php
// Carregador comum dos endpoints da API. Inclua este arquivo no topo de cada endpoint.
// Ordem: configuracao -> resposta -> banco -> sessao/auth -> permissoes -> validacao -> log.
// Nao contem regra de negocio.

// Carrega a configuracao real. Em ambiente sem config.php, falha de forma controlada.
$caminho_config = __DIR__ . "/config.php";

if (!file_exists($caminho_config)) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "ok" => false,
        "error" => "Configuracao ausente. Copie includes/config.example.php para includes/config.php."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once $caminho_config;
require_once __DIR__ . "/response.php";
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/auth.php";
require_once __DIR__ . "/permissions.php";
require_once __DIR__ . "/validate.php";
require_once __DIR__ . "/log.php";

// Inicia a sessao segura para todos os endpoints.
iniciar_sessao_segura();
