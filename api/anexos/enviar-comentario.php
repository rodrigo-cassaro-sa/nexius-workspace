<?php

// api/anexos/enviar-comentario.php
// Recebe anexos (multipart/form-data) e os vincula a um COMENTARIO de acao.
// So o autor do comentario pode anexar nele. Mesma pasta privada e mesma validacao
// dos anexos de demanda (ver includes/anexos.php). O demanda_id e derivado da acao
// do comentario e gravado para manter o escopo de visibilidade/download uniforme.

require_once __DIR__ . "/../../includes/bootstrap.php";
require_once __DIR__ . "/../../includes/acoes.php";
require_once __DIR__ . "/../../includes/comentarios.php";
require_once __DIR__ . "/../../includes/anexos.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    json_response(["ok" => false, "error" => "Metodo nao permitido."], 405);
}

exigir_login();

$comentario_id = isset($_POST["comentario_id"]) ? (int) $_POST["comentario_id"] : 0;
if ($comentario_id <= 0) {
    json_erro("Comentario nao informado.", 400);
}

$comentario = buscar_comentario($comentario_id);
if (!$comentario) {
    json_erro("Comentario nao encontrado.", 404);
}

// Apenas o autor do comentario anexa nele.
if ((int) $comentario["autor_id"] !== obter_usuario_logado_id()) {
    json_response(["ok" => false, "error" => "Sem permissao."], 403);
}

$acao = buscar_acao((int) $comentario["acao_id"]);
if (!$acao) {
    json_erro("Acao nao encontrada.", 404);
}

$resultado = processar_anexos_upload(
    $_FILES["arquivos"] ?? [],
    (int) $acao["demanda_id"],
    $comentario_id,
    obter_usuario_logado_id()
);

if (!$resultado["ok"]) {
    json_erro($resultado["erro"], $resultado["status"]);
}

json_sucesso(
    ["salvos" => $resultado["salvos"], "rejeitados" => $resultado["rejeitados"]],
    "Anexos processados."
);
