<?php

// api/acoes/definir-esforco.php
// Define o esforco estimado (dias) de uma acao, usado no recalculo de agenda (B1).
// Permissao: Gestor/Admin, key user do setor da demanda, ou o responsavel da tarefa.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/agenda.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$esforco = isset($body["esforco_dias"]) && $body["esforco_dias"] !== "" ? (int) $body["esforco_dias"] : null;
if ($esforco !== null && ($esforco < 1 || $esforco > 365)) {
    json_response(["ok" => false, "error" => "Esforco invalido.", "errors" => ["esforco_dias" => "Informe de 1 a 365 dias."]], 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

$perfil = obter_usuario_logado_perfil();
$eh_gestor = ($perfil === "administrador" || $perfil === "gestor");
$eh_keyuser = usuario_eh_keyuser_da_demanda($acao["demanda_id"], obter_usuario_logado_id());
$eh_responsavel = (int) $acao["responsavel_id"] === obter_usuario_logado_id();
if (!$eh_gestor && !$eh_keyuser && !$eh_responsavel) {
    json_response(["ok" => false, "error" => "Sem permissao para alterar o esforco."], 403);
}

if (!definir_esforco_acao($id, $esforco)) {
    json_erro("Nao foi possivel atualizar o esforco.", 500);
}

registrar_log("acao_esforco_definido", "acao_id=" . $id . " esforco=" . ($esforco === null ? "null" : $esforco));

json_sucesso(null, "Esforço atualizado.");
