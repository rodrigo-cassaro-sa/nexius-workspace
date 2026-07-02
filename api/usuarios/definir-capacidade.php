<?php

// api/usuarios/definir-capacidade.php
// Define a capacidade semanal (dias de esforco por semana) de um usuario. Apenas Administrador.
// Usada no recalculo de agenda (B1). Vazio => volta ao padrao (5).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/agenda.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();
exigir_perfil(["administrador"]);

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
if ($id <= 0) {
    json_erro("Usuario nao informado.", 400);
}

$capacidade = isset($body["capacidade_semana"]) && $body["capacidade_semana"] !== "" ? (int) $body["capacidade_semana"] : null;
if ($capacidade !== null && ($capacidade < 1 || $capacidade > 7)) {
    json_response(["ok" => false, "error" => "Capacidade invalida.", "errors" => ["capacidade_semana" => "Informe de 1 a 7 dias por semana."]], 400);
}

if (!usuario_ativo_existe($id)) {
    json_erro("Usuario invalido.", 400);
}

if (!definir_capacidade_usuario($id, $capacidade)) {
    json_erro("Nao foi possivel atualizar a capacidade.", 500);
}

registrar_log("usuario_capacidade_definida", "usuario_id=" . $id . " capacidade=" . ($capacidade === null ? "null" : $capacidade));

json_sucesso(null, "Capacidade atualizada.");
