<?php

// api/acoes/definir-prazo.php
// Prorrogacao/ajuste de prazo de uma acao a partir do roadmap (D23).
// Permissao: Gestor/Admin OU o key user (responsavel principal) do setor da demanda.
// Nao reagenda acao concluida ou cancelada. prazo vazio => limpa o prazo.

require_once __DIR__ . "/../../includes/bootstrap.php";
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

$prazo = trim($body["prazo"] ?? "");
if ($prazo === "") {
    $prazo = null;
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $prazo)) {
    json_response(["ok" => false, "error" => "Data invalida.", "errors" => ["prazo" => "Use uma data valida (AAAA-MM-DD)."]], 400);
}

$acao = buscar_acao($id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

// Gestor/Admin ou key user do setor da demanda podem ajustar o prazo.
$perfil = obter_usuario_logado_perfil();
$eh_gestor = ($perfil === "administrador" || $perfil === "gestor");
$eh_keyuser = usuario_eh_keyuser_da_demanda($acao["demanda_id"], obter_usuario_logado_id());
if (!$eh_gestor && !$eh_keyuser) {
    json_response(["ok" => false, "error" => "Sem permissao para alterar o prazo."], 403);
}

// Nao reagenda o que ja saiu do fluxo.
if ($acao["status"] === "concluida" || $acao["status"] === "cancelada") {
    json_erro("Nao e possivel alterar o prazo desta tarefa.", 409);
}

if (!definir_prazo_acao($id, $prazo)) {
    json_erro("Nao foi possivel atualizar o prazo.", 500);
}

registrar_log("acao_prazo_alterado", "acao_id=" . $id . " prazo=" . ($prazo === null ? "null" : $prazo));

// Avisa o responsavel sobre a mudanca de prazo (se houver e nao for o proprio ator).
if ($acao["responsavel_id"] !== null && (int) $acao["responsavel_id"] !== obter_usuario_logado_id()) {
    notificar_varios(
        [(int) $acao["responsavel_id"]],
        obter_usuario_logado_id(),
        "status",
        "Prazo de tarefa alterado",
        $acao["titulo"],
        "demanda.html?id=" . $acao["demanda_id"]
    );
}

json_sucesso(null, "Prazo atualizado.");
