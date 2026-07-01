<?php

// api/relatorios/resumo.php
// Numeros agregados para a tela de Relatorios. Apenas Gestor/Admin (visao global).
// Periodo [inicio, fim] em YYYY-MM-DD; sem/invalido => ultimos 30 dias.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/relatorios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

// Periodo (com defaults seguros).
$hoje = date("Y-m-d");
$inicio = trim($_GET["inicio"] ?? "");
$fim = trim($_GET["fim"] ?? "");
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $inicio)) {
    $inicio = date("Y-m-d", strtotime("-30 days"));
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fim)) {
    $fim = $hoje;
}
if ($fim < $inicio) {
    $fim = $inicio;
}

json_sucesso([
    "inicio" => $inicio,
    "fim" => $fim,
    "demandas_por_status" => relatorio_demandas_por_status(),
    "demandas_por_setor" => relatorio_demandas_por_setor(),
    "acoes_prazo" => relatorio_acoes_prazo($inicio, $fim),
    "produtividade" => relatorio_produtividade($inicio, $fim),
    "atrasos_por_responsavel" => relatorio_atrasos_por_responsavel($inicio, $fim),
    "recusas_por_setor" => relatorio_recusas_por_setor()
]);
