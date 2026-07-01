<?php

// api/demandas/definir-prazo.php
// Define o prazo alvo de uma demanda (controle de prazo no nivel da demanda).
// Permissao: Gestor/Admin ou o key user do setor da demanda. prazo vazio => remove.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";

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
    json_erro("Demanda nao informada.", 400);
}

$prazo = trim($body["prazo"] ?? "");
if ($prazo === "") {
    $prazo = null;
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $prazo)) {
    json_response(["ok" => false, "error" => "Data invalida.", "errors" => ["prazo" => "Use uma data valida (AAAA-MM-DD)."]], 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

// Gestor/Admin ou key user do setor da demanda.
$perfil = obter_usuario_logado_perfil();
$eh_gestor = ($perfil === "administrador" || $perfil === "gestor");
$eh_keyuser = usuario_eh_keyuser_da_demanda($id, obter_usuario_logado_id());
if (!$eh_gestor && !$eh_keyuser) {
    json_response(["ok" => false, "error" => "Sem permissao para alterar o prazo."], 403);
}

if (!definir_prazo_demanda($id, $prazo)) {
    json_erro("Nao foi possivel atualizar o prazo.", 500);
}

registrar_log("demanda_prazo_definido", "demanda_id=" . $id . " prazo=" . ($prazo === null ? "null" : $prazo));

json_sucesso(null, "Prazo da demanda atualizado.");
