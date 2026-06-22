<?php

// api/acoes/listar.php
// Lista as acoes de uma demanda, respeitando o escopo de visibilidade da demanda.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";

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

// Escopo: Colaborador so ve se estiver envolvido na demanda.
if (obter_usuario_logado_perfil() === "colaborador") {
    if (!colaborador_envolvido_na_demanda($demanda_id, obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

json_sucesso(["acoes" => listar_acoes_da_demanda($demanda_id)]);
