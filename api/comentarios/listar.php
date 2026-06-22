<?php

// api/comentarios/listar.php
// Lista os comentarios de uma acao, respeitando o escopo da demanda.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/comentarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$acao_id = isset($_GET["acao_id"]) ? (int) $_GET["acao_id"] : 0;
if ($acao_id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($acao_id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

if (obter_usuario_logado_perfil() === "colaborador") {
    if (!colaborador_envolvido_na_demanda($acao["demanda_id"], obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

json_sucesso(["comentarios" => listar_comentarios_da_acao($acao_id)]);
