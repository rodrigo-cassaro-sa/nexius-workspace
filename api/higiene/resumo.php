<?php

// api/higiene/resumo.php
// Painel de controle/higiene: itens fora de controle. Apenas Gestor/Admin. So leitura.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/higiene.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

// Dias para considerar uma demanda "parada" (sem movimento). Default 14.
$dias = isset($_GET["dias"]) ? (int) $_GET["dias"] : 14;
if ($dias < 1 || $dias > 365) {
    $dias = 14;
}

json_sucesso([
    "dias_parada" => $dias,
    "demandas_sem_acao" => higiene_demandas_sem_acao(),
    "demandas_sem_responsavel" => higiene_demandas_sem_responsavel(),
    "acoes_sem_prazo" => higiene_acoes_sem_prazo(),
    "acoes_responsavel_inativo" => higiene_acoes_responsavel_inativo(),
    "demandas_paradas" => higiene_demandas_paradas($dias)
]);
