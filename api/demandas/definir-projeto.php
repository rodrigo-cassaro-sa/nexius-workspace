<?php

// api/demandas/definir-projeto.php
// Vincula (ou desvincula) uma demanda a um projeto. Apenas Gestor e Administrador.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/projetos.php";

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
$projeto_id = isset($body["projeto_id"]) && $body["projeto_id"] !== "" ? (int) $body["projeto_id"] : null;

if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

if ($projeto_id !== null && !buscar_projeto($projeto_id)) {
    json_erro("Projeto invalido.", 400);
}

if (!definir_projeto_demanda($id, $projeto_id)) {
    json_erro("Nao foi possivel atualizar a demanda.", 500);
}

registrar_log("demanda_projeto_definido", "demanda_id=" . $id . " projeto_id=" . ($projeto_id === null ? "null" : $projeto_id));

json_sucesso(null, $projeto_id === null ? "Demanda removida do projeto." : "Demanda vinculada ao projeto.");
