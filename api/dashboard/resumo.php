<?php

// api/dashboard/resumo.php
// Retorna os numeros do painel conforme o escopo do usuario.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/dashboard.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$usuario_id = obter_usuario_logado_id();
$perfil = obter_usuario_logado_perfil();

$por_status = contar_demandas_por_status($usuario_id, $perfil);
$total = $por_status["aberta"] + $por_status["em_andamento"] + $por_status["concluida"];

json_sucesso([
    "demandas_por_status" => $por_status,
    "total_demandas" => $total,
    "minhas_acoes_pendentes" => contar_minhas_acoes_pendentes($usuario_id),
    "acoes_atrasadas" => contar_acoes_atrasadas($usuario_id, $perfil),
    "percentual_no_prazo" => percentual_acoes_no_prazo($usuario_id, $perfil)
]);
