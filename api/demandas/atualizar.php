<?php

// api/demandas/atualizar.php
// Edita uma demanda (titulo, descricao, responsavel, status de edicao). Gestor e Admin.
// O status "concluida" nunca e definido aqui (vem da acao chave).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/usuarios.php";
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
$titulo = trim($body["titulo"] ?? "");
$descricao = trim($body["descricao"] ?? "");
$status = trim($body["status"] ?? "");
$responsavel_id = isset($body["responsavel_id"]) && $body["responsavel_id"] !== "" ? (int) $body["responsavel_id"] : null;

$erros = [];
if ($id <= 0) {
    json_erro("Demanda nao informada.", 400);
}
if (!validar_tamanho($titulo, 2, 160)) {
    $erros["titulo"] = "Informe um titulo (2 a 160 caracteres).";
}
if (!valor_em_lista($status, status_demanda_edicao())) {
    $erros["status"] = "Status invalido.";
}
if ($responsavel_id !== null && !usuario_ativo_existe($responsavel_id)) {
    $erros["responsavel_id"] = "Responsavel invalido.";
}
if (!empty($erros)) {
    json_response(["ok" => false, "error" => "Verifique os campos.", "errors" => $erros], 400);
}

$demanda = buscar_demanda($id);
if (!$demanda) {
    json_erro("Demanda nao encontrada.", 404);
}

if (!atualizar_demanda($id, $titulo, $descricao !== "" ? $descricao : null, $responsavel_id, $status)) {
    json_erro("Nao foi possivel salvar a demanda.", 500);
}

registrar_log("demanda_atualizada", "demanda_id=" . $id);

$ator = obter_usuario_logado_id();

// Atribuicao: responsavel mudou.
if ($responsavel_id !== null && (int) $demanda["responsavel_id"] !== $responsavel_id) {
    notificar_varios([$responsavel_id], $ator, "atribuicao", "Você foi atribuído a uma demanda", $titulo, "demanda.html?id=" . $id);
}

// Mudanca de status: avisa o responsavel atual (se houver e nao for o ator).
if ($demanda["status"] !== $status && $responsavel_id !== null) {
    notificar_varios([$responsavel_id], $ator, "status", "Status da demanda alterado", $titulo, "demanda.html?id=" . $id);
}

json_sucesso(null, "Demanda salva.");
