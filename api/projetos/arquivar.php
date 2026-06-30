<?php

// api/projetos/arquivar.php
// Arquiva ou cancela um projeto (status arquivado/cancelado). Gestor e Admin.
// Nao apaga: as demandas vinculadas continuam existindo (projeto_id permanece).

require_once __DIR__ . "/../../includes/bootstrap.php";
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
$status = trim($body["status"] ?? "");

if ($id <= 0) {
    json_erro("Projeto nao informado.", 400);
}
if (!valor_em_lista($status, status_projeto_arquivamento())) {
    json_erro("Status invalido.", 400);
}

$projeto = buscar_projeto($id);
if (!$projeto) {
    json_erro("Projeto nao encontrado.", 404);
}

if (!arquivar_projeto($id, $status)) {
    json_erro("Nao foi possivel atualizar o projeto.", 500);
}

registrar_log("projeto_arquivado", "projeto_id=" . $id . " status=" . $status);

json_sucesso(null, $status === "cancelado" ? "Projeto cancelado." : "Projeto arquivado.");
