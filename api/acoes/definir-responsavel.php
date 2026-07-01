<?php

// api/acoes/definir-responsavel.php
// Troca o responsavel de uma acao a partir do roadmap.
// Permissao: Gestor/Admin, o key user do setor da demanda, ou o responsavel atual (repassa).
// Nao mexe em acao concluida/cancelada. responsavel_id vazio => sem responsavel.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
require_once __DIR__ . "/../../includes/acoes.php";
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
    json_erro("Acao nao informada.", 400);
}

$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    json_response(["ok" => false, "error" => "Responsavel invalido.", "errors" => ["responsavel_id" => "Usuario invalido."]], 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

// Gestor/Admin, key user do setor da demanda ou o proprio responsavel atual.
$perfil = obter_usuario_logado_perfil();
$eh_gestor = ($perfil === "administrador" || $perfil === "gestor");
$eh_keyuser = usuario_eh_keyuser_da_demanda($acao["demanda_id"], obter_usuario_logado_id());
$eh_responsavel = (int) $acao["responsavel_id"] === obter_usuario_logado_id();
if (!$eh_gestor && !$eh_keyuser && !$eh_responsavel) {
    json_response(["ok" => false, "error" => "Sem permissao para alterar o responsavel."], 403);
}

if ($acao["status"] === "concluida" || $acao["status"] === "cancelada") {
    json_erro("Nao e possivel alterar o responsavel desta tarefa.", 409);
}

if (!definir_responsavel_acao($id, $responsavel_id)) {
    json_erro("Nao foi possivel atualizar o responsavel.", 500);
}

registrar_log("acao_responsavel_alterado", "acao_id=" . $id . " responsavel_id=" . ($responsavel_id === null ? "null" : $responsavel_id));

// Avisa o novo responsavel (se houver e nao for o proprio ator).
if ($responsavel_id !== null && $responsavel_id !== obter_usuario_logado_id()) {
    notificar_varios(
        [$responsavel_id],
        obter_usuario_logado_id(),
        "atribuicao",
        "Você foi atribuído a uma tarefa",
        $acao["titulo"],
        "demanda.html?id=" . $acao["demanda_id"]
    );
}

json_sucesso(null, "Responsável atualizado.");
