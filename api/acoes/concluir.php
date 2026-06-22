<?php

// api/acoes/concluir.php
// Conclui uma acao. Apenas o RESPONSAVEL da acao.
// Bloqueia se houver pre-requisito pendente. Se for a acao chave, conclui a demanda.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";

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

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

// So o responsavel conclui a propria acao.
if ((int) $acao["responsavel_id"] !== obter_usuario_logado_id()) {
    json_response(["ok" => false, "error" => "Apenas o responsavel pode concluir esta acao."], 403);
}

if ($acao["status"] !== "pendente") {
    json_erro("Esta acao nao pode ser concluida.", 409);
}

// Bloqueio por pre-requisito.
if (acao_prereqs_pendentes($id) > 0) {
    json_erro("Conclua os pre-requisitos antes de concluir esta acao.", 409);
}

$conn = conectar_banco();
mysqli_begin_transaction($conn);

$ok = concluir_acao($id);

// Acao chave conclui a demanda.
if ($ok && (int) $acao["chave"] === 1) {
    $ok = concluir_demanda_por_acao_chave($acao["demanda_id"]);
}

if (!$ok) {
    mysqli_rollback($conn);
    json_erro("Nao foi possivel concluir a acao.", 500);
}

mysqli_commit($conn);
registrar_log("acao_concluida", "acao_id=" . $id);

json_sucesso(null, (int) $acao["chave"] === 1 ? "Acao chave concluida. Demanda concluida." : "Acao concluida.");
