<?php

// api/demandas/definir-responsavel.php
// Define o responsavel (dono) de uma demanda - prestacao de contas no nivel da demanda.
// Permissao: Gestor/Admin ou o key user do setor. responsavel_id vazio => sem dono.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

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

$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    json_response(["ok" => false, "error" => "Responsavel invalido.", "errors" => ["responsavel_id" => "Usuario invalido."]], 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

$perfil = obter_usuario_logado_perfil();
$eh_gestor = ($perfil === "administrador" || $perfil === "gestor");
$eh_keyuser = usuario_eh_keyuser_da_demanda($id, obter_usuario_logado_id());
if (!$eh_gestor && !$eh_keyuser) {
    json_response(["ok" => false, "error" => "Sem permissao para definir o responsavel."], 403);
}

if (!definir_responsavel_demanda($id, $responsavel_id)) {
    json_erro("Nao foi possivel atualizar o responsavel.", 500);
}

registrar_log("demanda_responsavel_definido", "demanda_id=" . $id . " responsavel_id=" . ($responsavel_id === null ? "null" : $responsavel_id));

// Avisa o novo dono (se houver e nao for o proprio ator).
if ($responsavel_id !== null && $responsavel_id !== obter_usuario_logado_id()) {
    notificar_varios(
        [$responsavel_id],
        obter_usuario_logado_id(),
        "atribuicao",
        "Você é o responsável por uma demanda",
        $demanda["titulo"],
        "demanda.html?id=" . $id
    );
}

json_sucesso(null, "Responsável da demanda atualizado.");
