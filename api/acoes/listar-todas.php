<?php

// api/acoes/listar-todas.php
// Lista GLOBAL de acoes (de varias demandas) com filtros, paginacao e escopo.
// Escopo: Admin/Gestor veem todas; Colaborador so as de demandas em que esta envolvido.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/impacto.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$perfil = obter_usuario_logado_perfil();
$usuario_id = obter_usuario_logado_id();

// Status real da acao (bloqueada/atrasada sao derivadas, via "situacao").
$status = trim($_GET["status"] ?? "");
if ($status !== "" && !in_array($status, ["pendente", "concluida"], true)) {
    $status = "";
}

$situacao = trim($_GET["situacao"] ?? "");
if ($situacao !== "" && !in_array($situacao, ["atrasadas", "bloqueadas"], true)) {
    $situacao = "";
}

$filtros = [
    "status" => $status,
    "responsavel" => isset($_GET["responsavel"]) ? (int) $_GET["responsavel"] : 0,
    "setor" => isset($_GET["setor"]) ? (int) $_GET["setor"] : 0,
    "busca" => trim($_GET["busca"] ?? ""),
    "situacao" => $situacao
];

$por_pagina = 15;
$pagina = isset($_GET["pagina"]) ? (int) $_GET["pagina"] : 1;
if ($pagina < 1) {
    $pagina = 1;
}

$resultado = listar_acoes($usuario_id, $perfil, $filtros, $pagina, $por_pagina);

// Marca as acoes em risco de atraso por prioridade (D24, so leitura).
$em_risco = array_flip(acoes_em_risco_ids());
foreach ($resultado["acoes"] as &$ac) {
    $ac["em_risco"] = isset($em_risco[(int) $ac["id"]]) ? 1 : 0;
}
unset($ac);

json_sucesso([
    "acoes" => $resultado["acoes"],
    "total" => $resultado["total"],
    "pagina" => $pagina,
    "por_pagina" => $por_pagina
]);
