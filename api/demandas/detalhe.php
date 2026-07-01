<?php

// api/demandas/detalhe.php
// Retorna o detalhe de uma demanda, respeitando o escopo de visibilidade.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/impacto.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;
if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

// Escopo: Admin e Gestor veem tudo; Colaborador so se estiver envolvido.
$perfil = obter_usuario_logado_perfil();
if ($perfil === "colaborador") {
    if (!colaborador_envolvido_na_demanda($id, obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

json_sucesso([
    "demanda" => $demanda,
    "acoes_em_risco" => contar_acoes_em_risco_da_demanda($id)
]);
