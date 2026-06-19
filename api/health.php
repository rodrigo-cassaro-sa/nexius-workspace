<?php

// api/health.php
// Verificacao simples de saude: confirma que o PHP responde e consegue falar com o MySQL.
// Endpoint publico e minimo. Nao expoe detalhe tecnico ao cliente (apenas ok/erro generico).
// O detalhe do erro vai para o log, nunca para a resposta.

require_once __DIR__ . "/../includes/bootstrap.php";

// Apenas GET.
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

// Testa a conexao com o banco (conectar_banco encerra com erro generico se falhar).
$conexao = conectar_banco();

// Consulta trivial para confirmar que o banco responde.
$resultado = mysqli_query($conexao, "SELECT 1");

if (!$resultado) {
    registrar_log("health_falha", "Falha ao consultar o banco no health check.");
    json_response(["ok" => false, "error" => "Servico indisponivel."], 503);
}

mysqli_free_result($resultado);

json_response([
    "ok" => true,
    "data" => [
        "app" => APP_NOME,
        "ambiente" => APP_AMBIENTE,
        "banco" => "conectado"
    ]
]);
