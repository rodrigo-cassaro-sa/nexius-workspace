<?php

// api/anexos/listar-acoes.php
// Lista, de uma so vez, os anexos (evidencias) de todas as acoes de uma demanda.
// O front agrupa por acao_id. Respeita o mesmo escopo de visibilidade da demanda.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/anexos.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$demanda_id = isset($_GET["demanda_id"]) ? (int) $_GET["demanda_id"] : 0;
if ($demanda_id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($demanda_id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

if (!usuario_pode_ver_demanda($demanda_id, obter_usuario_logado_id(), obter_usuario_logado_perfil())) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

json_sucesso(["anexos" => listar_anexos_das_acoes_da_demanda($demanda_id)]);
