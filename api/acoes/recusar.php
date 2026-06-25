<?php

// api/acoes/recusar.php
// Recusa uma tarefa de ENTREGA, exigindo um motivo. Apenas Administrador e Gestor (D19).
// So vale para acao do tipo 'entrega' e que ainda esteja pendente.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/notificacoes.php";

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
$motivo = trim($body["motivo"] ?? "");

if ($id <= 0) {
    json_erro("Acao nao informada.", 400);
}
if (!validar_tamanho($motivo, 3, 2000)) {
    json_response(["ok" => false, "error" => "Explique o motivo da recusa.", "errors" => ["motivo" => "Motivo obrigatorio (3 a 2000 caracteres)."]], 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

if ($acao["tipo"] !== "entrega") {
    json_erro("So tarefas de entrega podem ser recusadas.", 409);
}
if ($acao["status"] !== "pendente") {
    json_erro("Esta entrega nao pode ser recusada.", 409);
}

if (!recusar_acao($id, $motivo)) {
    json_erro("Nao foi possivel recusar a entrega.", 500);
}

registrar_log("acao_recusada", "acao_id=" . $id);

// Notifica o responsavel pela acao (se houver) que a entrega foi recusada.
if ($acao["responsavel_id"] !== null) {
    notificar_varios(
        [(int) $acao["responsavel_id"]],
        obter_usuario_logado_id(),
        "status",
        "Entrega recusada",
        $acao["titulo"],
        "demanda.html?id=" . $acao["demanda_id"]
    );
}

json_sucesso(null, "Entrega recusada.");
