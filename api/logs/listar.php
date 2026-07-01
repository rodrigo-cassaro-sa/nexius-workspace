<?php

// api/logs/listar.php
// Auditoria: lista os logs com filtros e paginacao. Apenas Administrador. So leitura.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/log.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador"]);

$inicio = trim($_GET["inicio"] ?? "");
$fim = trim($_GET["fim"] ?? "");
if ($inicio !== "" && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $inicio = "";
}
if ($fim !== "" && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $fim = "";
}

$filtros = [
    "usuario_id" => isset($_GET["usuario_id"]) ? (int) $_GET["usuario_id"] : 0,
    "acao" => trim($_GET["acao"] ?? ""),
    "inicio" => $inicio,
    "fim" => $fim,
    "busca" => trim($_GET["busca"] ?? "")
];

$por_pagina = 30;
$pagina = isset($_GET["pagina"]) ? (int) $_GET["pagina"] : 1;
if ($pagina < 1) {
    $pagina = 1;
}

$resultado = listar_logs($filtros, $pagina, $por_pagina);

json_sucesso([
    "logs" => $resultado["logs"],
    "total" => $resultado["total"],
    "pagina" => $pagina,
    "por_pagina" => $por_pagina
]);
