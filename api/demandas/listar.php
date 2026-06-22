<?php

// api/demandas/listar.php
// Lista demandas conforme o escopo do usuario e filtros (status, busca).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$perfil = obter_usuario_logado_perfil();
$usuario_id = obter_usuario_logado_id();

// Filtro de status (valida contra a lista fechada).
$status_validos = ["aberta", "em_andamento", "concluida", "arquivada", "cancelada"];
$filtro_status = trim($_GET["status"] ?? "");
if ($filtro_status !== "" && !in_array($filtro_status, $status_validos, true)) {
    $filtro_status = "";
}

$busca = trim($_GET["busca"] ?? "");

$demandas = listar_demandas($usuario_id, $perfil, $filtro_status, $busca);

json_sucesso(["demandas" => $demandas]);
