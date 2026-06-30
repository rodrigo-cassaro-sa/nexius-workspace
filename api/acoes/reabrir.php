<?php

// api/acoes/reabrir.php
// Reabre uma tarefa RECUSADA: volta para 'pendente' para retomar o fluxo (melhoria #4).
// Apenas Administrador e Gestor (mesma alcada que recusa). So vale para acao 'recusada'.

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
if ($id <= 0) {
    json_erro("Acao nao informada.", 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

if ($acao["status"] !== "recusada") {
    json_erro("So tarefas recusadas podem ser reabertas.", 409);
}

if (!reabrir_acao($id)) {
    json_erro("Nao foi possivel reabrir a tarefa.", 500);
}

registrar_log("acao_reaberta", "acao_id=" . $id);

// Notifica o responsavel que a tarefa foi reaberta (precisa retomar/reentregar).
if ($acao["responsavel_id"] !== null) {
    notificar_varios(
        [(int) $acao["responsavel_id"]],
        obter_usuario_logado_id(),
        "status",
        "Tarefa reaberta",
        $acao["titulo"],
        "demanda.html?id=" . $acao["demanda_id"]
    );
}

json_sucesso(null, "Tarefa reaberta.");
