<?php

// api/roadmap/listar.php
// Itens do roadmap/Gantt: acoes COM prazo num intervalo, agrupadas por projeto/demanda
// (o front monta as barras). Qualquer usuario logado; o conteudo respeita o ESCOPO
// (Colaborador so ve as acoes de demandas em que esta envolvido). So leitura.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/impacto.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

// Janela de datas (defaults seguros: ~3 meses a frente, 2 semanas atras).
$inicio = trim($_GET["inicio"] ?? "");
$fim = trim($_GET["fim"] ?? "");
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $inicio = date("Y-m-d", strtotime("-14 days"));
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $fim = date("Y-m-d", strtotime("+90 days"));
}
if ($fim < $inicio) {
    $fim = $inicio;
}
// Limita a janela para nao gerar uma timeline gigante (no maximo ~13 meses).
if (strtotime($fim) > strtotime($inicio . " +400 days")) {
    $fim = date("Y-m-d", strtotime($inicio . " +400 days"));
}

$filtros = [
    "status" => "",
    "responsavel" => 0,
    "setor" => isset($_GET["setor"]) ? (int) $_GET["setor"] : 0,
    "projeto" => isset($_GET["projeto"]) ? (int) $_GET["projeto"] : 0,
    "busca" => "",
    "situacao" => ""
];

$itens = listar_acoes_roadmap(
    obter_usuario_logado_id(),
    obter_usuario_logado_perfil(),
    $filtros,
    $inicio,
    $fim
);

// Sinalizacao de impacto por prioridade (D24): marca cada item que esta em risco de atraso.
// Usa a fonte unica (impacto.php), que considera todas as tarefas (inclusive fora da janela).
$em_risco = array_flip(acoes_em_risco_ids());
foreach ($itens as &$item) {
    $item["em_risco"] = isset($em_risco[(int) $item["id"]]) ? 1 : 0;
}
unset($item);

json_sucesso([
    "inicio" => $inicio,
    "fim" => $fim,
    "itens" => $itens
]);
