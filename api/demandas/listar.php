<?php

// api/demandas/listar.php
// Lista demandas conforme o escopo do usuario e filtros (status, responsavel, busca) com paginacao.

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

$filtros = [
    "status" => $filtro_status,
    "responsavel" => isset($_GET["responsavel"]) ? (int) $_GET["responsavel"] : 0,
    "busca" => trim($_GET["busca"] ?? "")
];

$por_pagina = 10;
$pagina = isset($_GET["pagina"]) ? (int) $_GET["pagina"] : 1;
if ($pagina < 1) {
    $pagina = 1;
}

$resultado = listar_demandas($usuario_id, $perfil, $filtros, $pagina, $por_pagina);

json_sucesso([
    "demandas" => $resultado["demandas"],
    "total" => $resultado["total"],
    "pagina" => $pagina,
    "por_pagina" => $por_pagina
]);
