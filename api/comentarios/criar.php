<?php

// api/comentarios/criar.php
// Cria um comentario em uma acao. Pode comentar quem ve a demanda (Admin/Gestor ou envolvido).

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/demandas.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/comentarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$acao_id = isset($body["acao_id"]) ? (int) $body["acao_id"] : 0;
$texto = trim($body["texto"] ?? "");

if ($acao_id <= 0) {
    json_erro("Acao nao informada.", 400);
}
if (!validar_tamanho($texto, 1, 2000)) {
    json_response(["ok" => false, "error" => "Escreva um comentario.", "errors" => ["texto" => "Comentario vazio ou muito longo."]], 400);
}

$acao = buscar_acao($acao_id);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

if (obter_usuario_logado_perfil() === "colaborador") {
    if (!colaborador_envolvido_na_demanda($acao["demanda_id"], obter_usuario_logado_id())) {
        json_response(["ok" => false, "error" => "Sem permissao."], 403);
    }
}

$id = criar_comentario($acao_id, obter_usuario_logado_id(), $texto);
if (!$id) {
    json_erro("Nao foi possivel salvar o comentario.", 500);
}

registrar_log("comentario_criado", "comentario_id=" . $id . " acao_id=" . $acao_id);

json_sucesso(["id" => $id], "Comentario adicionado.");
