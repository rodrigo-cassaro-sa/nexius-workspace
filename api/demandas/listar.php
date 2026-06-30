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

// Filtros de triagem (validam contra as listas fechadas).
$intencao = trim($_GET["intencao"] ?? "");
if ($intencao !== "" && !in_array($intencao, ["melhoria", "defeito", "nova_solucao"], true)) {
    $intencao = "";
}
$pilar = trim($_GET["pilar"] ?? "");
if ($pilar !== "" && !in_array($pilar, ["processo", "financeiro", "pessoas", "cliente"], true)) {
    $pilar = "";
}
$objetivo = trim($_GET["objetivo"] ?? "");
if ($objetivo !== "" && !in_array($objetivo, ["reducao_custo", "relevancia_marca", "organizacao_trabalho"], true)) {
    $objetivo = "";
}

$sla = trim($_GET["sla"] ?? "");
if ($sla !== "" && !in_array($sla, ["aguardando", "vencido", "respondida_prazo", "respondida_fora"], true)) {
    $sla = "";
}

$filtros = [
    "status" => $filtro_status,
    "solicitante" => isset($_GET["solicitante"]) ? (int) $_GET["solicitante"] : 0,
    "setor" => isset($_GET["setor"]) ? (int) $_GET["setor"] : 0,
    "busca" => trim($_GET["busca"] ?? ""),
    "intencao" => $intencao,
    "pilar" => $pilar,
    "objetivo" => $objetivo,
    "sla" => $sla
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
