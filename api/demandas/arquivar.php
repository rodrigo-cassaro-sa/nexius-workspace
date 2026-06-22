<?php

// api/demandas/arquivar.php
// Arquiva ou cancela uma demanda (status arquivada/cancelada). Gestor e Admin.
// Nao ha exclusao fisica no sistema.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador", "gestor"]);

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
$status = trim($body["status"] ?? "arquivada");

if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}
if (!valor_em_lista($status, status_demanda_arquivamento())) {
    json_erro("Status invalido.", 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

if (!arquivar_demanda($id, $status)) {
    json_erro("Nao foi possivel concluir a acao.", 500);
}

registrar_log("demanda_arquivada", "demanda_id=" . $id . " status=" . $status);

json_sucesso(null, $status === "cancelada" ? "Demanda cancelada." : "Demanda arquivada.");
