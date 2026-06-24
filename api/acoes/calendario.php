<?php

// api/acoes/calendario.php
// Acoes com prazo dentro de um intervalo (visao de calendario da tela Acoes).
// Mesmos filtros e escopo da lista global (Admin/Gestor veem todas; Colaborador so as suas).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$perfil = obter_usuario_logado_perfil();
$usuario_id = obter_usuario_logado_id();

// Intervalo do calendario (YYYY-MM-DD). Validado para evitar entrada invalida/abuso.
$inicio = trim($_GET["inicio"] ?? "");
$fim = trim($_GET["fim"] ?? "");

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    json_response(["ok" => false, "error" => "Periodo invalido."], 422);
}

$ts_inicio = strtotime($inicio);
$ts_fim = strtotime($fim);

if ($ts_inicio === false || $ts_fim === false || $ts_fim < $ts_inicio) {
    json_response(["ok" => false, "error" => "Periodo invalido."], 422);
}

// Limite de seguranca: no maximo 42 dias (a grade do mes tem ate 6 semanas).
$dias = (int) floor(($ts_fim - $ts_inicio) / 86400) + 1;
if ($dias > 42) {
    json_response(["ok" => false, "error" => "Periodo muito amplo."], 422);
}

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
    "busca" => trim($_GET["busca"] ?? ""),
    "situacao" => $situacao
];

$acoes = listar_acoes_calendario($usuario_id, $perfil, $filtros, $inicio, $fim);

json_sucesso([
    "acoes" => $acoes,
    "inicio" => $inicio,
    "fim" => $fim
]);
