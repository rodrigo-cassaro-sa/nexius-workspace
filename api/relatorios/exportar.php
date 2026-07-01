<?php

// api/relatorios/exportar.php
// Exporta o relatorio de produtividade por responsavel em CSV. Apenas Gestor/Admin.
// Erros saem em JSON; sucesso e o proprio arquivo CSV (download).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/relatorios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$inicio = trim($_GET["inicio"] ?? "");
$fim = trim($_GET["fim"] ?? "");
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $inicio = date("Y-m-d", strtotime("-30 days"));
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $fim = date("Y-m-d");
}
if ($fim < $inicio) {
    $fim = $inicio;
}

$setor = isset($_GET["setor"]) ? (int) $_GET["setor"] : 0;
$linhas = relatorio_produtividade($inicio, $fim, $setor);

registrar_log("relatorio_exportado", "produtividade inicio=" . $inicio . " fim=" . $fim . " setor=" . $setor);

$arquivo = "produtividade_" . $inicio . "_a_" . $fim . ".csv";

header("Content-Type: text/csv; charset=utf-8");
header("X-Content-Type-Options: nosniff");
header("Content-Disposition: attachment; filename=\"" . $arquivo . "\"");
header("Cache-Control: private, no-store");

// BOM UTF-8 para o Excel abrir os acentos corretamente.
echo "\xEF\xBB\xBF";

$saida = fopen("php://output", "w");
// Separador ";" (padrao do Excel pt-BR).
fputcsv($saida, ["Responsavel", "Concluidas", "No prazo", "% no prazo"], ";");
foreach ($linhas as $l) {
    $concluidas = (int) $l["concluidas"];
    $no_prazo = (int) $l["no_prazo"];
    $pct = $concluidas > 0 ? round(($no_prazo / $concluidas) * 100) . "%" : "-";
    fputcsv($saida, [$l["responsavel"], $concluidas, $no_prazo, $pct], ";");
}
fclose($saida);
exit;
