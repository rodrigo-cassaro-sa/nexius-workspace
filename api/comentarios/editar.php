<?php

// api/comentarios/editar.php
// Edita um comentario. Apenas o AUTOR pode editar o proprio. Ninguem exclui.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/comentarios.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$body = ler_json_entrada();
if ($body === null) {
    json_erro("Dados invalidos.", 400);
}

$id = isset($body["id"]) ? (int) $body["id"] : 0;
$texto = trim($body["texto"] ?? "");

if ($id <= 0) {
    json_erro("Comentario nao informado.", 400);
}
if (!validar_tamanho($texto, 1, 2000)) {
    json_response(["ok" => false, "error" => "Escreva um comentario.", "errors" => ["texto" => "Comentario vazio ou muito longo."]], 400);
}

$comentario = buscar_comentario($id);
if (!$comentario) {
    json_erro("Comentario nao encontrado.", 404);
}

// Apenas o autor edita o proprio comentario.
if ((int) $comentario["autor_id"] !== obter_usuario_logado_id()) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

if (!editar_comentario($id, $texto)) {
    json_erro("Nao foi possivel salvar o comentario.", 500);
}

registrar_log("comentario_editado", "comentario_id=" . $id);

json_sucesso(null, "Comentario atualizado.");
